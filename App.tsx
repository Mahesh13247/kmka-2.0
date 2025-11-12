import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { VideoGrid } from "./components/VideoGrid";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { getVideos } from "./services/epornerService";
import type { Video, EpornerApiParams } from "./types";
import { useFavorites } from "./hooks/useFavorites";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { Chatbot } from "./components/Chatbot";
import { FilterProvider, useFilters } from "./contexts/FilterContext";
import { FilterPanel } from "./components/FilterPanel";
import { Toast } from "./components/Toast";

interface CurrentFilterParams {
  order: string;
  category: string;
  duration: [number, number];
}

const VideoContent: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"search" | "favorites">("search");
  const [toast, setToast] = useState<{
    message: string;
    type: "success";
  } | null>(null);

  const { order, category, duration } = useFilters();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const fetchVideos = useCallback(
    async (
      currentParams: CurrentFilterParams,
      query: string,
      currentPage: number
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const [duration_min, duration_max] = currentParams.duration;
        const params: EpornerApiParams = {
          order: currentParams.order,
          category: currentParams.category,
          query,
          page: currentPage,
          per_page: 30,
          duration_min: duration_min > 0 ? duration_min : undefined,
          duration_max: duration_max > 0 ? duration_max : undefined,
        };
        const newVideos = await getVideos(params);
        if (newVideos.length === 0) {
          setHasMore(false);
        } else {
          setVideos((prev) => {
            const result =
              currentPage === 1 ? newVideos : [...prev, ...newVideos];
            return result;
          });
          setHasMore(newVideos.length >= 30);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Fetch initial videos on first load
    if (isInitialLoad && viewMode === "search") {
      setIsInitialLoad(false);
      setPage(1);
      setVideos([]);
      setHasMore(true);
      fetchVideos({ order, category, duration }, "", 1);
    }
  }, [isInitialLoad, viewMode]);

  useEffect(() => {
    if (!isInitialLoad && viewMode === "search") {
      const handler = setTimeout(() => {
        setPage(1);
        setVideos([]);
        setHasMore(true);
        // Always fetch videos when filters change, even without a search query
        fetchVideos({ order, category, duration }, searchQuery || "", 1);
      }, 300); // Debounce search/filter changes
      return () => clearTimeout(handler);
    }
  }, [searchQuery, order, category, duration, viewMode, isInitialLoad]);

  useEffect(() => {
    if (viewMode === "search" && page > 1) {
      fetchVideos({ order, category, duration }, searchQuery || "", page);
    }
  }, [page, viewMode, order, category, duration, searchQuery, fetchVideos]);

  const handleSearch = useCallback((query: string) => {
    setViewMode("search");
    setSearchQuery(query);
  }, []);

  const handleToggleFavoritesView = () => {
    setViewMode((prevMode) =>
      prevMode === "favorites" ? "search" : "favorites"
    );
  };

  const handleSelectVideo = async (video: Video) => {
    setSelectedVideo(video);
    setIsLoadingRelated(true);
    setRelatedVideos([]);
    try {
      const fetchedRelated = await getVideos({
        query: video.title.split(" ")[0],
        page: 1,
        per_page: 20, // Fetch more related videos
        order: "latest",
        category: "",
      });
      setRelatedVideos(fetchedRelated.filter((v) => v.id !== video.id));
    } catch (err) {
      console.error("Failed to fetch related videos:", err);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    setRelatedVideos([]);
  };

  const toggleFavorite = (video: Video) => {
    const isCurrentlyFavorite = isFavorite(video.id);
    if (isCurrentlyFavorite) {
      removeFavorite(video.id);
      setToast({ message: "Removed from favorites", type: "success" });
    } else {
      addFavorite(video);
      setToast({ message: "Added to favorites", type: "success" });
    }
  };

  const isFavoritesView = viewMode === "favorites";
  const videosToShow = isFavoritesView ? favorites : videos;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header
        onSearch={handleSearch}
        onToggleFavoritesView={handleToggleFavoritesView}
        isFavoritesView={isFavoritesView}
      />
      <FilterPanel />
      <main className="container mx-auto px-4 py-8 pt-20 md:pt-24">
        <div
          key={`${viewMode}-${videos.length}-${category}`}
          className="animate-fade-in"
        >
          <VideoGrid
            videos={videosToShow}
            onSelectVideo={handleSelectVideo}
            isLoading={!isFavoritesView && isLoading}
            error={isFavoritesView ? null : error}
            lastVideoElementRef={
              isFavoritesView ? undefined : lastVideoElementRef
            }
            toggleFavorite={toggleFavorite}
            favorites={favorites.map((f) => f.id)}
            viewMode={viewMode}
          />
        </div>
      </main>
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={handleCloseModal}
          relatedVideos={relatedVideos}
          onSelectRelated={handleSelectVideo}
          isLoadingRelated={isLoadingRelated}
        />
      )}
      <FloatingActionButton
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        isOpen={isChatbotOpen}
      />
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <FilterProvider>
    <VideoContent />
  </FilterProvider>
);

export default App;

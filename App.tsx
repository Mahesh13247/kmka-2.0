import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { VideoGrid } from "./components/VideoGrid";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { CategoryBar } from "./components/CategoryBar";
import { getVideos } from "./services/epornerService";
import type { Video, EpornerApiParams } from "./types";
import { useFavorites } from "./hooks/useFavorites";
import { usePWA } from "./hooks/usePWA";
import { Toast } from "./components/Toast";
import { InstallAppPrompt } from "./components/InstallAppPrompt";

const DEFAULT_ORDER = "latest";
const DEFAULT_CATEGORY = "";
const RESULTS_PER_PAGE = 30;

const VideoContent: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY);
  const [sortBy, setSortBy] = useState<string>(DEFAULT_ORDER);
  const [viewMode, setViewMode] = useState<"search" | "favorites">("search");
  const [toast, setToast] = useState<{
    message: string;
    type: "success";
  } | null>(null);

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { 
    showInstallPrompt, 
    isStandalone, 
    deferredPrompt, 
    handleInstallApp, 
    closeInstallPrompt 
  } = usePWA();

  const observer = useRef<IntersectionObserver | null>(null);
  const activeRequestIdRef = useRef(0);
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
    async (query: string, currentPage: number) => {
      const requestId = ++activeRequestIdRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const params: EpornerApiParams = {
          order: sortBy,
          category: selectedCategory,
          query,
          page: currentPage,
          per_page: RESULTS_PER_PAGE,
        };
        const newVideos = await getVideos(params);
        if (requestId !== activeRequestIdRef.current) {
          return;
        }
        if (newVideos.length === 0) {
          setHasMore(false);
          if (currentPage === 1) {
            setVideos([]);
          }
        } else {
          setVideos((prev) => {
            const result =
              currentPage === 1 ? newVideos : [...prev, ...newVideos];
            return result;
          });
          setHasMore(newVideos.length >= RESULTS_PER_PAGE);
        }
      } catch (err) {
        if (requestId === activeRequestIdRef.current) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        }
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [selectedCategory, sortBy]
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
      fetchVideos("", 1);
    }
  }, [fetchVideos, isInitialLoad, viewMode]);

  useEffect(() => {
    if (!isInitialLoad && viewMode === "search") {
      const handler = setTimeout(() => {
        setPage(1);
        setVideos([]);
        setHasMore(true);
        // Always fetch videos when search query changes
        fetchVideos(searchQuery || "", 1);
      }, 300); // Debounce search/filter changes
      return () => clearTimeout(handler);
    }
  }, [fetchVideos, searchQuery, viewMode, isInitialLoad, selectedCategory, sortBy]);

  useEffect(() => {
    if (viewMode === "search" && page > 1) {
      fetchVideos(searchQuery || "", page);
    }
  }, [page, viewMode, searchQuery, fetchVideos, selectedCategory, sortBy]);

  const handleSearch = useCallback((query: string) => {
    setSelectedCategory(""); // Reset category on manual search
    setViewMode("search");
    setSearchQuery(query);
  }, []);

  const handleSelectFromBar = useCallback((value: string, type: 'category' | 'order') => {
    if (type === 'category') {
      setSelectedCategory(value);
      setSortBy(DEFAULT_ORDER); // Reset sort when picking a specific category
    } else {
      setSortBy(value);
      setSelectedCategory(""); // Reset category when picking a global sort
    }
    setSearchQuery(""); // Reset search on any bar select
    setPage(1);
    setVideos([]);
    setHasMore(true);
  }, []);

  const handleSelectSort = useCallback((sort: string) => {
    setSortBy(sort);
    setPage(1);
    setVideos([]);
    setHasMore(true);
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
        onInstallApp={deferredPrompt ? handleInstallApp : undefined}
        onSelectSort={handleSelectSort}
        currentSort={sortBy}
      />
      <main className="container mx-auto px-4 py-8 pt-20 md:pt-24">
        {viewMode === "search" && (
          <CategoryBar 
            selectedCategory={selectedCategory}
            selectedSort={sortBy}
            onSelect={handleSelectFromBar}
          />
        )}
        <div
          key={`${viewMode}-${searchQuery}`}
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {!isStandalone && (
        <InstallAppPrompt 
          isVisible={showInstallPrompt}
          onInstall={handleInstallApp}
          onClose={closeInstallPrompt}
        />
      )}
    </div>
  );
};

const App: React.FC = () => <VideoContent />;

export default App;

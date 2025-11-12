import React from "react";
import type { Video } from "../types";
import { VideoCard } from "./VideoCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { SearchIcon, StarIcon } from "./IconComponents";

interface VideoGridProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  isLoading: boolean;
  error: string | null;
  lastVideoElementRef?: (node: HTMLDivElement | null) => void;
  toggleFavorite: (video: Video) => void;
  favorites: string[];
  viewMode: "search" | "favorites";
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onSelectVideo,
  isLoading,
  error,
  lastVideoElementRef,
  toggleFavorite,
  favorites,
  viewMode,
}) => {
  if (error) {
    return <div className="text-center text-red-500 text-lg">{error}</div>;
  }

  const showEmptyState = !isLoading && videos.length === 0;

  if (showEmptyState) {
    return viewMode === "favorites" ? (
      <EmptyState
        icon={<StarIcon className="w-16 h-16" />}
        title="No Favorites Yet"
        message="Click the star icon on any video to add it to your collection."
      />
    ) : (
      <EmptyState
        icon={<SearchIcon className="w-16 h-16" />}
        title="No Videos Found"
        message="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
      {videos.map((video, index) => (
        <div
          key={`${video.id}-${index}`}
          ref={
            lastVideoElementRef && videos.length === index + 1
              ? lastVideoElementRef
              : null
          }
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <VideoCard
            video={video}
            onSelectVideo={onSelectVideo}
            toggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(video.id)}
          />
        </div>
      ))}
      {isLoading &&
        Array.from({ length: 10 }).map((_, i) => <LoadingSkeleton key={i} />)}
    </div>
  );
};

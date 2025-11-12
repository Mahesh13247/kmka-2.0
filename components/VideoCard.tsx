import React from 'react';
import type { Video } from '../types';
import { PlayIcon, StarIcon, EyeIcon, ClockIcon } from './IconComponents';

interface VideoCardProps {
    video: Video;
    onSelectVideo: (video: Video) => void;
    toggleFavorite: (video: Video) => void;
    isFavorite: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelectVideo, toggleFavorite, isFavorite }) => {
    
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(video);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onSelectVideo(video);
    }

    return (
        <div 
            className="group bg-gray-900 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 md:hover:scale-105 md:hover:shadow-2xl md:hover:shadow-gray-800/50"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectVideo(video)}
            aria-label={`Play video: ${video.title}`}
        >
            <div className="relative overflow-hidden">
                <img 
                    src={video.default_thumb.src} 
                    alt={video.title} 
                    className="w-full h-auto aspect-video object-cover transition-transform duration-300 md:group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <PlayIcon />
                </div>
                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.length_min}
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                     <button 
                        onClick={handleFavoriteClick} 
                        className={`p-1.5 bg-black bg-opacity-60 rounded-full transition-colors duration-200 ${isFavorite ? 'text-yellow-400' : 'text-white hover:text-yellow-300'}`}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <StarIcon filled={isFavorite} />
                    </button>
                    <button 
                        onClick={handleCardClick}
                        className="p-1.5 bg-black bg-opacity-60 rounded-full text-white hover:text-blue-300 transition-colors duration-200"
                        aria-label="Quick view"
                    >
                        <EyeIcon />
                    </button>
                </div>
            </div>
            <div className="p-2 md:p-3">
                <h3 className="text-sm font-medium text-white truncate group-hover:text-gray-200" title={video.title}>
                    {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                        <StarIcon filled={true} className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{video.rate}</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{video.added}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
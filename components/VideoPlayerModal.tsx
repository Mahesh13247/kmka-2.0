
import React, { useEffect, useRef, useState } from 'react';
import type { Video } from '../types';
import { CloseIcon, ClockIcon, StarIcon, LinkIcon, CopyIcon } from './IconComponents';

interface VideoPlayerModalProps {
    video: Video;
    onClose: () => void;
    relatedVideos: Video[];
    onSelectRelated: (video: Video) => void;
    isLoadingRelated: boolean;
}

const RelatedVideoCard: React.FC<{ video: Video; onClick: () => void }> = ({ video, onClick }) => (
    <div onClick={onClick} className="flex gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-800 transition-colors">
        <div className="relative flex-shrink-0">
            <img src={video.default_thumb.src} alt={video.title} className="w-28 h-16 object-cover rounded-md" loading="lazy" />
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                {video.length_min}
            </span>
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
            <h4 className="text-sm font-medium text-white truncate line-clamp-2" title={video.title}>{video.title}</h4>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                <span>{Number(video.views).toLocaleString()} views</span>
                <div className="flex items-center gap-1 text-yellow-400">
                    <StarIcon filled={true} className="h-3.5 w-3.5" />
                    <span>{video.rate}</span>
                </div>
            </div>
        </div>
    </div>
);

const RelatedVideoSkeleton: React.FC = () => (
    <div className="flex gap-3 p-2 animate-pulse">
        <div className="w-28 h-16 bg-gray-700 rounded-md flex-shrink-0"></div>
        <div className="flex-grow flex flex-col justify-center gap-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);


export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose, relatedVideos, onSelectRelated, isLoadingRelated }) => {
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleCopyLink = async () => {
        const videoUrl = `https://www.eporner.com/video-${video.id}/`;

        const fallbackCopy = () => {
            const textarea = document.createElement('textarea');
            textarea.value = videoUrl;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (!result) {
                throw new Error('Copy command was unsuccessful');
            }
        };

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(videoUrl);
            } else {
                fallbackCopy();
            }
            setIsLinkCopied(true);
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = setTimeout(() => setIsLinkCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link to clipboard:', error);
            setIsLinkCopied(false);
        }
    };
    
    const VideoInfo: React.FC = () => (
         <div className="p-3 md:p-4">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3">{video.title}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-4">
                <span>{Number(video.views).toLocaleString()} views</span>
                <div className="flex items-center gap-1.5">
                    <StarIcon filled={true} className="w-4 h-4 text-yellow-400"/>
                    <span>{video.rate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <ClockIcon />
                    <span>{video.added}</span>
                </div>
                <button onClick={handleCopyLink} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    {isLinkCopied ? <CopyIcon /> : <LinkIcon />}
                    <span>{isLinkCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {video.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean).slice(0, 15).map((keyword, index) => (
                    <span key={index} className="bg-gray-800 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );

    const RelatedVideosList: React.FC = () => (
        <>
            <h3 className="text-lg font-semibold p-3 md:p-4 border-b border-t-2 md:border-t-0 border-gray-800 flex-shrink-0">Up Next</h3>
            <div className="p-2">
                {isLoadingRelated && Array.from({ length: 5 }).map((_, i) => <RelatedVideoSkeleton key={i} />)}
                {!isLoadingRelated && relatedVideos.length === 0 && (
                    <p className="text-gray-400 text-center p-4">No related videos found.</p>
                )}
                {!isLoadingRelated && relatedVideos.map(relatedVideo => (
                    <RelatedVideoCard 
                        key={relatedVideo.id} 
                        video={relatedVideo} 
                        onClick={() => onSelectRelated(relatedVideo)}
                    />
                ))}
            </div>
        </>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-0"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-black shadow-xl w-full h-full max-w-6xl md:h-full md:max-h-[90vh] md:rounded-lg relative flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 z-20 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white transition-colors"
                    aria-label="Close video player"
                >
                    <CloseIcon className="h-6 w-6" />
                </button>

                {/* Desktop Layout */}
                <div className="hidden md:flex flex-row w-full h-full">
                    <div className="flex-grow flex flex-col bg-black">
                         <div className="w-full aspect-video flex-shrink-0 bg-black">
                            <iframe
                                key={video.id}
                                src={`https://www.eporner.com/embed/${video.id}`}
                                title={video.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                           <VideoInfo />
                        </div>
                    </div>
                     <aside className="w-96 flex-shrink-0 bg-gray-900 border-l-2 border-gray-800 flex flex-col">
                         <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <RelatedVideosList />
                         </div>
                    </aside>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col w-full h-full">
                    <div className="w-full aspect-video flex-shrink-0 bg-black">
                        <iframe
                            key={video.id}
                            src={`https://www.eporner.com/embed/${video.id}`}
                            title={video.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <VideoInfo />
                        <RelatedVideosList />
                    </div>
                </div>
            </div>
        </div>
    );
};
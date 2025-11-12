
import React from 'react';

export const LoadingSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden animate-pulse">
            <div className="w-full bg-gray-800 aspect-video"></div>
            <div className="p-3">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
};

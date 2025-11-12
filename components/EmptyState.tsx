import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 py-16 px-4">
            <div className="mb-4 text-gemini-purple opacity-80">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="max-w-xs">{message}</p>
        </div>
    );
};

import React from 'react';
import { BotIcon, CloseIcon } from './IconComponents';

interface FloatingActionButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, isOpen }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white text-black h-14 w-14 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 z-40"
            aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
        >
            {isOpen ? <CloseIcon /> : <BotIcon />}
        </button>
    );
};

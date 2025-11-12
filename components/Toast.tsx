import React, { useEffect, useState } from 'react';
import { StarIcon, CloseIcon } from './IconComponents';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            handleClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);
    
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow time for fade-out animation
    };

    const bgColor = type === 'success' ? 'bg-gray-800' : 'bg-red-500';
    const icon = type === 'success' ? <StarIcon filled className="w-5 h-5 text-yellow-400" /> : null;

    return (
        <div 
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 py-2 px-4 rounded-full shadow-lg text-white transition-all duration-300 border border-gray-700 ${bgColor} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            role="alert"
        >
            {icon}
            <span className="font-medium text-sm">{message}</span>
            <button onClick={handleClose} className="ml-2 p-1 rounded-full hover:bg-black/20">
                <CloseIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

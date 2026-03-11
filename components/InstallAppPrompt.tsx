import React, { useState, useEffect } from 'react';
import { DownloadIcon, CloseIcon, iOSShareIcon, StarIcon } from './IconComponents';

interface InstallAppPromptProps {
    onInstall: () => void;
    isVisible: boolean;
    onClose: () => void;
}

export const InstallAppPrompt: React.FC<InstallAppPromptProps> = ({ onInstall, isVisible, onClose }) => {
    const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        } else {
            setPlatform('desktop');
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-fade-in-up sm:left-auto sm:right-6 sm:w-80">
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
                >
                    <CloseIcon className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                         {/* Using a placeholder for the app icon, ideally this would be the actual pwa-192x192.png */}
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-yellow-400" filled />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">18+ studymaterial</h3>
                        <p className="text-gray-400 text-sm leading-tight">Install the app for a faster, better experience.</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    {platform === 'ios' ? (
                        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                            <p className="text-xs text-gray-300 flex items-center flex-wrap gap-1">
                                Tap <iOSShareIcon className="h-4 w-4 inline text-blue-400" /> then <span className="font-bold text-white">"Add to Home Screen"</span>
                            </p>
                        </div>
                    ) : (
                        <button 
                            onClick={onInstall}
                            className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <DownloadIcon className="h-5 w-5" />
                            Install App
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="w-full bg-transparent text-gray-400 text-xs font-medium hover:text-white transition-colors py-1"
                    >
                        Not now, maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

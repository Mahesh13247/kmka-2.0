import React, { useState } from 'react';
import { SearchIcon, StarIcon, ArrowLeftIcon, CloseIcon } from './IconComponents';

interface HeaderProps {
    onSearch: (query: string) => void;
    onToggleFavoritesView: () => void;
    isFavoritesView: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onToggleFavoritesView, isFavoritesView }) => {
    const [query, setQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
        setIsSearchOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (!isSearchOpen) { // Trigger search on desktop as user types
             onSearch(e.target.value);
        }
    };
    
    const handleClearSearch = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-black bg-opacity-70 backdrop-blur-lg z-30 p-3 md:p-4 border-b border-gray-800">
            <div className="container mx-auto flex items-center justify-between gap-4">
                {/* Mobile Search View */}
                <div className={`absolute inset-0 bg-black p-3 flex items-center gap-2 transition-transform duration-300 md:hidden ${isSearchOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button onClick={() => setIsSearchOpen(false)} className="p-2 text-white">
                        <ArrowLeftIcon />
                    </button>
                    <form onSubmit={handleSearchSubmit} className="relative flex-grow">
                        <input
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search videos..."
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Search videos"
                            autoFocus
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <SearchIcon />
                        </div>
                         {query && (
                            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                                <CloseIcon className="h-5 w-5 text-gray-400" />
                            </button>
                        )}
                    </form>
                </div>
                
                {/* Default View */}
                <h1 className="text-xl md:text-2xl font-bold text-white whitespace-nowrap ">
                    <a href="https://mahesh13247.github.io/kmka-2.0/">
                    <span className="text-white flex ">
                        Study Matrial <p className="text-[10px] text-[#FFFF00] pl-1">(Made By <span className="text-[#ADFF2F]">Mahesh</span> ⭐)</p>
                    </span></a>
                </h1>
                
                <form onSubmit={handleSearchSubmit} className="relative hidden md:block md:flex-grow max-w-lg">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder="Search videos..."
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                        aria-label="Search videos"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon />
                    </div>
                     {query && (
                        <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                            <CloseIcon className="h-5 w-5 text-gray-400" />
                        </button>
                    )}
                </form>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white md:hidden"
                        aria-label="Open search"
                    >
                        <SearchIcon />
                    </button>
                    <button 
                        onClick={onToggleFavoritesView}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={isFavoritesView ? "Back to search" : "View favorites"}
                    >
                        <StarIcon filled={isFavoritesView} />
                    </button>
                </div>
            </div>
        </header>
    );
};
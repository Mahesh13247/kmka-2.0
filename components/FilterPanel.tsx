
import React, { useEffect, useRef } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { CloseIcon } from './IconComponents';

export const FilterPanel: React.FC = () => {
    const { 
        isPanelOpen, 
        togglePanel, 
        categories,
        stagedOrder,
        setStagedOrder,
        stagedCategory,
        setStagedCategory,
        stagedDuration,
        setStagedDuration,
        applyFilters,
        resetFilters
    } = useFilters();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                togglePanel();
            }
        };

        if (isPanelOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isPanelOpen, togglePanel]);

    if (!isPanelOpen) {
        return null;
    }
    
    const handleMinDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const min = Math.max(0, parseInt(e.target.value, 10) || 0);
        const currentMax = stagedDuration[1];
        setStagedDuration([min, currentMax > 0 ? Math.max(min, currentMax) : 0]);
    };
    
    const handleMaxDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const max = Math.max(0, parseInt(e.target.value, 10) || 0);
        const currentMin = stagedDuration[0];
        setStagedDuration([currentMin, max < currentMin && max > 0 ? currentMin : max]);
    };


    return (
        <div 
            className="fixed inset-0 z-50" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="filter-panel-title"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" onClick={togglePanel}></div>

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-gray-900 shadow-xl flex flex-col animate-slide-in-left"
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 id="filter-panel-title" className="text-lg font-semibold text-white">Filters</h2>
                    <button 
                        onClick={togglePanel}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Close filters"
                    >
                        <CloseIcon />
                    </button>
                </header>

                <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <label htmlFor="sort-order" className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                        <select 
                            id="sort-order"
                            value={stagedOrder}
                            onChange={(e) => setStagedOrder(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gemini-purple"
                        >
                            <option value="latest">Latest</option>
                            <option value="top-rated">Top Rated</option>
                            <option value="most-viewed">Most Viewed</option>
                            <option value="longest">Longest</option>
                            <option value="shortest">Shortest</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                        <select 
                            id="category-filter"
                            value={stagedCategory}
                            onChange={(e) => setStagedCategory(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gemini-purple"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                        <div className="flex items-center gap-2 text-sm">
                            <input 
                                type="number"
                                value={stagedDuration[0] || ''}
                                onChange={handleMinDurationChange}
                                placeholder="Min"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gemini-purple [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="0"
                                aria-label="Minimum duration in minutes"
                            />
                            <span className="text-gray-500">-</span>
                            <input 
                                type="number"
                                value={stagedDuration[1] || ''}
                                onChange={handleMaxDurationChange}
                                placeholder="Max"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gemini-purple [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={stagedDuration[0] || 0}
                                aria-label="Maximum duration in minutes"
                            />
                        </div>
                         <p className="text-xs text-gray-500 mt-2">Leave max empty or 0 for no upper limit.</p>
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-800 flex items-center gap-3">
                     <button
                        onClick={resetFilters}
                        className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Reset
                    </button>
                     <button
                        onClick={applyFilters}
                        className="w-full bg-gemini-purple text-black font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
                    >
                        Apply Filters
                    </button>
                </footer>
            </div>
        </div>
    );
};

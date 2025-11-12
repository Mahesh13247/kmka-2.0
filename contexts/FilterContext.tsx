
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { getCategories } from '../services/epornerService';
import type { Category } from '../types';

interface FilterState {
    order: string;
    category: string;
    duration: [number, number]; // [min, max]
}

const DEFAULT_FILTERS: FilterState = {
    order: 'latest',
    category: '',
    duration: [0, 0], // 0 means no limit for either min or max
};

interface FilterContextType extends FilterState {
    isPanelOpen: boolean;
    togglePanel: () => void;
    categories: Category[];
    
    // Staged state for panel editing
    stagedOrder: string;
    setStagedOrder: (order: string) => void;
    stagedCategory: string;
    setStagedCategory: (category: string) => void;
    stagedDuration: [number, number];
    setStagedDuration: (duration: [number, number]) => void;
    
    // Actions
    applyFilters: () => void;
    resetFilters: () => void;
}


const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Applied filters, used by the main app for fetching
    const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

    // Staged filters, used for editing within the filter panel
    const [stagedFilters, setStagedFilters] = useState<FilterState>(DEFAULT_FILTERS);

    const togglePanel = useCallback(() => {
        setIsPanelOpen(prev => {
            // When opening the panel, sync staged filters with the currently applied filters
            if (!prev) {
                setStagedFilters(appliedFilters);
            }
            return !prev;
        });
    }, [appliedFilters]);

    const applyFilters = useCallback(() => {
        setAppliedFilters(stagedFilters);
        setIsPanelOpen(false);
    }, [stagedFilters]);
    
    const resetFilters = useCallback(() => {
        // Resets the filters within the panel to default, but doesn't apply them yet
        setStagedFilters(DEFAULT_FILTERS);
    }, []);

    const fetchApiCategories = useCallback(async () => {
        try {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    }, []);

    useEffect(() => {
        fetchApiCategories();
    }, [fetchApiCategories]);

    const value = {
        isPanelOpen,
        togglePanel,
        categories,
        order: appliedFilters.order,
        category: appliedFilters.category,
        duration: appliedFilters.duration,
        stagedOrder: stagedFilters.order,
        setStagedOrder: (order: string) => setStagedFilters(f => ({ ...f, order })),
        stagedCategory: stagedFilters.category,
        setStagedCategory: (category: string) => setStagedFilters(f => ({ ...f, category })),
        stagedDuration: stagedFilters.duration,
        setStagedDuration: (duration: [number, number]) => setStagedFilters(f => ({ ...f, duration })),
        applyFilters,
        resetFilters,
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = (): FilterContextType => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};

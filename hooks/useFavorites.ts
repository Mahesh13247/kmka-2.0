import { useState, useEffect, useCallback } from 'react';
import type { FavoriteVideo, Video } from '../types';

const FAVORITES_KEY = 'eporner_favorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Failed to load favorites from localStorage:', error);
        }
    }, []);

    // Fix: Refactored `saveFavorites` to only handle persisting data to localStorage.
    // The previous implementation also updated the state, creating a redundant and confusing
    // update cycle that likely caused the compiler errors.
    const saveFavorites = useCallback((newFavorites: FavoriteVideo[]) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Failed to save favorites to localStorage:', error);
        }
    }, []);

    const addFavorite = useCallback((video: Video) => {
        const newFavorite: FavoriteVideo = { ...video, favoritedAt: Date.now() };
        setFavorites(prevFavorites => {
            const updatedFavorites = [newFavorite, ...prevFavorites];
            saveFavorites(updatedFavorites);
            return updatedFavorites;
        });
    }, [saveFavorites]);

    const removeFavorite = useCallback((id: string) => {
        setFavorites(prevFavorites => {
            const updatedFavorites = prevFavorites.filter(fav => fav.id !== id);
            saveFavorites(updatedFavorites);
            return updatedFavorites;
        });
    }, [saveFavorites]);

    const isFavorite = useCallback((id: string) => {
        return favorites.some(fav => fav.id === id);
    }, [favorites]);

    return { favorites, addFavorite, removeFavorite, isFavorite };
};
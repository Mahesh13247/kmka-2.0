
import type { Video, Category, EpornerApiParams } from '../types';

const API_BASE_URL = 'https://www.eporner.com/api/v2';

const apiFetch = async <T,>(endpoint: string): Promise<T> => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const text = await response.text();
        // Handle cases where the API returns an empty body for a successful response
        if (!text) {
            return {} as T;
        }
        
        const data = JSON.parse(text);
        return data;
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        throw error;
    }
};

export const getVideos = async (params: EpornerApiParams): Promise<Video[]> => {
    const { query, page, per_page, order, category, duration_min, duration_max } = params;
    const searchParams = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        order,
    });
    if (query) searchParams.set('query', query);
    if (category) searchParams.set('category', category);
    if (duration_min !== undefined && duration_min > 0) searchParams.set('duration_min', duration_min.toString());
    if (duration_max !== undefined && duration_max > 0) searchParams.set('duration_max', duration_max.toString());


    const data = await apiFetch<{ videos: Video[] }>(`/video/search/?${searchParams.toString()}`);
    return data.videos || [];
};

export const getCategories = async (): Promise<Category[]> => {
    const data = await apiFetch<{ categories: Category[] }>('/video/categories/');
    return data.categories || [];
};

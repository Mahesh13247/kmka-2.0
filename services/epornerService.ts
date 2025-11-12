import type { Video, Category, EpornerApiParams } from "../types";

const API_BASE_URL = "https://www.eporner.com/api/v2";

const apiFetch = async <T>(endpoint: string): Promise<T> => {
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
  const { query, page, per_page, order, category, duration_min, duration_max } =
    params;
  const searchParams = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
    order,
  });
  if (query) searchParams.set("query", query);
  if (category) searchParams.set("category", category);
  if (duration_min !== undefined && duration_min > 0)
    searchParams.set("duration_min", duration_min.toString());
  if (duration_max !== undefined && duration_max > 0)
    searchParams.set("duration_max", duration_max.toString());

  const url = `/video/search/?${searchParams.toString()}`;
  const data = await apiFetch<{ videos: Video[] }>(url);
  return data.videos || [];
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/video/categories/`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      console.warn("Empty response from categories API, using fallback");
      return getFallbackCategories();
    }

    const data = JSON.parse(text);
    console.log("Categories API response:", data);

    // Handle different possible response structures
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    if (
      data.categories &&
      Array.isArray(data.categories) &&
      data.categories.length > 0
    ) {
      return data.categories;
    }
    if (data.list && Array.isArray(data.list) && data.list.length > 0) {
      return data.list;
    }

    console.warn("No categories found in response structure:", data);
    return getFallbackCategories();
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return getFallbackCategories();
  }
};

const getFallbackCategories = (): Category[] => [
  { id: "1", name: "Amateur", count: 1000 },
  { id: "2", name: "Anal", count: 1000 },
  { id: "3", name: "Asian", count: 1000 },
  { id: "4", name: "BBW", count: 1000 },
  { id: "5", name: "Blonde", count: 1000 },
  { id: "6", name: "Brunette", count: 1000 },
  { id: "7", name: "Mature", count: 1000 },
  { id: "8", name: "Teen", count: 1000 },
];

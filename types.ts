
export interface Video {
    id: string;
    title: string;
    keywords: string;
    views: number;
    rate: string;
    url: string;
    added: string;
    length_sec: number;
    length_min: string;
    embed_url: string;
    default_thumb: {
        src: string;
        height: number;
        width: number;
    };
    thumbs: {
        size: string;
        src: string;
        height: number;
        width: number;
    }[];
}

export interface EpornerApiParams {
    query: string;
    page: number;
    per_page: number;
    order: string;
    category: string;
    duration_min?: number;
    duration_max?: number;
}

export interface FavoriteVideo extends Video {
    favoritedAt: number;
}


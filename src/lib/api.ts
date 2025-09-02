const BASE_URL = "https://api.jikan.moe/v4";

export interface AnimeData {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  synopsis?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score?: number;
  episodes?: number;
  status?: string;
  type?: string;
  year?: number;
  genres?: Array<{ mal_id: number; name: string }>;
  studios?: Array<{ name: string }>;
  rating?: string;
  duration?: string;
  aired?: {
    from?: string;
    to?: string;
  };
  producers?: Array<{ name: string }>;
  demographics?: Array<{ name: string }>;
  themes?: Array<{ name: string }>;
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

// Cache for API requests to avoid hitting rate limits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function cachedFetch<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    cache.set(url, { data, timestamp: now });
    
    // Add delay to respect rate limits (Jikan allows 3 requests per second)
    await new Promise(resolve => setTimeout(resolve, 350));
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export const animeApi = {
  // Get top anime
  getTopAnime: async (type?: string, page = 1): Promise<JikanResponse<AnimeData[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
    });
    
    if (type) {
      params.append('type', type);
    }
    
    return cachedFetch(`${BASE_URL}/top/anime?${params}`);
  },

  // Get seasonal anime (currently airing)
  getSeasonalAnime: async (page = 1): Promise<JikanResponse<AnimeData[]>> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    let season: string;
    if (month >= 1 && month <= 3) season = 'winter';
    else if (month >= 4 && month <= 6) season = 'spring';
    else if (month >= 7 && month <= 9) season = 'summer';
    else season = 'fall';

    return cachedFetch(`${BASE_URL}/seasons/${year}/${season}?page=${page}`);
  },

  // Search anime
  searchAnime: async (query: string, page = 1, type?: string): Promise<JikanResponse<AnimeData[]>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: '24',
    });
    
    if (type) {
      params.append('type', type);
    }
    
    return cachedFetch(`${BASE_URL}/anime?${params}`);
  },

  // Get anime by ID
  getAnimeById: async (id: number): Promise<{ data: AnimeData }> => {
    return cachedFetch(`${BASE_URL}/anime/${id}`);
  },

  // Get anime characters
  getAnimeCharacters: async (id: number): Promise<JikanResponse<any[]>> => {
    return cachedFetch(`${BASE_URL}/anime/${id}/characters`);
  },

  // Get anime recommendations
  getAnimeRecommendations: async (id: number): Promise<JikanResponse<any[]>> => {
    return cachedFetch(`${BASE_URL}/anime/${id}/recommendations`);
  },

  // Get popular anime (most favorited)
  getPopularAnime: async (page = 1): Promise<JikanResponse<AnimeData[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      order_by: 'favorites',
      sort: 'desc',
    });
    
    return cachedFetch(`${BASE_URL}/anime?${params}`);
  },

  // Get movies
  getMovies: async (page = 1): Promise<JikanResponse<AnimeData[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      type: 'movie',
      order_by: 'score',
      sort: 'desc',
    });
    
    return cachedFetch(`${BASE_URL}/anime?${params}`);
  },

  // Get TV series
  getTVSeries: async (page = 1): Promise<JikanResponse<AnimeData[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      type: 'tv',
      order_by: 'score',
      sort: 'desc',
    });
    
    return cachedFetch(`${BASE_URL}/anime?${params}`);
  },

  // Get random anime for hero section
  getRandomAnime: async (): Promise<{ data: AnimeData }> => {
    return cachedFetch(`${BASE_URL}/random/anime`);
  },
};

export default animeApi;
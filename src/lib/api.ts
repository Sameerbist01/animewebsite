const BASE_URL = "https://aniwatch-v2-18-0.onrender.com";

export interface AnimeData {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  description?: string;
  stats?: {
    rating: string;
    quality: string;
    episodes: {
      sub: number;
      dub: number;
    };
    type: string;
    duration: string;
  };
  episodes?: {
    sub: number;
    dub: number;
  };
  type?: string;
  rating?: string;
  duration?: string;
  moreInfo?: {
    aired: string;
    genres: string[];
    status: string;
    studios: string;
    duration: string;
  };
  // Legacy fields for compatibility
  mal_id?: number;
  title?: string;
  title_english?: string;
  title_japanese?: string;
  synopsis?: string;
  images?: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score?: number;
  year?: number;
  genres?: Array<{ mal_id: number; name: string }> | string[];
  studios?: Array<{ name: string }>;
  aired?: {
    from?: string;
    to?: string;
  };
  producers?: Array<{ name: string }>;
  demographics?: Array<{ name: string }>;
  themes?: Array<{ name: string }>;
  status?: string;
}

export interface EpisodeData {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

export interface ServerData {
  serverId: number;
  serverName: string;
}

export interface StreamingData {
  headers: Record<string, string>;
  sources: Array<{
    url: string;
    isM3U8: boolean;
    quality?: string;
  }>;
  subtitles: Array<{
    lang: string;
    url: string;
  }>;
  anilistID?: number | null;
  malID?: number | null;
}

export interface AniwatchResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> extends AniwatchResponse<T> {
  data: T & {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
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
  // Get home page data
  getHomeData: async (): Promise<AniwatchResponse<{
    genres: string[];
    latestEpisodeAnimes: AnimeData[];
    spotlightAnimes: AnimeData[];
    top10Animes: {
      today: AnimeData[];
      week: AnimeData[];
      month: AnimeData[];
    };
    topAiringAnimes: AnimeData[];
    topUpcomingAnimes: AnimeData[];
    trendingAnimes: AnimeData[];
    mostPopularAnimes: AnimeData[];
    mostFavoriteAnimes: AnimeData[];
    latestCompletedAnimes: AnimeData[];
  }>> => {
    return cachedFetch(`${BASE_URL}/api/v2/hianime/home`);
  },

  // Get top anime (using most popular)
  getTopAnime: async (type?: string, page = 1): Promise<{ data: AnimeData[]; pagination?: any }> => {
    const homeData = await animeApi.getHomeData();
    return {
      data: homeData.data.mostPopularAnimes.slice(0, 25),
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: page,
        items: { count: 25, total: 25, per_page: 25 }
      }
    };
  },

  // Get seasonal anime (using top airing)
  getSeasonalAnime: async (page = 1): Promise<{ data: AnimeData[]; pagination?: any }> => {
    const homeData = await animeApi.getHomeData();
    return {
      data: homeData.data.topAiringAnimes.slice(0, 25),
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: page,
        items: { count: 25, total: 25, per_page: 25 }
      }
    };
  },

  // Search anime
  searchAnime: async (query: string, page = 1, type?: string): Promise<PaginatedResponse<{
    animes: AnimeData[];
    mostPopularAnimes: AnimeData[];
    searchQuery: string;
    searchFilters: Record<string, any>;
  }>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
    });
    
    if (type) {
      params.append('type', type);
    }
    
    return cachedFetch(`${BASE_URL}/api/v2/hianime/search?${params}`);
  },

  // Get anime by ID
  getAnimeById: async (id: string): Promise<AniwatchResponse<{
    anime: {
      info: {
        id: string;
        name: string;
        poster: string;
        description: string;
        stats: {
          rating: string;
          quality: string;
          episodes: { sub: number; dub: number };
          type: string;
          duration: string;
        };
      };
      moreInfo: {
        aired: string;
        genres: string[];
        status: string;
        studios: string;
        duration: string;
      };
    };
    mostPopularAnimes: AnimeData[];
    recommendedAnimes: AnimeData[];
    relatedAnimes: AnimeData[];
    seasons: Array<{
      id: string;
      name: string;
      title: string;
      poster: string;
      isCurrent: boolean;
    }>;
  }>> => {
    return cachedFetch(`${BASE_URL}/api/v2/hianime/anime/${id}`);
  },

  // Get anime episodes
  getAnimeEpisodes: async (id: string): Promise<AniwatchResponse<{
    totalEpisodes: number;
    episodes: EpisodeData[];
  }>> => {
    return cachedFetch(`${BASE_URL}/api/v2/hianime/anime/${id}/episodes`);
  },

  // Get episode servers
  getEpisodeServers: async (episodeId: string): Promise<AniwatchResponse<{
    episodeId: string;
    episodeNo: number;
    sub: ServerData[];
    dub: ServerData[];
    raw: ServerData[];
  }>> => {
    return cachedFetch(`${BASE_URL}/api/v2/hianime/episode/servers?animeEpisodeId=${episodeId}`);
  },

  // Get episode streaming links
  getEpisodeStreams: async (episodeId: string, server = "hd-1", category: "sub" | "dub" | "raw" = "sub"): Promise<AniwatchResponse<StreamingData>> => {
    return cachedFetch(`${BASE_URL}/api/v2/hianime/episode/sources?animeEpisodeId=${episodeId}&server=${server}&category=${category}`);
  },

  // Get anime characters (mock for compatibility)
  getAnimeCharacters: async (id: string): Promise<{ data: any[] }> => {
    return { data: [] };
  },

  // Get anime recommendations
  getAnimeRecommendations: async (id: string): Promise<{ data: AnimeData[] }> => {
    try {
      const animeData = await animeApi.getAnimeById(id);
      return { data: animeData.data.recommendedAnimes || [] };
    } catch {
      return { data: [] };
    }
  },

  // Get popular anime
  getPopularAnime: async (page = 1): Promise<{ data: AnimeData[]; pagination?: any }> => {
    const homeData = await animeApi.getHomeData();
    return {
      data: homeData.data.mostPopularAnimes.slice(0, 25),
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: page,
        items: { count: 25, total: 25, per_page: 25 }
      }
    };
  },

  // Get movies
  getMovies: async (page = 1): Promise<{ data: AnimeData[]; pagination?: any }> => {
    const searchData = await animeApi.searchAnime("", page, "movie");
    return {
      data: searchData.data.animes || [],
      pagination: {
        last_visible_page: searchData.data.totalPages,
        has_next_page: searchData.data.hasNextPage,
        current_page: searchData.data.currentPage,
        items: { count: 25, total: 25, per_page: 25 }
      }
    };
  },

  // Get TV series
  getTVSeries: async (page = 1): Promise<{ data: AnimeData[]; pagination?: any }> => {
    const searchData = await animeApi.searchAnime("", page, "tv");
    return {
      data: searchData.data.animes || [],
      pagination: {
        last_visible_page: searchData.data.totalPages,
        has_next_page: searchData.data.hasNextPage,
        current_page: searchData.data.currentPage,
        items: { count: 25, total: 25, per_page: 25 }
      }
    };
  },

  // Get random anime for hero section
  getRandomAnime: async (): Promise<{ data: AnimeData }> => {
    const homeData = await animeApi.getHomeData();
    const spotlightAnimes = homeData.data.spotlightAnimes;
    const randomIndex = Math.floor(Math.random() * spotlightAnimes.length);
    return { data: spotlightAnimes[randomIndex] };
  },
};

export default animeApi;
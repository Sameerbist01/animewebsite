import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/HeroSection";
import AnimeCard from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { animeApi, AnimeData } from "@/lib/api";

const HomePage = () => {
  const [featuredAnime, setFeaturedAnime] = useState<AnimeData | null>(null);

  // Get top anime for hero section
  const { data: topAnimeData } = useQuery({
    queryKey: ['top-anime'],
    queryFn: () => animeApi.getTopAnime(),
  });

  // Get seasonal anime (currently airing)
  const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
    queryKey: ['seasonal-anime'],
    queryFn: () => animeApi.getSeasonalAnime(),
  });

  // Get popular anime
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-anime'],
    queryFn: () => animeApi.getPopularAnime(),
  });

  // Get trending/top rated
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: () => animeApi.getTopAnime('tv'),
  });

  // Set featured anime from top anime
  useEffect(() => {
    if (topAnimeData?.data && topAnimeData.data.length > 0) {
      // Pick a random anime from top 10 for variety
      const randomIndex = Math.floor(Math.random() * Math.min(10, topAnimeData.data.length));
      setFeaturedAnime(topAnimeData.data[randomIndex]);
    }
  }, [topAnimeData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
        <HeroSection 
          featuredAnime={featuredAnime ? { 
            ...featuredAnime, 
            mal_id: parseInt(featuredAnime.id || "0"),
            title: featuredAnime.name,
            images: { jpg: { image_url: featuredAnime.poster, large_image_url: featuredAnime.poster } }
          } : undefined} 
          loading={!featuredAnime}
        />

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Top Airing Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold">Top Airing</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/top-airing">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {seasonalLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <AnimeCard key={i} anime={{} as AnimeData} loading={true} />
                ))
              : seasonalData?.data.slice(0, 12).map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))
            }
          </div>
        </section>

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/trending">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {trendingLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <AnimeCard key={i} anime={{} as AnimeData} loading={true} />
                ))
              : trendingData?.data.slice(0, 12).map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))
            }
          </div>
        </section>

        {/* Most Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-warning" />
              <h2 className="text-2xl md:text-3xl font-bold">Most Popular</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/popular">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {popularLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <AnimeCard key={i} anime={{} as AnimeData} loading={true} />
                ))
              : popularData?.data.slice(0, 12).map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))
            }
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="bg-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">Explore More</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-16">
              <Link to="/movies" className="flex flex-col items-center space-y-2">
                <span className="text-2xl">🎬</span>
                <span>Movies</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16">
              <Link to="/series" className="flex flex-col items-center space-y-2">
                <span className="text-2xl">📺</span>
                <span>TV Series</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16">
              <Link to="/genres" className="flex flex-col items-center space-y-2">
                <span className="text-2xl">🎭</span>
                <span>Genres</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16">
              <Link to="/random" className="flex flex-col items-center space-y-2">
                <span className="text-2xl">🎲</span>
                <span>Random</span>
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
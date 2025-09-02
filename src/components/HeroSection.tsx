import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Info, Star, Calendar, Tv } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis?: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  score?: number;
  episodes?: number;
  status?: string;
  type?: string;
  year?: number;
  genres?: Array<{ name: string }>;
}

interface HeroSectionProps {
  featuredAnime?: HeroAnime;
  loading?: boolean;
}

const HeroSection = ({ featuredAnime, loading = false }: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (loading || !featuredAnime) {
    return (
      <section className="relative h-[70vh] bg-muted skeleton overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="h-12 bg-muted-foreground/20 skeleton rounded mb-4"></div>
              <div className="h-4 bg-muted-foreground/20 skeleton rounded mb-2"></div>
              <div className="h-4 bg-muted-foreground/20 skeleton rounded w-3/4 mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-muted-foreground/20 skeleton rounded"></div>
                <div className="h-12 w-32 bg-muted-foreground/20 skeleton rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const displayTitle = featuredAnime.title_english || featuredAnime.title;
  const truncatedSynopsis = featuredAnime.synopsis
    ? featuredAnime.synopsis.length > 300
      ? featuredAnime.synopsis.substring(0, 300) + "..."
      : featuredAnime.synopsis
    : "No synopsis available.";

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${featuredAnime.images.jpg.large_image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {displayTitle}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {featuredAnime.score && (
              <div className="flex items-center">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                <span className="font-semibold">{featuredAnime.score}</span>
              </div>
            )}
            {featuredAnime.year && (
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{featuredAnime.year}</span>
              </div>
            )}
            {featuredAnime.episodes && (
              <div className="flex items-center">
                <Tv className="w-5 h-5 mr-2" />
                <span>{featuredAnime.episodes} Episodes</span>
              </div>
            )}
            {featuredAnime.type && (
              <Badge className="bg-primary text-primary-foreground border-0">
                {featuredAnime.type}
              </Badge>
            )}
            {featuredAnime.status === "Currently Airing" && (
              <Badge className="badge-sub border-0">
                AIRING
              </Badge>
            )}
          </div>

          {/* Genres */}
          {featuredAnime.genres && featuredAnime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {featuredAnime.genres.slice(0, 4).map((genre) => (
                <Badge
                  key={genre.name}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            {truncatedSynopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button size="lg" className="glow-primary">
              <Play className="w-5 h-5 mr-2" />
              Watch Now
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link to={`/anime/${featuredAnime.mal_id}`}>
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
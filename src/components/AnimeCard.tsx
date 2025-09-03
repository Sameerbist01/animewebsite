import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Star, Calendar, Tv, Play } from "lucide-react";
import { AnimeData } from "@/lib/api";

interface AnimeCardProps {
  anime: AnimeData;
  loading?: boolean;
  compact?: boolean;
}

const AnimeCard = ({ anime, loading = false, compact = false }: AnimeCardProps) => {
  if (loading) {
    return (
      <Card className="anime-card overflow-hidden">
        <div className="aspect-[3/4] bg-muted skeleton"></div>
        <CardContent className="p-4">
          <div className="h-4 bg-muted skeleton rounded mb-2"></div>
          <div className="h-3 bg-muted skeleton rounded w-2/3 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-5 bg-muted skeleton rounded w-12"></div>
            <div className="h-5 bg-muted skeleton rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayTitle = anime.name || anime.title || anime.title_english;
  const imageUrl = anime.poster || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  if (compact) {
    return (
        <Link to={`/anime/${anime.id || anime.mal_id}`} className="block">
        <Card className="anime-card overflow-hidden group cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={imageUrl}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <div className="bg-primary/90 rounded-full p-2 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            {/* Status badges */}
            <div className="absolute top-1 left-1">
              {anime.type && (
                <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
                  {anime.type}
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-2">
            <h4 className="font-medium text-xs mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {displayTitle}
            </h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{anime.year || "Unknown"}</span>
              {(anime.score || anime.stats?.rating) && (
                <span className="text-accent">⭐ {anime.score || anime.stats?.rating}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/anime/${anime.id || anime.mal_id}`} className="block">
      <Card className="anime-card overflow-hidden group cursor-pointer h-full">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay with badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              {(anime.score || anime.stats?.rating) && (
                <div className="flex items-center text-white mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{anime.score || anime.stats?.rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {(anime.type || anime.stats?.type) && (
              <Badge variant="secondary" className="text-xs font-medium bg-black/60 text-white border-0">
                {anime.type || anime.stats?.type}
              </Badge>
            )}
            {anime.status === "Currently Airing" && (
              <Badge className="text-xs font-medium badge-sub border-0">
                AIRING
              </Badge>
            )}
          </div>

          {/* Rating badge */}
          {(anime.rating || anime.stats?.rating) && (anime.rating || anime.stats?.rating) !== "None" && (
            <div className="absolute top-2 right-2">
              <Badge className="text-xs font-medium badge-rating border-0">
                {(anime.rating || anime.stats?.rating)?.toString().split(" ")[0]}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            {anime.year && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{anime.year}</span>
              </div>
            )}
            {(anime.episodes?.sub || anime.stats?.episodes?.sub || anime.episodes) && (
              <div className="flex items-center">
                <Tv className="w-3 h-3 mr-1" />
                <span>{(anime.episodes?.sub || anime.stats?.episodes?.sub || (typeof anime.episodes === 'number' ? anime.episodes : 0))} eps</span>
              </div>
            )}
          </div>

            {(anime.genres || anime.moreInfo?.genres) && (anime.genres || anime.moreInfo?.genres).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(anime.genres || anime.moreInfo?.genres).slice(0, 2).map((genre, index) => (
                  <Badge
                    key={typeof genre === 'string' ? genre : genre.mal_id || index}
                    variant="outline"
                    className="text-xs px-2 py-0 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    {typeof genre === 'string' ? genre : genre.name}
                  </Badge>
                ))}
                {(anime.genres || anime.moreInfo?.genres).length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0 border-border/50 text-muted-foreground"
                  >
                    +{(anime.genres || anime.moreInfo?.genres).length - 2}
                  </Badge>
                )}
              </div>
            )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default AnimeCard;
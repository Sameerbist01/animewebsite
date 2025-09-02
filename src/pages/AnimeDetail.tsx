import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Bookmark, Share2, Star, Calendar, Tv, Clock, Users, Building } from "lucide-react";
import { animeApi, AnimeData } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

const AnimeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const animeId = parseInt(id || "0");

  const { data: animeData, isLoading, error } = useQuery({
    queryKey: ['anime', animeId],
    queryFn: () => animeApi.getAnimeById(animeId),
    enabled: !!animeId,
  });

  const { data: charactersData } = useQuery({
    queryKey: ['anime-characters', animeId],
    queryFn: () => animeApi.getAnimeCharacters(animeId),
    enabled: !!animeId,
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ['anime-recommendations', animeId],
    queryFn: () => animeApi.getAnimeRecommendations(animeId),
    enabled: !!animeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 w-24 bg-muted skeleton rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] bg-muted skeleton rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="h-12 bg-muted skeleton rounded"></div>
              <div className="h-4 bg-muted skeleton rounded w-3/4"></div>
              <div className="h-4 bg-muted skeleton rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted skeleton rounded"></div>
                <div className="h-4 bg-muted skeleton rounded"></div>
                <div className="h-4 bg-muted skeleton rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
          <p className="text-muted-foreground mb-6">The anime you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const anime = animeData.data;
  const displayTitle = anime.title_english || anime.title;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Background */}
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${anime.images.jpg.large_image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-white hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <img
                src={anime.images.jpg.large_image_url}
                alt={displayTitle}
                className="w-full rounded-lg shadow-2xl anime-card"
              />
              <div className="mt-6 space-y-3">
                <Button size="lg" className="w-full glow-primary" asChild>
                  <Link to={`/anime/${animeId}/episode/1`}>
                    <Play className="w-5 h-5 mr-2" />
                    Watch Episode 1
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Bookmark
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                {/* Episode Quick Links */}
                {anime.episodes && anime.episodes > 1 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Quick Episodes</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: Math.min(anime.episodes, 9) }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          asChild
                        >
                          <Link to={`/anime/${animeId}/episode/${i + 1}`}>
                            Ep {i + 1}
                          </Link>
                        </Button>
                      ))}
                    </div>
                    {anime.episodes > 9 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground">
                        View All {anime.episodes} Episodes
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                {displayTitle}
              </h1>
              {anime.title_japanese && anime.title_japanese !== anime.title && (
                <p className="text-lg text-muted-foreground mb-4">{anime.title_japanese}</p>
              )}
              
              {anime.score && (
                <div className="flex items-center mb-4">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{anime.score}</span>
                  <span className="text-muted-foreground ml-2">/10</span>
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {anime.year && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{anime.year}</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center text-muted-foreground">
                  <Tv className="w-4 h-4 mr-2" />
                  <span>{anime.episodes} eps</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{anime.duration}</span>
                </div>
              )}
              {anime.type && (
                <div className="flex items-center text-muted-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  <span>{anime.type}</span>
                </div>
              )}
            </div>

            {/* Status and Rating */}
            <div className="flex flex-wrap gap-2">
              {anime.status && (
                <Badge 
                  className={anime.status === "Currently Airing" ? "badge-sub" : "badge-rating"}
                >
                  {anime.status}
                </Badge>
              )}
              {anime.rating && (
                <Badge variant="outline" className="border-border/50">
                  {anime.rating}
                </Badge>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge
                      key={genre.mal_id}
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">Synopsis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {anime.studios && anime.studios.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Studios
                  </h3>
                  <div className="space-y-1">
                    {anime.studios.map((studio, index) => (
                      <p key={index} className="text-muted-foreground">
                        {studio.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {anime.producers && anime.producers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Producers
                  </h3>
                  <div className="space-y-1">
                    {anime.producers.slice(0, 3).map((producer, index) => (
                      <p key={index} className="text-muted-foreground">
                        {producer.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendationsData?.data && recommendationsData.data.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {recommendationsData.data.slice(0, 12).map((rec: any) => (
                <AnimeCard key={rec.entry.mal_id} anime={rec.entry} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnimeDetail;
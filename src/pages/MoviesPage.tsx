import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";
import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

const MoviesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['movies', currentPage],
    queryFn: () => animeApi.getMovies(currentPage),
  });

  const loadMore = () => {
    if (moviesData?.pagination?.has_next_page) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Film className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Anime Movies</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover the best anime movies of all time
          </p>
        </div>

        {/* Loading State */}
        {isLoading && currentPage === 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <AnimeCard key={i} anime={{} as any} loading={true} />
            ))}
          </div>
        )}

        {/* Movies Grid */}
        {moviesData && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
              {moviesData.data.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>

            {/* Load More Button */}
            {moviesData.pagination?.has_next_page && (
              <div className="text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More Movies"}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-muted-foreground">
              Page {moviesData.pagination?.current_page} of {moviesData.pagination?.last_visible_page}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tv } from "lucide-react";
import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

const SeriesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: seriesData, isLoading } = useQuery({
    queryKey: ['tv-series', currentPage],
    queryFn: () => animeApi.getTVSeries(currentPage),
  });

  const loadMore = () => {
    if (seriesData?.pagination?.has_next_page) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Tv className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">TV Series</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore the highest-rated anime TV series
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

        {/* Series Grid */}
        {seriesData && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
              {seriesData.data.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>

            {/* Load More Button */}
            {seriesData.pagination?.has_next_page && (
              <div className="text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More Series"}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-muted-foreground">
              Page {seriesData.pagination?.current_page} of {seriesData.pagination?.last_visible_page}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;
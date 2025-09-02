import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

const PopularPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: popularData, isLoading } = useQuery({
    queryKey: ['popular-page', currentPage],
    queryFn: () => animeApi.getPopularAnime(currentPage),
  });

  const loadMore = () => {
    if (popularData?.pagination?.has_next_page) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-warning" />
            <h1 className="text-3xl md:text-4xl font-bold">Most Popular</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            The most favorited anime by the community
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

        {/* Popular Grid */}
        {popularData && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
              {popularData.data.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>

            {/* Load More Button */}
            {popularData.pagination?.has_next_page && (
              <div className="text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-muted-foreground">
              Page {popularData.pagination?.current_page} of {popularData.pagination?.last_visible_page}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PopularPage;
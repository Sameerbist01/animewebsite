import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");

  const query = searchParams.get("q") || "";

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query, currentPage, selectedType],
    queryFn: () => animeApi.searchAnime(query, currentPage, selectedType || undefined),
    enabled: !!query,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? "" : type);
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (searchResults?.data?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg search-input bg-card border-border focus:border-primary"
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by type:</span>
            </div>
            {["tv", "movie", "ova", "special", "ona"].map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedType === type 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={() => handleTypeFilter(type)}
              >
                {type.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Search Results for "{query}"
            </h1>
            {searchResults && (
              <p className="text-muted-foreground">
                Found results for your search
                {selectedType && ` in ${selectedType.toUpperCase()} category`}
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <AnimeCard key={i} anime={{} as any} loading={true} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive text-lg mb-4">
              Something went wrong while searching.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* No Results */}
        {searchResults && searchResults.data.animes && searchResults.data.animes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or removing filters.
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedType("");
              setSearchParams({});
            }}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {searchResults && searchResults.data.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
              {searchResults.data.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>

            {/* Load More Button */}
            {searchResults.data.hasNextPage && (
              <div className="text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Load More Results
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-muted-foreground">
              Page {searchResults.data.currentPage} of {searchResults.data.totalPages}
            </div>
          </>
        )}

        {/* Empty State (no search query) */}
        {!query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Search for Anime</h2>
            <p className="text-muted-foreground">
              Enter a title, genre, or any keyword to find your next favorite anime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
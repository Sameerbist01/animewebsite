import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  MessageCircle,
  Share2,
  Flag,
  Home,
  ChevronRight
} from "lucide-react";
import { animeApi, type AnimeData } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnimeCard from "@/components/AnimeCard";

interface Episode {
  id: string;
  title: string;
  number: number;
  isFiller?: boolean;
}

interface Server {
  id: string;
  name: string;
  type: "sub" | "dub";
}

const WatchPage = () => {
  const { animeId, episodeNumber } = useParams<{ animeId: string; episodeNumber: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [anime, setAnime] = useState<AnimeData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [recommendations, setRecommendations] = useState<AnimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Video options
  const [selectedServer, setSelectedServer] = useState("HD-1");
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [selectedType, setSelectedType] = useState<"sub" | "dub">("sub");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const servers: Server[] = [
    { id: "HD-1", name: "HD-1", type: "sub" },
    { id: "HD-2", name: "HD-2", type: "sub" },
    { id: "StreamSB", name: "StreamSB", type: "sub" },
    { id: "HD-1-DUB", name: "HD-1", type: "dub" },
    { id: "HD-2-DUB", name: "HD-2", type: "dub" },
  ];

  const qualities = ["360p", "480p", "720p", "1080p"];
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    const fetchData = async () => {
      if (!animeId) return;
      
      try {
        setLoading(true);
        const [animeResponse, recommendationsResponse] = await Promise.all([
          animeApi.getAnimeById(animeId),
          animeApi.getAnimeRecommendations(animeId)
        ]);
        
        setAnime(animeResponse.data.anime.info);
        
        // Mock episodes data based on anime episodes count
        const episodeCount = animeResponse.data.anime.info.stats.episodes.sub || 12;
        const mockEpisodes: Episode[] = Array.from({ length: episodeCount }, (_, i) => ({
          id: `${animeId}-ep-${i + 1}`,
          title: `Episode ${i + 1}`,
          number: i + 1,
          isFiller: Math.random() > 0.8 // Random filler episodes
        }));
        setEpisodes(mockEpisodes);
        
        // Get recommendations from the API response
        if (recommendationsResponse.data?.length) {
          setRecommendations(recommendationsResponse.data.slice(0, 12));
        }
      } catch (error) {
        console.error("Failed to fetch anime data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [animeId]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value / 100;
      setVolume(value);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = (value / 100) * duration;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePreviousEpisode = () => {
    const currentEp = parseInt(episodeNumber || "1");
    if (currentEp > 1) {
      navigate(`/anime/${animeId}/episode/${currentEp - 1}`);
    }
  };

  const handleNextEpisode = () => {
    const currentEp = parseInt(episodeNumber || "1");
    const maxEp = typeof anime?.stats?.episodes?.sub === 'number' ? anime.stats.episodes.sub : episodes.length;
    if (currentEp < maxEp) {
      navigate(`/anime/${animeId}/episode/${currentEp + 1}`);
    }
  };

  const handleServerChange = (serverId: string) => {
    setVideoLoading(true);
    setSelectedServer(serverId);
    // Simulate loading time
    setTimeout(() => setVideoLoading(false), 1000);
  };

  const currentEpisode = episodes.find(ep => ep.number === parseInt(episodeNumber || "1"));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Anime not found</h1>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/anime/${animeId}`} className="hover:text-primary transition-colors">
            {anime.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Episode {episodeNumber}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Player & Info */}
          <div className="xl:col-span-3 space-y-6">
            {/* Anime Info Above Player */}
            <div className="flex items-start gap-4">
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-16 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold mb-1">{anime.title}</h1>
                <p className="text-muted-foreground mb-2">Episode {episodeNumber}: {currentEpisode?.title}</p>
                <div className="flex flex-wrap gap-2">
                  {anime.genres?.slice(0, 3).map((genre) => (
                    <Badge key={genre.mal_id} variant="secondary" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {anime.type}
                  </Badge>
                  {anime.score && (
                    <Badge variant="outline" className="text-xs">
                      ⭐ {anime.score}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
                  <LoadingSpinner />
                </div>
              )}
              
              {/* Mock Video Player */}
              <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <p className="text-lg font-medium mb-2">{anime.title}</p>
                  <p className="text-sm opacity-80">Episode {episodeNumber}</p>
                  <p className="text-xs opacity-60 mt-2">
                    Server: {selectedServer} | Quality: {selectedQuality} | {selectedType.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:text-primary"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMute}
                      className="text-white hover:text-primary"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                      <SelectTrigger className="w-20 h-8 text-xs bg-black/50 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualities.map((quality) => (
                          <SelectItem key={quality} value={quality}>
                            {quality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:text-primary"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub/Dub Toggle & Server Selection */}
            <div className="flex flex-wrap gap-4 items-center">
              <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as "sub" | "dub")}>
                <TabsList>
                  <TabsTrigger value="sub">SUB</TabsTrigger>
                  <TabsTrigger value="dub">DUB</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                {servers
                  .filter(server => server.type === selectedType)
                  .map((server) => (
                    <Button
                      key={server.id}
                      size="sm"
                      variant={selectedServer === server.id ? "default" : "outline"}
                      onClick={() => handleServerChange(server.id)}
                    >
                      {server.name}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Episode Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousEpisode}
                disabled={parseInt(episodeNumber || "1") <= 1}
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous Episode
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleNextEpisode}
                disabled={parseInt(episodeNumber || "1") >= (typeof anime?.stats?.episodes?.sub === 'number' ? anime.stats.episodes.sub : episodes.length)}
              >
                Next Episode
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Comments Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Comments</h3>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Be the first to comment on this episode!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Episode List */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Episodes</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {episodes.map((episode) => (
                      <Link
                        key={episode.id}
                        to={`/anime/${animeId}/episode/${episode.number}`}
                        className={`block p-2 rounded-lg transition-colors ${
                          episode.number === parseInt(episodeNumber || "1")
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Ep {episode.number}
                          </span>
                          {episode.isFiller && (
                            <Badge variant="secondary" className="text-xs">
                              Filler
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {episode.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">You May Also Like</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recommendations.slice(0, 6).map((rec) => (
                      <AnimeCard key={rec.mal_id} anime={rec} compact />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
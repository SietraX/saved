"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  matches: Array<{
    text: string;
    timestamp: number;
  }>;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const AdvancedSearchModal = ({ isOpen, onClose }: AdvancedSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const playerRefs = useRef<{ [key: string]: YT.Player }>({});
  const [activePlayer, setActivePlayer] = useState<YT.Player | null>(null);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);

  const cleanupPlayers = useCallback(() => {
    Object.values(playerRefs.current).forEach(player => {
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
    });
    playerRefs.current = {};
    setActivePlayer(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      cleanupPlayers();
    }
  }, [isOpen, cleanupPlayers]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsYouTubeApiReady(true);
      };
    } else {
      setIsYouTubeApiReady(true);
    }

    return cleanupPlayers;
  }, [cleanupPlayers]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    cleanupPlayers();

    try {
      const response = await fetch("/api/advanced-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm }),
      });
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Error performing advanced search:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const initializePlayer = useCallback((videoId: string, containerId: string) => {
    if (isYouTubeApiReady && !playerRefs.current[videoId]) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
        playerRefs.current[videoId] = new window.YT.Player(containerId, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            'onReady': (event: YT.PlayerEvent) => {
              event.target.stopVideo();
            },
          },
        });
      }
    }
  }, [isYouTubeApiReady]);

  useEffect(() => {
    if (isYouTubeApiReady) {
      searchResults.forEach((result) => {
        const containerId = `player-${result.videoId}`;
        initializePlayer(result.videoId, containerId);
      });
    }
  }, [searchResults, isYouTubeApiReady, initializePlayer]);

  const handleTimestampClick = (videoId: string, timestamp: number) => {
    const player = playerRefs.current[videoId];
    if (player && player.seekTo && player.playVideo) {
      try {
        if (activePlayer && activePlayer !== player && activePlayer.pauseVideo) {
          activePlayer.pauseVideo();
        }
        player.seekTo(timestamp, true);
        player.playVideo();
        setActivePlayer(player);
      } catch (error) {
        console.error("Error interacting with YouTube player:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.round(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `0:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Advanced Search</DialogTitle>
          <DialogDescription>
            Search for specific content within videos and view transcript matches.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSearching) {
                  handleSearch();
                }
              }}
              placeholder="Enter search term..."
              className="flex-grow"
              disabled={isSearching}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchTerm.trim()} 
              className="min-w-[100px]"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            {searchResults.map((result) => {
              return (
                <div key={result.videoId} className="mb-8">
                  <h3 className="font-semibold text-lg mb-4">{result.title}</h3>
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="w-full md:w-1/2 mb-4 md:mb-0">
                      <div className="relative w-full pt-[56.25%]">
                        <div 
                          id={`player-${result.videoId}`}
                          className="absolute top-0 left-0 w-full h-full"
                        ></div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <h4 className="font-medium mb-2 text-lg">Transcript Matches:</h4>
                      <ScrollArea className="h-[200px] md:h-[calc(56.25vw*0.45)] border rounded-lg">
                        <div className="p-4">
                          <ul className="space-y-3">
                            {result.matches.map((match, matchIndex) => (
                              <li key={matchIndex} className="text-sm">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-normal hover:underline"
                                  onClick={() => handleTimestampClick(result.videoId, match.timestamp)}
                                >
                                  <span className="text-blue-500 font-medium mr-2">{formatTime(match.timestamp)}</span>
                                </Button>
                                <span className="text-gray-700">{match.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
"use client"

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedVideo) {
      initializePlayer();
    }
  }, [selectedVideo]);

  const initializePlayer = () => {
    if (selectedVideo && playerContainerRef.current && window.YT) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(selectedVideo.videoId);
      } else {
        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          height: '360',
          width: '640',
          videoId: selectedVideo.videoId,
          events: {
            'onReady': onPlayerReady,
          },
        });
      }
    }
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    // Player is ready
  };

  const handleSearch = async () => {
    setIsLoading(true);
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
      if (data.results.length > 0) {
        setSelectedVideo(data.results[0]);
      }
    } catch (error) {
      console.error("Error performing advanced search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimestampClick = (timestamp: number) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(timestamp, true);
      playerRef.current.playVideo();
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
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Advanced Search</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full space-y-4 overflow-hidden">
          <div className="flex items-center space-x-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term..."
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="min-w-[100px]">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          {selectedVideo && (
            <div className="flex flex-col lg:flex-row h-full space-y-4 lg:space-y-0 lg:space-x-4 overflow-hidden">
              <div className="lg:w-1/2 flex flex-col">
                <h3 className="font-semibold mb-2 text-lg">{selectedVideo.title}</h3>
                <div className="aspect-video bg-gray-100 rounded-lg" ref={playerContainerRef}></div>
              </div>
              <div className="lg:w-1/2 flex flex-col overflow-hidden">
                <h4 className="font-medium mb-2 text-lg">Transcript Matches:</h4>
                <ScrollArea className="flex-grow border rounded-lg p-4">
                  <ul className="space-y-3">
                    {selectedVideo.matches.map((match, matchIndex) => (
                      <li key={matchIndex} className="text-sm">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal hover:underline"
                          onClick={() => handleTimestampClick(match.timestamp)}
                        >
                          <span className="text-blue-500 font-medium mr-2">{formatTime(match.timestamp)}</span>
                        </Button>
                        <span className="text-gray-700">{match.text}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>
          )}
          {!selectedVideo && searchResults.length > 0 && (
            <ScrollArea className="flex-grow border rounded-lg p-4">
              {searchResults.map((result, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-lg mb-2">{result.title}</h4>
                  <Button onClick={() => setSelectedVideo(result)} variant="link" className="p-0 text-blue-500 hover:underline">
                    View Results
                  </Button>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
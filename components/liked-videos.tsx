"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VideoModal } from "@/components/video-modal";

type Video = {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      medium: { 
        url: string;
        height: number;
        width: number;
      };
    };
  };
  status: {
    uploadStatus: string;
  };
};

export const LikedVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch("/api/youtube/liked-videos");
        if (!response.ok) throw new Error("Failed to fetch liked videos");
        const data = await response.json();
        setVideos(data.items || []);
        setFilteredVideos(data.items || []);
      } catch (error) {
        console.error("Error fetching liked videos:", error);
        setError("Failed to load liked videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedVideos();
  }, [session, status]);

  useEffect(() => {
    const filtered = videos.filter((video) =>
      video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleCloseModal = () => {
    setSelectedVideoId(null);
  };

  const isShort = (video: Video) => {
    const thumbnail = video.snippet.thumbnails.medium;
    return thumbnail.height > thumbnail.width;
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please sign in to view liked videos.</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <Input
        type="text"
        placeholder="Search liked videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-6"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredVideos.map((video) => (
          <Card 
            key={video.id} 
            className="youtube-card cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
            onClick={() => handleVideoClick(video.id)}
          >
            <div className={`relative ${isShort(video) ? 'aspect-[9/16]' : 'aspect-video'}`}>
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="object-cover w-full h-full rounded-t-lg"
              />
              {isShort(video) && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Short
                </div>
              )}
            </div>
            <CardContent className="p-3 flex-grow">
              <h3 className="text-sm font-medium line-clamp-2">{video.snippet.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
      <VideoModal
        isOpen={!!selectedVideoId}
        onClose={handleCloseModal}
        videoId={selectedVideoId || ""}
        isShort={selectedVideoId ? isShort(videos.find(v => v.id === selectedVideoId)!) : false}
      />
    </div>
  );
};

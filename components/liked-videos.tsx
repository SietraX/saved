"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Video = {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      medium: { url: string };
    };
  };
};

export const LikedVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

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
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please sign in to view liked videos.</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search liked videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
        {filteredVideos.map((video) => (
          <Card 
            key={video.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleVideoClick(video.id)}
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="object-cover w-full h-full"
              />
            </div>
            <CardContent className="p-2">
              <h3 className="text-xs font-medium line-clamp-2">{video.snippet.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

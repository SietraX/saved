"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoModal } from "@/components/video-modal";
import Image from 'next/image';
import { MoreHorizontal, Play, Shuffle } from "lucide-react";
import { formatViewCount } from "@/lib/utils";

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
    channelTitle: string;
    publishedAt: string;
  };
  statistics?: {
    viewCount?: string;
  };
  creatorContentType?: 'SHORTS' | 'VIDEO_ON_DEMAND' | 'LIVE_STREAM' | 'STORY' | 'UNSPECIFIED';
};

type FilterType = 'all' | 'videos' | 'shorts';

export const LikedVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
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
    let filtered = videos;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply video type filter
    if (filterType === 'videos') {
      filtered = filtered.filter((video) => video.creatorContentType !== 'SHORTS');
    } else if (filterType === 'shorts') {
      filtered = filtered.filter((video) => video.creatorContentType === 'SHORTS');
    }

    setFilteredVideos(filtered);
  }, [searchTerm, videos, filterType]);

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleCloseModal = () => {
    setSelectedVideoId(null);
  };

  const renderVideoItem = (video: Video) => {
    const isShort = video.creatorContentType === 'SHORTS';
    
    if (filterType === 'shorts' && isShort) {
      return (
        <div
          key={video.id}
          className="cursor-pointer hover:opacity-75 transition-opacity"
          onClick={() => handleVideoClick(video.id)}
        >
          <div className="relative w-[180px] h-[320px]">
            <Image
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              fill
              sizes="180px"
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
            />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium line-clamp-2">{video.snippet.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {video.statistics?.viewCount ? `${formatViewCount(video.statistics.viewCount)} views` : ''}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={video.id}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleVideoClick(video.id)}
        >
          <div className="relative w-40 h-[90px]">
            <Image
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
            {isShort && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Short
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{video.snippet.title}</h3>
            <p className="text-sm text-gray-500">
              {video.snippet.channelTitle}
            </p>
            <p className="text-xs text-gray-400">
              {video.statistics?.viewCount ? `${formatViewCount(video.statistics.viewCount)} views • ` : ''}
              {new Date(video.snippet.publishedAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </div>
      );
    }
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <div className="md:w-1/3">
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-video mb-4">
              <Image
                src={videos[0]?.snippet.thumbnails.medium.url || '/default-playlist-image.png'}
                alt="Liked Videos"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Liked Videos</h2>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {videos.length} videos
            </p>
            <div className="flex gap-2 mb-4">
              <Button className="flex-1">
                <Play className="mr-2" /> Play all
              </Button>
              <Button variant="outline" className="flex-1">
                <Shuffle className="mr-2" /> Mix
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:w-2/3">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={filterType === 'all' ? "default" : "outline"} 
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button 
            variant={filterType === 'videos' ? "default" : "outline"} 
            onClick={() => setFilterType('videos')}
          >
            Videos
          </Button>
          <Button 
            variant={filterType === 'shorts' ? "default" : "outline"} 
            onClick={() => setFilterType('shorts')}
          >
            Shorts
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Search liked videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className={`${filterType === 'shorts' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-2'}`}>
          {filteredVideos.map(renderVideoItem)}
        </div>
      </div>
      <VideoModal
        isOpen={!!selectedVideoId}
        onClose={handleCloseModal}
        videoId={selectedVideoId || ""}
        isShort={selectedVideoId ? videos.find(v => v.id === selectedVideoId)?.creatorContentType === 'SHORTS' : false}
      />
    </div>
  );
};

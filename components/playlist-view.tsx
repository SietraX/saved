"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Play, Shuffle, GripVertical } from "lucide-react";
import { VideoModal } from "@/components/video-modal";
import Image from 'next/image';

type PlaylistVideo = {
  id: string;
  snippet: {
    title: string;
    thumbnails: { default: { url: string } };
    channelTitle: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
  };
};

type PlaylistDetails = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
    channelTitle: string;
  };
  status: {
    privacyStatus: "private" | "public" | "unlisted";
  };
  contentDetails: {
    itemCount: number;
  };
};

export const PlaylistView = ({ playlistId }: { playlistId: string }) => {
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [sortOrder, setSortOrder] = useState("dateAddedNewest");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      const response = await fetch(
        `/api/youtube/playlist-details?id=${playlistId}`
      );
      const data = await response.json();
      setPlaylist(data);
    };

    const fetchPlaylistVideos = async () => {
      const response = await fetch(
        `/api/youtube/playlist-videos?id=${playlistId}`
      );
      const data = await response.json();
      setVideos(data.items);
    };

    fetchPlaylistDetails();
    fetchPlaylistVideos();
  }, [playlistId]);

  const handleSortChange = (value: string) => {
    setSortOrder(
      value as
        | "dateAddedNewest"
        | "dateAddedOldest"
        | "mostPopular"
        | "datePublishedNewest"
        | "datePublishedOldest"
    );
    // Implement sorting logic here
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleCloseModal = () => {
    setSelectedVideoId(null);
  };

  const getImageUrl = (playlist: PlaylistDetails | null) => {
    return playlist?.snippet.thumbnails?.medium?.url || '/placeholder-image.jpg';
  };

  if (!playlist) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-video mb-4">
              <Image
                src={getImageUrl(playlist)}
                alt={playlist.snippet.title}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{playlist.snippet.title}</h2>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {playlist.snippet.channelTitle}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {playlist.status.privacyStatus} •{" "}
              {playlist.contentDetails.itemCount} videos
            </p>
            <div className="flex gap-2 mb-4">
              <Button className="flex-1">
                <Play className="mr-2" /> Play all
              </Button>
              <Button variant="outline" className="flex-1">
                <Shuffle className="mr-2" /> Mix
              </Button>
            </div>
            <p className="text-sm">{playlist.snippet.description}</p>
          </CardContent>
        </Card>
      </div>
      <div className="md:w-2/3">
        <div className="mb-4">
          <Select onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAddedNewest">
                Date added (newest)
              </SelectItem>
              <SelectItem value="dateAddedOldest">
                Date added (oldest)
              </SelectItem>
              <SelectItem value="mostPopular">Most popular</SelectItem>
              <SelectItem value="datePublishedNewest">
                Date published (newest)
              </SelectItem>
              <SelectItem value="datePublishedOldest">
                Date published (oldest)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleVideoClick(video.id)}
            >
              <GripVertical className="cursor-move" />
              <div className="relative w-24 h-18">
                <Image
                  src={video.snippet.thumbnails.default.url}
                  alt={video.snippet.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{video.snippet.title}</h3>
                <p className="text-sm text-gray-500">
                  {video.snippet.channelTitle}
                </p>
                <p className="text-xs text-gray-400">
                  {video.statistics.viewCount} views •{" "}
                  {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <VideoModal
        isOpen={!!selectedVideoId}
        onClose={handleCloseModal}
        videoId={selectedVideoId || ""}
        isShort={false}
      />
    </div>
  );
};

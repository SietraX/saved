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
    description?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
    channelTitle: string;
  };
  status?: {
    privacyStatus?: "private" | "public" | "unlisted";
  };
  contentDetails?: {
    itemCount?: number;
  };
};

export const PlaylistView = ({ playlistId }: { playlistId: string }) => {
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [sortOrder, setSortOrder] = useState("dateAddedNewest");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isSavedCollection, setIsSavedCollection] = useState(false);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      let response;
      if (playlistId.startsWith('PL')) {
        // It's a YouTube playlist
        response = await fetch(`/api/youtube/playlist-details?id=${playlistId}`);
      } else {
        // It's a saved collection
        response = await fetch(`/api/saved-collections/${playlistId}`);
        setIsSavedCollection(true);
      }
      const data = await response.json();
      setPlaylist(data);
    };

    const fetchPlaylistVideos = async () => {
      try {
        let response;
        if (playlistId.startsWith('PL')) {
          // It's a YouTube playlist
          response = await fetch(`/api/youtube/playlist-videos?id=${playlistId}`);
        } else {
          // It's a saved collection
          response = await fetch(`/api/saved-collections/${playlistId}/videos`);
        }
        const data = await response.json();
        setVideos(data.items || []); // Provide an empty array as fallback
      } catch (error) {
        console.error('Error fetching playlist videos:', error);
        setVideos([]); // Set to empty array in case of error
      }
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
    return playlist?.snippet?.thumbnails?.medium?.url || '/public/default-playlist-image.png';
  };

  if (!playlist) return <div>Loading...</div>;

  const privacyStatus = playlist.status?.privacyStatus || 'unknown';
  const itemCount = playlist.contentDetails?.itemCount || 0;
  const description = playlist.snippet?.description || '';

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <div className="md:w-1/3">
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-video mb-4">
              <Image
                src={getImageUrl(playlist)}
                alt={playlist.snippet?.title || 'Playlist'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority // Add priority to the main playlist image
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{playlist.snippet?.title}</h2>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {playlist.snippet?.channelTitle}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {privacyStatus} • {itemCount} videos
            </p>
            <div className="flex gap-2 mb-4">
              <Button className="flex-1">
                <Play className="mr-2" /> Play all
              </Button>
              <Button variant="outline" className="flex-1">
                <Shuffle className="mr-2" /> Mix
              </Button>
            </div>
            <p className="text-sm">{description}</p>
          </CardContent>
        </Card>
      </div>
      <div className="md:w-2/3">
        <div className="mb-4">
          {isSavedCollection && (
            <Button onClick={() => {/* Implement add video functionality */}}>
              Add Video
            </Button>
          )}
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
          {videos && videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleVideoClick(video.id)}
              >
                <GripVertical className="cursor-move" />
                <div className="relative w-40 h-[90px]"> {/* Adjust size as needed */}
                  <Image
                    src={video.snippet.thumbnails.default.url}
                    alt={video.snippet.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
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
            ))
          ) : (
            <div>No videos available</div>
          )}
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

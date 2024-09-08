"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Play, Shuffle, GripVertical } from "lucide-react";
import { VideoModal } from "@/components/video-modal";
import Image from "next/image";
import { formatViewCount } from "@/lib/utils";
import { YoutubeVideoProps, PlaylistDetailsProps, PlaylistViewProps, VideoItemProps } from "@/types/index";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import { useFilteredVideos } from "@/hooks/useFilteredVideos";



const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match?.[1] ? parseInt(match[1].replace("H", "")) : 0;
  const minutes = match?.[2] ? parseInt(match[2].replace("M", "")) : 0;
  const seconds = match?.[3] ? parseInt(match[3].replace("S", "")) : 0;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
};

export const PlaylistView = ({ playlistId, type }: PlaylistViewProps) => {
  const { playlist, videos, isLoading, error } = usePlaylistData(playlistId, type);
  const {
    filteredVideos,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortOrder,
    setSortOrder,
  } = useFilteredVideos(videos);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleCloseModal = () => {
    setSelectedVideoId(null);
  };

  const getImageUrl = (playlist: PlaylistDetailsProps | null) => {
    return (
      playlist?.snippet?.thumbnails?.medium?.url ||
      "/default-playlist-image.png"
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!playlist) return <div>No playlist data available.</div>;

  const privacyStatus = playlist.status?.privacyStatus || "unknown";
  const itemCount = playlist.contentDetails?.itemCount || 0;
  const description = playlist.snippet?.description || "";

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 ">
      <div className="md:w-1/3 flex flex-col">
        <Card className="sticky top-4">
          <CardContent className="p-4 flex flex-col ">
            <div className="relative aspect-video mb-4 flex-shrink-0">
              <Image
                src={getImageUrl(playlist)}
                alt={playlist.snippet?.title || "Playlist"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
                priority
                className="rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
              <h2 className="text-xl font-bold">{playlist.snippet?.title}</h2>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </div>
            {playlist.snippet?.channelTitle && (
              <p className="text-sm text-gray-500 mb-2 flex-shrink-0">
                {playlist.snippet.channelTitle}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-4 flex-shrink-0">
              {type !== "liked" &&
                privacyStatus !== "unknown" &&
                `${privacyStatus} • `}
              {itemCount} videos
            </p>
            <div className="flex gap-2 mb-4 flex-shrink-0">
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
      <div className="md:w-2/3 flex flex-col">
        <div className="sticky top-0 bg-background z-10 pb-4">
          {type === "saved" && (
            <Button
              onClick={() => {
                /* Implement add video functionality */
              }}
              className="mb-4"
            >
              Add Video
            </Button>
          )}
          {type === "liked" && (
            <div className="flex gap-2 mb-4">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "videos" ? "default" : "outline"}
                onClick={() => setFilterType("videos")}
              >
                Videos
              </Button>
              <Button
                variant={filterType === "shorts" ? "default" : "outline"}
                onClick={() => setFilterType("shorts")}
              >
                Shorts
              </Button>
            </div>
          )}
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <Select onValueChange={setSortOrder}>
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
        <div>
          <div
            className={`${
              type === "liked" && filterType === "shorts"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                : "space-y-2"
            }`}
          >
            {filteredVideos.map((video) => (
              <VideoItem
                key={video.id}
                video={video}
                type={type}
                filterType={filterType}
                onClick={() => handleVideoClick(video.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <VideoModal
        isOpen={!!selectedVideoId}
        onClose={handleCloseModal}
        videoId={selectedVideoId || ""}
        isShort={
          selectedVideoId
            ? filteredVideos.find((v) => v.id === selectedVideoId)?.creatorContentType === "SHORTS"
            : false
        }
      />
    </div>
  );
};


const VideoItem = ({ video, type, filterType, onClick }: VideoItemProps) => {
  return (
    <div
      className={`${
        type === "liked" && filterType === "shorts"
          ? "cursor-pointer hover:opacity-75 transition-opacity"
          : "flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
      }`}
      onClick={onClick}
    >
      {type === "liked" && filterType === "shorts" ? (
        <>
          <div className="relative w-[180px] h-[320px]">
            <Image
              src={video.snippet.thumbnails?.default?.url || "/placeholder-image.jpg"}
              alt={video.snippet.title}
              fill
              sizes="180px"
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium line-clamp-2">
              {video.snippet.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {video.statistics?.viewCount
                ? `${formatViewCount(video.statistics.viewCount)} views`
                : ""}
            </p>
          </div>
        </>
      ) : (
        <>
          {type === "saved" && (
            <GripVertical className="cursor-move" />
          )}
          <div className="relative w-40 h-[90px]">
            <Image
              src={video.snippet.thumbnails?.default?.url || "/placeholder-image.jpg"}
              alt={video.snippet.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
            {video.creatorContentType === "SHORTS" && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Short
              </div>
            )}
            {video.contentDetails?.duration && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(video.contentDetails.duration)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{video.snippet.title}</h3>
            <p className="text-xs text-gray-800">
              {video.snippet.channelTitle}
              {video.statistics?.viewCount &&
                ` • ${formatViewCount(video.statistics.viewCount)} views`}
              {` • ${new Date(video.snippet.publishedAt).toLocaleDateString()}`}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </>
      )}
    </div>
  );
};

import { useState, useEffect, useMemo } from 'react';
import { PlaylistVideoProps, FilterType, YoutubeVideoProps } from '@/types/index';

function normalizeVideoData(video: PlaylistVideoProps): YoutubeVideoProps {
  if ("video_id" in video) {
    return {
      id: video.video_id,
      snippet: {
        title: video.title,
        thumbnails: {
          default: { url: video.thumbnail_url },
        },
        channelTitle: video.channel_title,
        publishedAt: video.published_at,
      },
      creatorContentType: "VIDEO",
    };
  }
  return video;
}

export function useFilteredVideos(videos: PlaylistVideoProps[]) {
  const [filteredVideos, setFilteredVideos] = useState<YoutubeVideoProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<string>("dateAddedNewest");

  const normalizedVideos = useMemo(() => videos.map(normalizeVideoData), [videos]);

  useEffect(() => {
    let filtered = normalizedVideos;

    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === "videos") {
      filtered = filtered.filter((video) => video.creatorContentType !== "SHORTS");
    } else if (filterType === "shorts") {
      filtered = filtered.filter((video) => video.creatorContentType === "SHORTS");
    }

    // Implement sorting logic here
    switch (sortOrder) {
      case "dateAddedNewest":
        filtered.sort((a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime());
        break;
      case "dateAddedOldest":
        filtered.sort((a, b) => new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime());
        break;
      // Add more sorting cases as needed
    }

    setFilteredVideos(filtered);
  }, [normalizedVideos, searchTerm, filterType, sortOrder]);

  return {
    filteredVideos,
    setFilteredVideos, // Add this line
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortOrder,
    setSortOrder,
  };
}
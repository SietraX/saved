"use client";

import { useState, useEffect } from "react";
import { PlaylistDetailsProps, PlaylistVideoProps } from "@/types/index";

export function usePlaylistData(
  playlistId: string,
  type: "youtube" | "saved" | "liked"
) {
  const [playlist, setPlaylist] = useState<PlaylistDetailsProps | null>(null);
  const [videos, setVideos] = useState<PlaylistVideoProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylistVideos = async () => {
    try {
      let response;
      if (type === "youtube") {
        response = await fetch(`/api/youtube/playlist-videos?id=${playlistId}`);
      } else if (type === "saved") {
        response = await fetch(`/api/saved-collections/${playlistId}/videos`);
      } else if (type === "liked") {
        response = await fetch("/api/youtube/liked-videos");
      }
      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }
      const data = await response?.json();

      // Normalize the video data to include duration for all types
      const normalizedVideos = await Promise.all(data.items.map(async (video: any) => {
        let normalizedVideo = {
          ...video,
          contentDetails: {
            ...video.contentDetails,
            duration: video.contentDetails?.duration || video.duration || null,
          },
        };

        // If it's a YouTube playlist, fetch the actual video details
        if (type === "youtube") {
          const videoDetailsResponse = await fetch(`/api/youtube/video-details?id=${video.contentDetails.videoId}`);
          if (videoDetailsResponse.ok) {
            const videoDetails = await videoDetailsResponse.json();
            normalizedVideo = {
              ...normalizedVideo,
              snippet: {
                ...normalizedVideo.snippet,
                channelTitle: videoDetails.snippet.channelTitle,
              },
              statistics: videoDetails.statistics,
            };
          }
        }

        return normalizedVideo;
      }));

      setVideos(normalizedVideos);
      if (type === "saved" || type === "liked") {
        setPlaylist((prev) =>
          prev
            ? {
                ...prev,
                contentDetails: { itemCount: normalizedVideos.length },
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error fetching playlist videos:", error);
      setError("Failed to load videos. Please try again later.");
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchVideos = () => {
    fetchPlaylistVideos();
  };

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        let response;
        if (type === "youtube") {
          response = await fetch(
            `/api/youtube/playlist-details?id=${playlistId}`
          );
        } else if (type === "saved") {
          response = await fetch(`/api/saved-collections/${playlistId}`);
        } else if (type === "liked") {
          setPlaylist({
            id: "liked",
            snippet: {
              title: "Liked Videos",
              description: "Your liked videos from YouTube",
            },
            contentDetails: {
              itemCount: 0,
            },
          });
          return;
        }
        if (!response?.ok) {
          throw new Error(`HTTP error! status: ${response?.status}`);
        }
        const data = await response?.json();

        if (type === "saved") {
          setPlaylist({
            id: data.id,
            snippet: {
              title: data.name,
              description: "Your saved collection",
            },
            contentDetails: {
              itemCount: data.videoCount || 0,
            },
          });
        } else {
          setPlaylist(data);
        }
      } catch (error) {
        console.error("Error fetching playlist details:", error);
        setError("Failed to load playlist details. Please try again later.");
      }
    };

    setIsLoading(true);
    setError(null);
    fetchPlaylistDetails();
    fetchPlaylistVideos();
  }, [playlistId, type]);

  return { playlist, videos, isLoading, error, refetchVideos };
}

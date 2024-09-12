"use client";

import { useState } from "react";
import { VideoModal } from "@/components/video-modal";
import { PlaylistViewProps } from "@/types/index";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import { useFilteredVideos } from "@/hooks/useFilteredVideos";
import { PlaylistInfoCard } from "@/components/playlist-info-card";
import { VideoItem } from "@/components/video-item";
import { PlaylistControls } from "@/components/playlist-controls";
import { CaptionFetcherModal } from "@/components/caption-fetcher-modal";
import { AdvancedSearchContainer } from "@/components/advanced-search-container";

export const PlaylistView = ({ playlistId, type }: PlaylistViewProps) => {
  const { playlist, videos, isLoading, error, refetchVideos } = usePlaylistData(
    playlistId,
    type
  );
  const {
    filteredVideos,
    searchTerm,
    filterType,
    sortOrder,
    updateSearchTerm,
    updateFilterType,
    updateSortOrder,
    filterVideo,
  } = useFilteredVideos(videos);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleCloseModal = () => {
    setSelectedVideoId(null);
  };

  const handleVideoAdded = () => {
    refetchVideos();
  };

  const handleDeleteVideo = (videoId: string) => {
    filterVideo(videoId);
    refetchVideos(); // Refresh the video list after deletion
  };

  const handleAdvancedSearchClick = () => {
    setIsAdvancedSearchOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!playlist) return <div>No playlist data available.</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3 flex flex-col">
        <div className="sticky top-20">
          <PlaylistInfoCard playlist={playlist} type={type} priority={true} />
          <CaptionFetcherModal /> {/* Add this line */}
        </div>
      </div>
      <div className="md:w-2/3 flex flex-col">
        <PlaylistControls
          type={type}
          filterType={filterType}
          setFilterType={updateFilterType}
          searchTerm={searchTerm}
          setSearchTerm={updateSearchTerm}
          setSortOrder={updateSortOrder}
          collectionId={type === "saved" ? playlistId : undefined}
          onVideoAdded={handleVideoAdded}
          onAdvancedSearchClick={handleAdvancedSearchClick}
        />
        <div className="mt-4">
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
                onDelete={handleDeleteVideo}
                collectionId={type === "saved" ? playlistId : undefined}
              />
            ))}
          </div>
        </div>
      </div>
      <AdvancedSearchContainer
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />
    </div>
  );
};

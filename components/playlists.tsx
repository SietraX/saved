"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useYoutubePlaylists } from "@/hooks/useYoutubePlaylists";
import { useCollections } from "@/hooks/useCollections";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Globe, Eye, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Playlist, PrivacyStatus } from "@/types/index";
import { AdvancedSearchButton } from "@/components/advanced-search-button";
import { AdvancedSearchContainer } from "@/components/advanced-search-container";
import { useToast } from "@/hooks/useToast";

export const Playlists = () => {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const router = useRouter();

  const { playlists, isLoading, error } = useYoutubePlaylists();
  const { createCollection } = useCollections();
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const { toast } = useToast();

  const filteredPlaylists =
    playlists?.filter((playlist) =>
      playlist.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlists/${playlistId}`);
  };

  const getPrivacyIcon = (status: PrivacyStatus) => {
    switch (status) {
      case "private":
        return <Lock className="w-4 h-4" />;
      case "unlisted":
        return <Eye className="w-4 h-4" />;
      case "public":
        return <Globe className="w-4 h-4" />;
    }
  };

  const handleAdvancedSearchClick = () => {
    setIsAdvancedSearchOpen(true);
  };

  const handlePlaylistSelect = (playlistId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the card
    setSelectedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleCloneSelected = async () => {
    if (selectedPlaylists.length === 0) {
      toast({
        title: "No playlists selected",
        description: "Please select at least one playlist to clone.",
        variant: "destructive",
      });
      return;
    }

    setIsCloning(true);
    try {
      const response = await fetch("/api/saved-collections/clone-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistIds: selectedPlaylists,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clone playlists");
      }

      toast({
        title: "Playlists cloned successfully",
        description: `${data.clonedCount} collections created`,
      });
      setSelectedPlaylists([]);
    } catch (error) {
      console.error("Error cloning playlists:", error);
      toast({
        title: "Error cloning playlists",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading playlists: {error.message}</div>;
  if (!playlists) return <div>No playlists found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Playlists</h1>
      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Search playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <AdvancedSearchButton onClick={handleAdvancedSearchClick} />
      </div>
      <AdvancedSearchContainer
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />
      <div className="mb-4">
        <Button onClick={handleCloneSelected} disabled={isCloning}>
          {isCloning ? "Cloning..." : `Clone Selected (${selectedPlaylists.length})`}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredPlaylists.map((playlist) => (
          <Card
            key={playlist.id}
            className="youtube-card cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            <div className="relative aspect-video">
              <Image
                src={playlist.snippet.thumbnails.medium.url}
                alt={playlist.snippet.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-t-lg object-cover"
                priority={playlist.id === filteredPlaylists[0].id}
              />
              <div 
                className="absolute top-2 left-2 z-10 cursor-pointer"
                onClick={(e) => handlePlaylistSelect(playlist.id, e)}
              >
                {selectedPlaylists.includes(playlist.id) ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 border-2 border-white rounded-full bg-black bg-opacity-50" />
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {playlist.contentDetails.itemCount} videos
              </div>
            </div>
            <CardContent className="youtube-card-content flex-grow">
              <h3 className="youtube-card-title">{playlist.snippet.title}</h3>
              <div className="youtube-card-privacy">
                {getPrivacyIcon(playlist.status.privacyStatus)}
                <span className="ml-1 capitalize">
                  {playlist.status.privacyStatus}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

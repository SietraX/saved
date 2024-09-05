"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Lock, Globe, Eye } from "lucide-react";

type PrivacyStatus = "public" | "unlisted" | "private";
interface Playlist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
    };
  };
  status: {
    privacyStatus: PrivacyStatus;
  };
  contentDetails: {
    itemCount: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const Playlists = () => {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data, error, isLoading } = useSWR<{ items: Playlist[] }>(
    status === "authenticated" ? "/api/youtube/playlists" : null,
    fetcher
  );

  const filteredPlaylists = data?.items?.filter((playlist) =>
    playlist.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
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

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please sign in to view playlists.</div>;
  if (error) return <div>Error loading playlists: {error.message}</div>;
  if (!data || !data.items) return <div>No playlists found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Playlists</h1>
      <Input
        type="text"
        placeholder="Search playlists..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredPlaylists.map((playlist) => (
          <Card 
            key={playlist.id} 
            className="youtube-card cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            <div className="relative aspect-video">
              <img
                src={playlist.snippet.thumbnails.medium.url}
                alt={playlist.snippet.title}
                className="object-cover w-full h-full rounded-t-lg"
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {playlist.contentDetails.itemCount} videos
              </div>
            </div>
            <CardContent className="youtube-card-content flex-grow">
              <h3 className="youtube-card-title">{playlist.snippet.title}</h3>
              <div className="youtube-card-privacy">
                {getPrivacyIcon(playlist.status.privacyStatus)}
                <span className="ml-1 capitalize">{playlist.status.privacyStatus}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type PrivacyStatus = "public" | "unlisted" | "private";
interface Playlist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
    };
  };
  status: {
    privacyStatus: PrivacyStatus;
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

  const filteredPlaylists = data?.items.filter((playlist) =>
    playlist.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please sign in to view playlists.</div>;
  if (error) return <div>Error loading playlists</div>;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaylists.map((playlist) => (
          <Card 
            key={playlist.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            <CardHeader>
              <CardTitle>{playlist.snippet.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={playlist.snippet.thumbnails.default.url}
                alt={playlist.snippet.title}
                className="w-full h-32 object-cover mb-2"
              />
              <p className="text-sm text-gray-500 mb-2">{playlist.snippet.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

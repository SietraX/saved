"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock, Link, Globe } from "lucide-react";
import { LikedVideos } from "@/components/liked-videos";

type Video = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
    };
  };
};

type Playlist = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
    };
  };
  contentDetails?: {
    itemCount: number;
  };
  status?: {
    privacyStatus: "public" | "private" | "unlisted";
  };
};

export const YouTubeCollections = () => {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      if (status === "authenticated") {
        try {
          const [playlistsRes, likedVideosRes] = await Promise.all([
            fetch("/api/youtube/playlists"),
            fetch("/api/youtube/liked-videos"),
          ]);

          if (!playlistsRes.ok || !likedVideosRes.ok) {
            throw new Error("Failed to fetch collections");
          }

          const [playlistsData, likedVideosData] = await Promise.all([
            playlistsRes.json(),
            likedVideosRes.json(),
          ]);

          setPlaylists(playlistsData.items || []);
          setLikedVideos(likedVideosData.items || []);
        } catch (error) {
          console.error("Error fetching collections:", error);
          setError("Failed to load some collections. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCollections();
  }, [status]);

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  const getPrivacyStatusIcon = (status: string) => {
    switch (status) {
      case "private":
        return <Lock className="h-4 w-4 mr-1" />;
      case "unlisted":
        return <Link className="h-4 w-4 mr-1" />;
      default:
        return <Globe className="h-4 w-4 mr-1" />;
    }
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (status === "unauthenticated")
    return <div>Please sign in to view your collections.</div>;
  if (error) return <div>{error}</div>;

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLikedVideos = likedVideos.filter((video) =>
    video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold sm:text-3xl">Your YouTube Collections</h1>
      <Input
        type="text"
        placeholder="Search collections..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <Tabs defaultValue="playlists" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
          <TabsTrigger value="watchLater">Watch Later</TabsTrigger>
        </TabsList>
        <TabsContent value="playlists">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={playlist.snippet.thumbnails.medium.url}
                    alt={playlist.snippet.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                    {playlist.contentDetails?.itemCount || 0} videos
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2">{playlist.snippet.title}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    {getPrivacyStatusIcon(playlist.status?.privacyStatus || "public")}
                    <span className="capitalize">{playlist.status?.privacyStatus || "public"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="liked">
          <LikedVideos />
        </TabsContent>
        <TabsContent value="watchLater">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Watch Later</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Due to YouTube API limitations, we can't display your Watch
                Later videos here. However, you can access them directly on
                YouTube.
              </p>
              <Button
                onClick={() =>
                  window.open(
                    "https://www.youtube.com/playlist?list=WL",
                    "_blank"
                  )
                }
                className="w-full sm:w-auto"
              >
                Go to Watch Later on YouTube
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

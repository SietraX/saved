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
import { PlaylistView } from "@/components/playlist-view";
import { Playlists } from "./playlists";
import { WatchLater } from "./watch-later";

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
  const [activeTab, setActiveTab] = useState("playlists");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your YouTube Collections</h1>
      <Tabs defaultValue="playlists" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
          <TabsTrigger value="watchLater">Watch Later</TabsTrigger>
        </TabsList>
        <TabsContent value="playlists">
          <Playlists />
        </TabsContent>
        <TabsContent value="liked">
          <LikedVideos />
        </TabsContent>
        <TabsContent value="watchLater">
          <WatchLater />
        </TabsContent>
      </Tabs>
    </div>
  );
};

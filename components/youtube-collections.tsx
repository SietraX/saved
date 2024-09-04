"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LikedVideos } from "@/components/liked-videos";
import { Playlists } from "./playlists";
import { WatchLater } from "./watch-later";

export const YouTubeCollections = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your YouTube Collections</h1>
      <Tabs defaultValue="playlists">
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

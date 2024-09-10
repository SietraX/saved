"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaylistView } from "@/components/playlist-view";
import { Playlists } from "./playlists";
import { WatchLater } from "./watch-later";

export const YouTubeCollections = () => {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.startsWith("/playlists")) return "playlists";
    if (pathname.startsWith("/liked-videos")) return "liked";
    if (pathname.startsWith("/watch-later")) return "watchLater";
    return "playlists"; // Default to playlists
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "playlists":
        router.push("/playlists");
        break;
      case "liked":
        router.push("/liked-videos");
        break;
      case "watchLater":
        router.push("/watch-later");
        break;
      default:
        router.push("/playlists");
    }
  };

  const playlistId = pathname.split("/").pop();
  const isPlaylistView =
    pathname.includes("/playlists/") && playlistId !== "playlists";

  return (
    <div className="space-y-6">
      {" "}
      {/* Removed pt-4 */}
      <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="playlists"
            onClick={() => handleTabChange("playlists")}
          >
            Playlists
          </TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
          <TabsTrigger value="watchLater">Watch Later</TabsTrigger>
        </TabsList>
        <TabsContent value="playlists">
          {isPlaylistView ? (
            <PlaylistView playlistId={playlistId!} type="youtube" />
          ) : (
            <Playlists />
          )}
        </TabsContent>
        <TabsContent value="liked">
          <PlaylistView playlistId="liked" type="liked" />
        </TabsContent>
        <TabsContent value="watchLater">
          <WatchLater />
        </TabsContent>
      </Tabs>
    </div>
  );
};

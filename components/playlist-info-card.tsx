import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Shuffle } from "lucide-react";
import { PlaylistDetailsProps } from "@/types/index";

interface PlaylistInfoCardProps {
  playlist: PlaylistDetailsProps;
  type: "youtube" | "saved" | "liked";
}

export const PlaylistInfoCard = ({ playlist, type }: PlaylistInfoCardProps) => {
  const getImageUrl = (playlist: PlaylistDetailsProps) => {
    return playlist.snippet?.thumbnails?.medium?.url || "/default-playlist-image.png";
  };

  const privacyStatus = playlist.status?.privacyStatus || "unknown";
  const itemCount = playlist.contentDetails?.itemCount || 0;
  const description = playlist.snippet?.description || "";

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 flex flex-col">
        <div className="relative aspect-video mb-4 flex-shrink-0">
          <Image
            src={getImageUrl(playlist)}
            alt={playlist.snippet?.title || "Playlist"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            priority
            className="rounded-lg"
          />
        </div>
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <h2 className="text-xl font-bold">{playlist.snippet?.title}</h2>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </div>
        {playlist.snippet?.channelTitle && (
          <p className="text-sm text-gray-500 mb-2 flex-shrink-0">
            {playlist.snippet.channelTitle}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-4 flex-shrink-0">
          {type !== "liked" && privacyStatus !== "unknown" && `${privacyStatus} • `}
          {itemCount} videos
        </p>
        <div className="flex gap-2 mb-4 flex-shrink-0">
          <Button className="flex-1">
            <Play className="mr-2" /> Play all
          </Button>
          <Button variant="outline" className="flex-1">
            <Shuffle className="mr-2" /> Mix
          </Button>
        </div>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};
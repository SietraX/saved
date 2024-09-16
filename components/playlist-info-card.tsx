import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Shuffle, ArrowLeft } from "lucide-react";
import { PlaylistDetailsProps } from "@/types/index";
import { useTimeAgo } from "@/hooks/useTimeAgo";

interface PlaylistInfoCardProps {
  playlist: PlaylistDetailsProps;
  type: "youtube" | "saved" | "liked";
  priority?: boolean;
}

export const PlaylistInfoCard = ({ playlist, type, priority = false }: PlaylistInfoCardProps) => {
  const router = useRouter();

  const getImageUrl = (playlist: PlaylistDetailsProps, type: "youtube" | "saved" | "liked") => {
    const defaultImage = "/default-playlist-image.png";
    const itemCount = playlist.contentDetails?.itemCount || 0;

    if (itemCount > 0) {
      // If there's at least one video, use its thumbnail
      const thumbnails = playlist.snippet?.thumbnails;
      if (thumbnails) {
        // Try to get the highest quality thumbnail available
        return thumbnails.maxres?.url || 
               thumbnails.high?.url || 
               thumbnails.medium?.url || 
               thumbnails.default?.url || 
               defaultImage;
      }
    }
    
    // If there are no videos or no thumbnails, use the default image
    return defaultImage;
  };

  const privacyStatus = playlist.status?.privacyStatus || "unknown";
  const itemCount = playlist.contentDetails?.itemCount || 0;
  const description = playlist.snippet?.description || "";
  const publishedAt = playlist.snippet?.publishedAt || new Date().toISOString();
  const timeAgo = useTimeAgo(publishedAt);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 flex flex-col">
        <div className="absolute top-6 left-6 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBackClick}
            className="rounded-xl shadow-md hover:shadow-lg transition-shadow bg-white bg-opacity-50 border border-gray-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative aspect-video mb-4 flex-shrink-0">
          <Image
            src={getImageUrl(playlist, type)}
            alt={playlist.snippet?.title || "Playlist"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            style={{ objectFit: "cover" }}
            priority={priority}
            quality={95}
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
          {type !== "liked" && ` • Last updated: ${timeAgo}`}
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
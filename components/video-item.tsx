import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { formatViewCount, formatDuration } from "@/lib/utils";
import { VideoItemProps } from "@/types/index";

export const VideoItem = ({ video, type, filterType, onClick }: VideoItemProps) => {
  return (
    <div
      className={`${
        type === "liked" && filterType === "shorts"
          ? "cursor-pointer hover:opacity-75 transition-opacity"
          : "flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
      }`}
      onClick={onClick}
    >
      {type === "liked" && filterType === "shorts" ? (
        <>
          <div className="relative w-[180px] h-[320px]">
            <Image
              src={video.snippet.thumbnails?.default?.url || "/placeholder-image.jpg"}
              alt={video.snippet.title}
              fill
              sizes="180px"
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium line-clamp-2">
              {video.snippet.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {video.statistics?.viewCount
                ? `${formatViewCount(video.statistics.viewCount)} views`
                : ""}
            </p>
          </div>
        </>
      ) : (
        <>
          {type === "saved" && (
            <GripVertical className="cursor-move" />
          )}
          <div className="relative w-40 h-[90px]">
            <Image
              src={video.snippet.thumbnails?.default?.url || "/placeholder-image.jpg"}
              alt={video.snippet.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
            {video.creatorContentType === "SHORTS" && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Short
              </div>
            )}
            {video.contentDetails?.duration && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(video.contentDetails.duration)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{video.snippet.title}</h3>
            <p className="text-xs text-gray-800">
              {video.snippet.channelTitle}
              {video.statistics?.viewCount &&
                ` • ${formatViewCount(video.statistics.viewCount)} views`}
              {` • ${new Date(video.snippet.publishedAt).toLocaleDateString()}`}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </>
      )}
    </div>
  );
};
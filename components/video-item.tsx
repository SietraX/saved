"use client"

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MoreVertical, Save, Share2, Trash2 } from "lucide-react";
import { formatViewCount, formatDuration } from "@/lib/utils";
import { VideoItemProps } from "@/types/index";
import { useToast } from "@/hooks/useToast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const VideoItem = ({ video, type, filterType, onClick, onDelete, collectionId }: VideoItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveToCollection = () => {
    // Implement save to collection functionality
    console.log("Save to collection");
  };

  const handleShare = () => {
    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
    navigator.clipboard.writeText(videoUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "The video URL has been copied to your clipboard.",
        duration: 3000,
      });
    }).catch((error) => {
      console.error("Failed to copy: ", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy the link. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const handleDelete = async () => {
    if (type === "saved" && collectionId) {
      try {
        const response = await fetch("/api/saved-collections/delete-video", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: video.id, collectionId }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete video");
        }

        if (onDelete) {
          onDelete(video.id);
        }
      } catch (error) {
        console.error("Error deleting video:", error);
        // Optionally, show an error message to the user
      }
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSaveToCollection(); }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Collection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                {type === "saved" && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video from this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
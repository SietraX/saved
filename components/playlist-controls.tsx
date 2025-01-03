import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { FilterType } from "@/types/index";
import { AdvancedSearchButton } from "@/components/advanced-search-button";

interface PlaylistControlsProps {
  type: "youtube" | "saved" | "liked";
  filterType: FilterType;
  setFilterType: (filterType: FilterType) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  setSortOrder: (sortOrder: string) => void;
  collectionId?: string;
  onVideoAdded?: () => void;
  onAdvancedSearchClick: () => void;
}

export const PlaylistControls: React.FC<PlaylistControlsProps> = ({
  type,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  setSortOrder,
  collectionId,
  onVideoAdded,
  onAdvancedSearchClick,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successMessage) {
      timer = setTimeout(() => {
        setIsDialogOpen(false);
        setSuccessMessage("");
      }, 3000); // Close dialog after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleAddVideo = async () => {
    setIsAddingVideo(true);
    setError("");
    setSuccessMessage("");

    try {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      if (!collectionId) {
        throw new Error("Collection ID is missing");
      }

      const response = await fetch("/api/saved-collections/add-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, collectionId }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError("This video already exists in the collection.");
        } else {
          throw new Error(data.error || "Failed to add video");
        }
      } else if (data.success) {
        setSuccessMessage("Video successfully added to the collection!");
        setVideoUrl("");
        if (onVideoAdded) {
          onVideoAdded();
        }
      } else {
        throw new Error("Failed to add video");
      }
    } catch (error) {
      console.error("Error adding video:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add video. Please try again."
      );
    } finally {
      setIsAddingVideo(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleAdvancedSearchClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-background">
      {type === "saved" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">Add Video</Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-description">
            <DialogHeader id="dialog-description">
              <DialogTitle>Add Video to Collection</DialogTitle>
              <DialogDescription>
                Enter the URL of the YouTube video you want to add to your
                collection.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Enter YouTube video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mb-4"
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {successMessage && (
              <p className="text-green-500 mb-2 font-bold">{successMessage}</p>
            )}
            <Button onClick={handleAddVideo} disabled={isAddingVideo}>
              {isAddingVideo ? "Adding..." : "Add Video"}
            </Button>
          </DialogContent>
        </Dialog>
      )}
      {type === "liked" && (
        <div className="flex gap-2 mb-4">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "videos" ? "default" : "outline"}
            onClick={() => setFilterType("videos")}
          >
            Videos
          </Button>
          <Button
            variant={filterType === "shorts" ? "default" : "outline"}
            onClick={() => setFilterType("shorts")}
          >
            Shorts
          </Button>
        </div>
      )}
      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <AdvancedSearchButton onClick={onAdvancedSearchClick} />
      </div>
      <Select onValueChange={setSortOrder}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dateAddedNewest">Date added (newest)</SelectItem>
          <SelectItem value="dateAddedOldest">Date added (oldest)</SelectItem>
          <SelectItem value="mostPopular">Most popular</SelectItem>
          <SelectItem value="datePublishedNewest">
            Date published (newest)
          </SelectItem>
          <SelectItem value="datePublishedOldest">
            Date published (oldest)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

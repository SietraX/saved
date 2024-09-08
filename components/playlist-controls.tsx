import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterType } from "@/types/index";

interface PlaylistControlsProps {
  type: "youtube" | "saved" | "liked";
  filterType: FilterType;
  setFilterType: (filterType: FilterType) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  setSortOrder: (sortOrder: string) => void;
}

export const PlaylistControls = ({
  type,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  setSortOrder,
}: PlaylistControlsProps) => {
  return (
    <div className="sticky top-0 bg-background z-10 pb-4">
      {type === "saved" && (
        <Button onClick={() => {/* Implement add video functionality */}} className="mb-4">
          Add Video
        </Button>
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
      <Input
        type="text"
        placeholder="Search videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Select onValueChange={setSortOrder}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dateAddedNewest">Date added (newest)</SelectItem>
          <SelectItem value="dateAddedOldest">Date added (oldest)</SelectItem>
          <SelectItem value="mostPopular">Most popular</SelectItem>
          <SelectItem value="datePublishedNewest">Date published (newest)</SelectItem>
          <SelectItem value="datePublishedOldest">Date published (oldest)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
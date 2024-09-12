import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  videoId: string;
  title: string;
  matches: Array<{
    text: string;
    timestamp: number;
  }>;
}

export const AdvancedSearchModal = ({ isOpen, onClose }: AdvancedSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/advanced-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm }),
      });
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Error performing advanced search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="searchTerm">Search Term</Label>
            <Input
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term..."
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
          {searchResults.length > 0 && (
            <div>
              <h3 className="font-semibold">Results:</h3>
              <ul className="space-y-4">
                {searchResults.map((result, index) => (
                  <li key={index} className="border-b pb-2">
                    <h4 className="font-medium">{result.title}</h4>
                    <ul className="pl-4">
                      {result.matches.map((match, matchIndex) => (
                        <li key={matchIndex} className="text-sm">
                          <span className="text-gray-500">{formatTime(match.timestamp)}</span>: {match.text}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
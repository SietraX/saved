import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCollections } from "@/hooks/useCollections";
import { useToast } from "@/hooks/useToast";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function AddToCollectionModal({
  isOpen,
  onClose,
  videoId,
}: AddToCollectionModalProps) {
  const { collections, isLoading } = useCollections();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCollection = useCallback(async (collectionId: string) => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/saved-collections/add-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, collectionId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Video added to collection",
          duration: 3000,
        });
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to add video to collection");
      }
    } catch (error) {
      console.error("Error adding video to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add video to collection",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  }, [videoId, onClose, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div>Loading collections...</div>
        ) : collections ? (
          <div className="grid gap-4 py-4">
            {collections.map((collection) => (
              <Button
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={isAdding}
                className="w-full justify-start"
              >
                {collection.name}
              </Button>
            ))}
          </div>
        ) : (
          <div>No collections found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
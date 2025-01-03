"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCollections } from "@/hooks/useCollections";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/input";
import { useNewCollectionInput } from "@/hooks/useNewCollectionInput";

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
  const { collections, createCollection, refetchCollections } = useCollections();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [collectionsWithVideo, setCollectionsWithVideo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && videoId) {
      setIsLoading(true);
      fetch(`/api/saved-collections/check-video?videoId=${videoId}`)
        .then(response => response.json())
        .then(data => {
          setCollectionsWithVideo(data.collectionsWithVideo);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error checking video in collections:", error);
          setIsLoading(false);
        });
    }
  }, [isOpen, videoId]);

  const {
    newCollectionName,
    updateNewCollectionName,
    handleCreateCollection: createNewCollection,
    handleKeyDown,
  } = useNewCollectionInput(async (name) => {
    const newCollection = await createCollection(name);
    if (newCollection) {
      handleAddToCollection(newCollection.id);
      setIsCreatingNew(false);
      refetchCollections();
    }
  });

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
        setCollectionsWithVideo(prev => [...prev, collectionId]);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to add this video to, or create a new one.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div>Loading collections...</div>
        ) : collections && collections.length > 0 ? (
          <div className="grid gap-4 py-4">
            {collections.map((collection) => (
              <Button
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={isAdding || collectionsWithVideo.includes(collection.id)}
                className={`w-full justify-start ${collectionsWithVideo.includes(collection.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {collection.name}
                {collectionsWithVideo.includes(collection.id) && " (Already added)"}
              </Button>
            ))}
            {isCreatingNew ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => updateNewCollectionName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow"
                />
                <Button onClick={createNewCollection} disabled={isAdding}>
                  Create
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsCreatingNew(true)}
                variant="outline"
                className="w-full"
              >
                Create New Collection
              </Button>
            )}
          </div>
        ) : (
          <div>No collections found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { useMoveToTop } from "@/hooks/useMoveToTop";

interface SavedCollection {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
  display_order?: number;
}

export function useCollections() {
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/saved-collections");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Fetch video counts in a single API call
      const countsResponse = await fetch("/api/saved-collections/video-counts");
      if (!countsResponse.ok) {
        throw new Error(`HTTP error! status: ${countsResponse.status}`);
      }
      const videoCounts = await countsResponse.json();

      const collectionsWithCounts = data.map((collection: SavedCollection) => ({
        ...collection,
        videoCount: videoCounts[collection.id] || 0,
      }));

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("Failed to load collections. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (name: string) => {
    if (name.trim()) {
      const response = await fetch("/api/saved-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        setCollections((prev) => [
          ...prev,
          { ...newCollection, videoCount: 0 },
        ]);
        return newCollection;
      }
    }
    return null;
  };

  const updateCollection = async (id: string, name: string) => {
    if (name.trim()) {
      const response = await fetch(`/api/saved-collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const updatedCollection = await response.json();
        setCollections((prev) =>
          prev.map((c) =>
            c.id === id ? { ...updatedCollection, videoCount: c.videoCount } : c
          )
        );
        return updatedCollection;
      }
    }
    return null;
  };

  const deleteCollection = async (id: string) => {
    const response = await fetch(`/api/saved-collections/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setCollections(collections.filter((c) => c.id !== id));
      return true;
    }
    return false;
  };

  const updateCollectionsOrder = async (newOrder: SavedCollection[]) => {
    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: newOrder }),
      });

      if (response.ok) {
        setCollections(newOrder);
        return true;
      } else {
        throw new Error("Failed to update order on server");
      }
    } catch (error) {
      console.error("Error reordering collections:", error);
      return false;
    }
  };

  const { moveToTop, isMoving } = useMoveToTop(
    collections,
    updateCollectionsOrder
  );

  const moveCollectionToTop = async (id: string) => {
    const updatedCollections = await moveToTop(id);
    if (updatedCollections) {
      setCollections(updatedCollections);
      return true;
    }
    return false;
  };

  const reorderCollections = async (newOrder: SavedCollection[]) => {
    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: newOrder }),
      });

      if (response.ok) {
        setCollections(newOrder);
        return true;
      } else {
        throw new Error("Failed to update order on server");
      }
    } catch (error) {
      console.error("Error reordering collections:", error);
      return false;
    }
  };

  return {
    collections,
    isLoading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    moveCollectionToTop,
    reorderCollections,
    isMoving,
    refetchCollections: fetchCollections, // Add this to allow manual refetching
  };
}

"use client"

import { useState, useEffect, useCallback } from 'react';
import { moveItemToTop } from "@/lib/utils";

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

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/saved-collections");
      if (response.ok) {
        const data = await response.json();
        const collectionsWithCounts = await Promise.all(
          data.map(async (collection: SavedCollection) => {
            const countResponse = await fetch(
              `/api/saved-collections/${collection.id}/videos`
            );
            if (countResponse.ok) {
              const { items } = await countResponse.json();
              return { ...collection, videoCount: items.length };
            }
            return { ...collection, videoCount: 0 };
          })
        );
        setCollections(collectionsWithCounts);
      } else {
        console.error("Error fetching collections:", await response.json());
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, []); // Remove fetchCollections from the dependency array

  const createCollection = async (name: string) => {
    if (name.trim()) {
      const response = await fetch("/api/saved-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        setCollections(prev => [...prev, { ...newCollection, videoCount: 0 }]);
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
        setCollections(prev =>
          prev.map(c => c.id === id ? { ...updatedCollection, videoCount: c.videoCount } : c)
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

  const moveCollectionToTop = async (id: string) => {
    const updatedCollections = moveItemToTop(collections, id);
    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: updatedCollections }),
      });

      if (response.ok) {
        setCollections(updatedCollections);
        return true;
      } else {
        throw new Error("Failed to update order on server");
      }
    } catch (error) {
      console.error("Error moving collection to top:", error);
      return false;
    }
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
    createCollection,
    updateCollection,
    deleteCollection,
    moveCollectionToTop,
    reorderCollections,
  };
}
"use client";

import { useState, useCallback } from "react";
import useSWR from 'swr';
import { useMoveToTop } from "@/hooks/useMoveToTop";

interface SavedCollection {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
  display_order?: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCollections() {
  const { data: collections, error, mutate } = useSWR<SavedCollection[]>('/api/saved-collections/with-counts', fetcher);
  const [isMoving, setIsMoving] = useState(false);

  const createCollection = useCallback(async (name: string) => {
    if (name.trim()) {
      const response = await fetch("/api/saved-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        mutate([...(collections || []), { ...newCollection, videoCount: 0 }]);
        return newCollection;
      }
    }
    return null;
  }, [collections, mutate]);

  const updateCollection = useCallback(async (id: string, name: string) => {
    if (name.trim()) {
      const response = await fetch(`/api/saved-collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const updatedCollection = await response.json();
        mutate(
          collections?.map((c) =>
            c.id === id ? { ...updatedCollection, videoCount: c.videoCount } : c
          )
        );
        return updatedCollection;
      }
    }
    return null;
  }, [collections, mutate]);

  const deleteCollection = useCallback(async (id: string) => {
    const response = await fetch(`/api/saved-collections/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      mutate(collections?.filter((c) => c.id !== id));
      return true;
    }
    return false;
  }, [collections, mutate]);

  const { moveToTop } = useMoveToTop(collections || [], async (newOrder) => {
    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: newOrder }),
      });
      if (response.ok) {
        mutate(newOrder);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating order:", error);
      return false;
    }
  });

  const moveCollectionToTop = useCallback(async (id: string) => {
    setIsMoving(true);
    const updatedCollections = await moveToTop(id);
    if (updatedCollections) {
      mutate(updatedCollections);
      setIsMoving(false);
      return true;
    }
    setIsMoving(false);
    return false;
  }, [moveToTop, mutate]);

  const reorderCollections = useCallback(async (newOrder: SavedCollection[]) => {
    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: newOrder }),
      });

      if (response.ok) {
        mutate(newOrder);
        return true;
      } else {
        throw new Error("Failed to update order on server");
      }
    } catch (error) {
      console.error("Error reordering collections:", error);
      return false;
    }
  }, [mutate]);

  const refetchCollections = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    collections,
    isLoading: !error && !collections,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    moveCollectionToTop,
    reorderCollections,
    isMoving,
    refetchCollections,
  };
}

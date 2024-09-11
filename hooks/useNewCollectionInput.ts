"use client"

import { useState, KeyboardEvent, useCallback } from 'react';

export function useNewCollectionInput(createCollection: (name: string) => Promise<void>) {
  const [newCollectionName, setNewCollectionName] = useState("");

  const updateNewCollectionName = useCallback((name: string) => {
    setNewCollectionName(name);
  }, []);

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      await createCollection(newCollectionName);
      setNewCollectionName("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateCollection();
    }
  };

  return {
    newCollectionName,
    updateNewCollectionName,
    handleCreateCollection,
    handleKeyDown,
  };
}
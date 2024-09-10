"use client"

import { useState, KeyboardEvent } from 'react';

export function useNewCollectionInput(createCollection: (name: string) => Promise<void>) {
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      await createCollection(newCollectionName);
      setNewCollectionName("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateCollection();
    }
  };

  return {
    newCollectionName,
    setNewCollectionName,
    handleCreateCollection,
    handleKeyPress,
  };
}
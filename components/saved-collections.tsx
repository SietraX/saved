"use client";

import { useState, useEffect, KeyboardEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlaylistView } from "@/components/playlist-view";
import { Plus, MoreVertical, Pen, Trash, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedCollection {
  id: string;
  name: string;
  created_at: string;
}

export const SavedCollections = () => {
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const response = await fetch("/api/saved-collections");
    if (response.ok) {
      const data = await response.json();
      setCollections(data);
    }
  };

  const sortCollections = (collectionsToSort: SavedCollection[]) => {
    return collectionsToSort.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      const response = await fetch("/api/saved-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        setCollections([...collections, newCollection]);
        setNewCollectionName("");
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateCollection();
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = async (id: string) => {
    if (editName.trim()) {
      const response = await fetch(`/api/saved-collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        const updatedCollection = await response.json();
        setCollections(collections.map(c => c.id === id ? updatedCollection : c));
        setEditingId(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const response = await fetch(`/api/saved-collections/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCollections(collections.filter(c => c.id !== deleteId));
      }
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleViewCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
  };

  const sortedCollections = useMemo(() => sortCollections([...collections]), [collections]);

  if (selectedCollectionId) {
    return <PlaylistView playlistId={selectedCollectionId} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your Saved Collections</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="New collection name"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-grow"
        />
        <Button onClick={handleCreateCollection}>
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCollections.map((collection) => (
          <Card key={collection.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {editingId === collection.id ? (
                <div className="flex items-center w-full">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, collection.id)}
                    className="mr-2 flex-grow"
                    autoFocus
                  />
                  <Button 
                    onClick={() => handleSaveEdit(collection.id)} 
                    size="icon" 
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleCancelEdit} 
                    size="icon" 
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardTitle className="text-sm font-medium">
                    {collection.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(collection.id, collection.name)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(collection.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-500">
                Created on:{" "}
                {new Date(collection.created_at).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p>0 videos</p>
              <Button variant="outline" onClick={() => handleViewCollection(collection.id)}>View Collection</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the collection and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

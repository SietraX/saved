"use client";

import { useState, useEffect, KeyboardEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Plus, MoreVertical, Pen, Trash, Check, X, ArrowUp } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDraggableList } from "@/hooks/useDraggableList";
import { moveItemToTop } from "@/lib/utils";

interface SavedCollection {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
  display_order?: number;
}

export default function SavedCollections() {
  const router = useRouter();
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [originalCollections, setOriginalCollections] = useState<
    SavedCollection[]
  >([]);

  const {
    items: sortedCollections,
    setItems: setSortedCollections,
    isEditMode,
    toggleEditMode,
    onDragEnd,
  } = useDraggableList(collections);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
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
        setSortedCollections(collectionsWithCounts);
        setOriginalCollections(collectionsWithCounts); // Store the original order
      } else {
        const errorData = await response.json();
        console.error("Error fetching collections:", errorData);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const sortCollections = (collectionsToSort: SavedCollection[]) => {
    return collectionsToSort.sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );
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
        setCollections([...collections, { ...newCollection, videoCount: 0 }]);
        setNewCollectionName("");
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
        setCollections(
          collections.map((c) =>
            c.id === id ? { ...updatedCollection, videoCount: c.videoCount } : c
          )
        );
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
        setCollections(collections.filter((c) => c.id !== deleteId));
      }
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleEditKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleViewCollection = (collectionId: string) => {
    router.push(`/saved-collections/${collectionId}`);
  };

  const handleEnterEditMode = () => {
    setOriginalCollections([...sortedCollections]);
    toggleEditMode();
  };

  const handleSaveOrder = async () => {
    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: sortedCollections }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order on server");
      }

      setCollections(sortedCollections);
      toggleEditMode();
    } catch (error) {
      console.error("Error saving order:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleCancelEditMode = () => {
    setSortedCollections(originalCollections);
    toggleEditMode();
  };

  const handleMoveToTop = async (collectionId: string) => {
    const updatedCollections = moveItemToTop(sortedCollections, collectionId);
    setSortedCollections(updatedCollections);

    try {
      const response = await fetch("/api/saved-collections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: updatedCollections }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order on server");
      }

      setCollections(updatedCollections);
    } catch (error) {
      console.error("Error moving collection to top:", error);
      // Optionally, show an error message to the user and revert the change
      setSortedCollections(sortedCollections);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-between items-center mb-4 mt-16">
        <h1 className="text-2xl font-bold">Your Saved Collections</h1>
        {isEditMode ? (
          <div className="space-x-2">
            <Button onClick={handleSaveOrder} variant="default">
              Save Order
            </Button>
            <Button onClick={handleCancelEditMode} variant="outline">
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={handleEnterEditMode} variant="outline">
            Edit Order
          </Button>
        )}
      </div>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="collections" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
            >
              {sortedCollections.map((collection, index) => (
                <Draggable
                  key={collection.id}
                  draggableId={collection.id}
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-shadow ${
                        isEditMode && snapshot.isDragging ? "shadow-lg" : ""
                      }`}
                    >
                      <Card
                        className="flex flex-col h-full"
                        onClick={() =>
                          !isEditMode && handleViewCollection(collection.id)
                        }
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {collection.name}
                          </CardTitle>
                          {!isEditMode && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(collection.id, collection.name);
                                  }}
                                >
                                  <Pen className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToTop(collection.id);
                                  }}
                                >
                                  <ArrowUp className="mr-2 h-4 w-4" /> Move to Top
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(collection.id);
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-gray-500">
                            Created on:{" "}
                            {new Date(
                              collection.created_at
                            ).toLocaleDateString()}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <p>
                            {collection.videoCount} video
                            {collection.videoCount !== 1 ? "s" : ""}
                          </p>
                          {!isEditMode && (
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCollection(collection.id);
                              }}
                            >
                              View Collection
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <AlertDialog open={deleteId !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this collection?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              collection and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect, KeyboardEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
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
import { useCollections } from '@/hooks/useCollections';
import { CollectionCard } from "@/components/collection-card";
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';

interface SavedCollection {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
  display_order?: number;
}

export default function SavedCollections() {
  const router = useRouter();
  const {
    collections,
    isLoading,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    moveCollectionToTop,
    reorderCollections,
  } = useCollections();

  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [originalCollections, setOriginalCollections] = useState<SavedCollection[]>([]);

  const {
    items: sortedCollections,
    setItems: setSortedCollections,
    isEditMode,
    toggleEditMode,
    onDragEnd,
  } = useDraggableList(collections);

  useEffect(() => {
    setSortedCollections(collections);
  }, [collections, setSortedCollections]);

  const {
    deleteId: deleteConfirmationId,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    isDeleteConfirmationOpen,
  } = useDeleteConfirmation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName);
      setNewCollectionName("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateCollection();
    }
  };

  const handleEdit = async (id: string, newName: string) => {
    await updateCollection(id, newName);
  };

  const handleSaveEdit = async (id: string) => {
    if (editName.trim()) {
      await updateCollection(id, editName);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDeleteClick = (id: string) => {
    openDeleteConfirmation(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmationId) {
      await deleteCollection(deleteConfirmationId);
      closeDeleteConfirmation();
    }
  };

  const handleCancelDelete = () => {
    closeDeleteConfirmation();
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
    await reorderCollections(sortedCollections);
    toggleEditMode();
  };

  const handleCancelEditMode = () => {
    setSortedCollections(originalCollections);
    toggleEditMode();
  };

  const handleMoveToTop = async (collectionId: string) => {
    await moveCollectionToTop(collectionId);
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
                      <CollectionCard
                        collection={collection}
                        isEditMode={isEditMode}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onMoveToTop={handleMoveToTop}
                        onClick={() => handleViewCollection(collection.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={closeDeleteConfirmation}>
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
            <AlertDialogCancel onClick={closeDeleteConfirmation}>
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

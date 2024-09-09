"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDraggableList } from "@/hooks/useDraggableList";
import { useCollections } from "@/hooks/useCollections";
import { CollectionCard } from "@/components/collection-card";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { useNewCollectionInput } from '@/hooks/useNewCollectionInput';

export default function SavedCollections() {
  const router = useRouter();
  const {
    collections,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
    moveCollectionToTop,
    reorderCollections,
    isMoving, // Add this
  } = useCollections();

  const {
    items: sortedCollections,
    isEditMode,
    onDragEnd,
    enterEditMode,
    saveOrder,
    cancelEditMode,
    updateItems,
  } = useDraggableList(collections);

  const {
    newCollectionName,
    setNewCollectionName,
    handleCreateCollection,
    handleKeyPress,
  } = useNewCollectionInput(async (name) => {
    await createCollection(name);
  });

  const {
    deleteId: deleteConfirmationId,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    isDeleteConfirmationOpen,
  } = useDeleteConfirmation();

  useEffect(() => {
    updateItems(collections);
  }, [collections, updateItems]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEdit = async (id: string, newName: string) => {
    await updateCollection(id, newName);
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

  const handleViewCollection = (collectionId: string) => {
    router.push(`/saved-collections/${collectionId}`);
  };

  const handleSaveOrder = async () => {
    const newOrder = saveOrder();
    await reorderCollections(newOrder);
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
            <Button onClick={cancelEditMode} variant="outline">
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={enterEditMode} variant="outline">
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
      {isMoving && <div>Moving collection...</div>} {/* Add this line to show a loading state */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this collection?"
        description="This action cannot be undone. This will permanently delete the collection and all its contents."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

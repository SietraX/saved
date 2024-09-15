"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDraggableList } from "@/hooks/useDraggableList";
import { useCollections } from "@/hooks/useCollections";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { CollectionList } from "@/components/collection-list";
import { AdvancedSearchButton } from "@/components/advanced-search-button";
import { AdvancedSearchContainer } from "@/components/advanced-search-container";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
    isMoving,
  } = useCollections();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    items: sortedCollections,
    onDragEnd,
    updateItems,
  } = useDraggableList(collections ?? []);

  const {
    deleteId: deleteConfirmationId,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    isDeleteConfirmationOpen,
  } = useDeleteConfirmation();

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const handleAdvancedSearchClick = () => {
    setIsAdvancedSearchOpen(true);
  };

  useEffect(() => {
    updateItems(collections ?? []);
  }, [collections, updateItems]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      setIsCreating(true);
      try {
        await createCollection(newCollectionName.trim());
        setNewCollectionName("");
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Error creating collection:", error);
        // Optionally, show an error message to the user
      } finally {
        setIsCreating(false);
      }
    }
  };

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

  const handleDragEnd = async (result: any) => {
    onDragEnd(result);
    await reorderCollections(sortedCollections);
  };

  const handleMoveToTop = async (collectionId: string) => {
    await moveCollectionToTop(collectionId);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-between items-center mb-4 mt-16">
        <h1 className="text-2xl font-bold">Your Saved Collections</h1>
        {/* 
        <Button onClick={() => setIsEditOrderModalOpen(true)} variant="outline">
          Edit Order
        </Button>
        */}
      </div>
      <div className="flex space-x-2 mb-4">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Collection
        </Button>
        <AdvancedSearchButton onClick={handleAdvancedSearchClick} />
      </div>
      <CollectionList
        collections={sortedCollections}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onMoveToTop={handleMoveToTop}
        onViewCollection={handleViewCollection}
      />
      {isMoving && <div>Moving collection...</div>}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this collection?"
        description="This action cannot be undone. This will permanently delete the collection and all its contents."
        confirmText="Delete"
        cancelText="Cancel"
      />
      <AdvancedSearchContainer
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Enter a name for your new collection. Press Enter or click Create
              to save.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreateCollection();
                }
              }}
              disabled={isCreating}
            />
            <Button onClick={handleCreateCollection} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isEditOrderModalOpen}
        onOpenChange={setIsEditOrderModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection Order</DialogTitle>
            <DialogDescription>
              Drag and drop collections to reorder them. The new order will be
              saved automatically.
            </DialogDescription>
          </DialogHeader>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="collections">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {sortedCollections.map((collection, index) => (
                    <Draggable
                      key={collection.id}
                      draggableId={collection.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 mb-2 bg-gray-100 rounded"
                        >
                          {collection.name}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </DialogContent>
      </Dialog>
    </div>
  );
}

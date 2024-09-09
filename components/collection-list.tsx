import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { CollectionCard } from "@/components/collection-card";

interface Collection {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
}

interface CollectionListProps {
  collections: Collection[];
  isEditMode: boolean;
  onDragEnd: (result: DropResult) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onViewCollection: (id: string) => void;
}

export function CollectionList({
  collections,
  isEditMode,
  onDragEnd,
  onEdit,
  onDelete,
  onMoveToTop,
  onViewCollection,
}: CollectionListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="collections" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
          >
            {collections.map((collection, index) => (
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
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMoveToTop={onMoveToTop}
                      onClick={() => onViewCollection(collection.id)}
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
  );
}
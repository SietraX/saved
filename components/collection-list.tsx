import { CollectionCard } from "@/components/collection-card";

interface Collection {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
}

interface CollectionListProps {
  collections: Collection[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onViewCollection: (id: string) => void;
}

export function CollectionList({
  collections,
  onEdit,
  onDelete,
  onMoveToTop,
  onViewCollection,
}: CollectionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          isEditMode={false}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveToTop={onMoveToTop}
          onClick={() => onViewCollection(collection.id)}
        />
      ))}
    </div>
  );
}
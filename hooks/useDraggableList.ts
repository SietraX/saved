import { useState } from 'react';
import { DraggableLocation, DropResult } from '@hello-pangea/dnd';

export function useDraggableList<T extends { id: string; display_order?: number }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isEditMode, setIsEditMode] = useState(false);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // Update order for all items
    const updatedItems = newItems.map((item, index) => ({ ...item, display_order: index + 1 }));

    setItems(updatedItems);

    // Send the new order to the server
    try {
      const response = await fetch('/api/saved-collections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: updatedItems }),
      });

      if (!response.ok) {
        console.error('Failed to update order on server');
        // Optionally, revert the order in the UI
      }
    } catch (error) {
      console.error('Error updating order:', error);
      // Optionally, revert the order in the UI
    }
  };

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  return { items, setItems, isEditMode, toggleEditMode, onDragEnd };
}
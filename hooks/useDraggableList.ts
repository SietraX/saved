"use client";

import { useState, useCallback } from "react";
import { DraggableLocation, DropResult } from "@hello-pangea/dnd";

export function useDraggableList<
  T extends { id: string; display_order?: number }
>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalItems, setOriginalItems] = useState<T[]>([]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);

      // Update order for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        display_order: index + 1,
      }));

      setItems(updatedItems);
    },
    [items]
  );

  const enterEditMode = useCallback(() => {
    setOriginalItems([...items]);
    setIsEditMode(true);
  }, [items]);

  const saveOrder = useCallback(() => {
    setIsEditMode(false);
    return items;
  }, [items]);

  const cancelEditMode = useCallback(() => {
    setItems(originalItems);
    setIsEditMode(false);
  }, [originalItems]);

  const updateItems = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    isEditMode,
    onDragEnd,
    enterEditMode,
    saveOrder,
    cancelEditMode,
    updateItems,
  };
}

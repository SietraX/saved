import { useState, useCallback } from 'react';
import { moveItemToTop } from "@/lib/utils";

interface Item {
  id: string;
  display_order?: number;
}

export function useMoveToTop<T extends Item>(
  items: T[],
  updateOrder: (newOrder: T[]) => Promise<boolean>
) {
  const [isMoving, setIsMoving] = useState(false);

  const moveToTop = useCallback(async (id: string) => {
    setIsMoving(true);
    try {
      const updatedItems = moveItemToTop(items, id);
      const success = await updateOrder(updatedItems);
      if (!success) {
        throw new Error("Failed to update order on server");
      }
      return updatedItems;
    } catch (error) {
      console.error("Error moving item to top:", error);
      return null;
    } finally {
      setIsMoving(false);
    }
  }, [items, updateOrder]);

  return { moveToTop, isMoving };
}
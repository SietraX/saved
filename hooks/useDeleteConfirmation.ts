"use client"

import { useState } from 'react';

export function useDeleteConfirmation() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openDeleteConfirmation = (id: string) => {
    setDeleteId(id);
  };

  const closeDeleteConfirmation = () => {
    setDeleteId(null);
  };

  const isDeleteConfirmationOpen = deleteId !== null;

  return {
    deleteId,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    isDeleteConfirmationOpen,
  };
}
import React from 'react';
import { AdvancedSearchModal } from './advanced-search-modal';

interface AdvancedSearchContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedSearchContainer: React.FC<AdvancedSearchContainerProps> = ({ isOpen, onClose }) => {
  return (
    <AdvancedSearchModal
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
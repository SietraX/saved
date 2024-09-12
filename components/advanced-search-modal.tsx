import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedSearchModal = ({ isOpen, onClose }: AdvancedSearchModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        {/* Add advanced search form elements here later */}
        <p>Advanced search functionality will be implemented here.</p>
      </DialogContent>
    </Dialog>
  );
};
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface AdvancedSearchButtonProps {
  onClick: () => void;
}

export const AdvancedSearchButton = ({ onClick }: AdvancedSearchButtonProps) => {
  return (
    <Button onClick={onClick} variant="outline" className="ml-2">
      <Search className="mr-2 h-4 w-4" />
      Advanced Search
    </Button>
  );
};
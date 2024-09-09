import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pen, Trash, ArrowUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    created_at: string;
    videoCount: number;
  };
  isEditMode: boolean;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onClick: () => void;
}

export function CollectionCard({
  collection,
  isEditMode,
  onEdit,
  onDelete,
  onMoveToTop,
  onClick,
}: CollectionCardProps) {
  return (
    <Card
      className={`flex flex-col h-full ${
        !isEditMode
          ? "cursor-pointer hover:shadow-md transition-shadow"
          : ""
      }`}
      onClick={!isEditMode ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {collection.name}
        </CardTitle>
        {!isEditMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(collection.id, collection.name);
                }}
              >
                <Pen className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToTop(collection.id);
                }}
              >
                <ArrowUp className="mr-2 h-4 w-4" /> Move to Top
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(collection.id);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500">
          Created on: {new Date(collection.created_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter>
        <p>
          {collection.videoCount} video
          {collection.videoCount !== 1 ? "s" : ""}
        </p>
      </CardFooter>
    </Card>
  );
}
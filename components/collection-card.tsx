"use client"

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Pen, Trash, ArrowUp, Check, X } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleCancelEdit();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== collection.name) {
      onEdit(collection.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(collection.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <Card
      ref={cardRef}
      className={`flex flex-col h-full ${
        !isEditMode ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={() => {
        if (!isEditMode && !isEditing) onClick();
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-grow" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow"
              autoFocus
            />
            <Button onClick={handleSaveEdit} size="sm" variant="ghost">
              <Check className="h-4 w-4" />
            </Button>
            <Button onClick={handleCancelEdit} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <CardTitle className="text-sm font-medium">{collection.name}</CardTitle>
        )}
        {!isEditMode && !isEditing && (
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
                  setIsEditing(true);
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
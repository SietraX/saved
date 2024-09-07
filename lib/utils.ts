import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount, 10);
  if (count >= 1000000) {
    if (count >= 10000000) {
      return `${Math.floor(count / 1000000)}M`;
    }
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K`;
  }
  return viewCount;
}

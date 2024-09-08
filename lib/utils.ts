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

export function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

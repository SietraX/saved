export type PlaylistVideoProps = {
  id: string;
  snippet: {
    title: string;
    thumbnails?: { 
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
  statistics?: {
    viewCount?: string;
  };
  creatorContentType?: "SHORTS" | "VIDEO";
  contentDetails?: {
    duration?: string;
  };
  
};

export type PlaylistDetailsProps = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
    channelTitle?: string;
  };
  status?: {
    privacyStatus?: "private" | "public" | "unlisted";
  };
  contentDetails?: {
    itemCount?: number;
  };
};

export type FilterType = "all" | "videos" | "shorts";

export type PrivacyStatus = "public" | "unlisted" | "private";

export interface PlaylistProps {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
    };
  };
  status: {
    privacyStatus: PrivacyStatus;
  };
  contentDetails: {
    itemCount: number;
  };
}
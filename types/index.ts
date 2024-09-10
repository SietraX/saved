export type YoutubeVideoProps = {
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
    creatorContentType?: string;
  };
  statistics?: {
    viewCount?: string;
  };
  creatorContentType?: "SHORTS" | "VIDEO";
  contentDetails?: {
    duration?: string;
  };
};

export type SupabaseVideoProps = {
  id: string;
  video_id: string;
  title: string;
  thumbnail_url: string;
  channel_title: string;
  published_at: string;
  creator_content_type?: string;
};

export type PlaylistVideoProps = YoutubeVideoProps | SupabaseVideoProps;

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

export type PlaylistViewProps = {
  playlistId: string;
  type: "youtube" | "saved" | "liked";
};

export type VideoItemProps = {
  video: YoutubeVideoProps;
  type: "youtube" | "saved" | "liked";
  filterType: FilterType;
  onClick: () => void;
  onDelete?: (videoId: string) => void;
  collectionId?: string;
};

export interface SavedCollectionProps {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
}

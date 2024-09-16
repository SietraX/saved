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

export interface PlaylistDetailsProps {
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
    publishedAt?: string; // Add this line
  };
  contentDetails?: {
    itemCount: number;
  };
  status?: {
    privacyStatus: PrivacyStatus;
  };
}

export type FilterType = "all" | "videos" | "shorts";

export type PrivacyStatus = "public" | "unlisted" | "private";

export interface Playlist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
    };
    publishedAt?: string; // Add this line if it's not already there
  };
  status: {
    privacyStatus: PrivacyStatus;
  };
  contentDetails: {
    itemCount: number;
  };
}

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

export interface SavedVideoProps {
  id: string;
  title: string;
  thumbnail_url: string;
  channel_title: string;
  published_at: string;
  video_id: string;
  view_count?: string; // Add this line
}

export type VideoItemProps = {
  video: YoutubeVideoProps | SavedVideoProps;
  type: "youtube" | "liked" | "saved";
  filterType: FilterType;
  onClick: () => void;
  onDelete?: (id: string) => void;
  collectionId?: string;
};

export interface SavedCollectionProps {
  id: string;
  name: string;
  created_at: string;
  videoCount: number;
}

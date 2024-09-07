import { PlaylistView } from "@/components/playlist-view";

export default function SavedCollectionPage({ params }: { params: { id: string } }) {
  return <PlaylistView playlistId={params.id} type="saved" />;
}
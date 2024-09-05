import { PlaylistView } from "@/components/playlist-view";

export default function SavedPlaylistPage({ params }: { params: { id: string } }) {
  return <PlaylistView playlistId={params.id} />;
}
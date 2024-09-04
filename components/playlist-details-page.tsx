import { PlaylistView } from "@/components/playlist-view";

export default function PlaylistDetailsPage({ params }: { params: { id: string } }) {
  return <PlaylistView playlistId={params.id} />;
}

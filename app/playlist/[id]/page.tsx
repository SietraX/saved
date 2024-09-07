import { PlaylistView } from "@/components/playlist-view";

export default function PlaylistPage({ params }: { params: { id: string } }) {
  return <PlaylistView playlistId={params.id} type="youtube" />;
}

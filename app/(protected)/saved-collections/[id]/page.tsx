import { PlaylistView } from "@/components/playlist-view";

export default function SavedCollectionPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-4 pt-20">
      <PlaylistView playlistId={params.id} type="saved" />
    </main>
  );
}
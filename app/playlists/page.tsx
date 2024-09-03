import { Playlists } from '@/components/playlists'

export default function PlaylistsPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Your Playlists</h1>
      <Playlists />
    </div>
  )
}

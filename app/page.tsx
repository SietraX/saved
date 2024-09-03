import { LikedVideos } from '@/components/liked-videos'
import { Playlists } from '@/components/playlists'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">YouTube Collections</h1>
      <p className="text-xl mb-4">Welcome to your personalized YouTube content manager.</p>
      <p className="text-lg">Navigate to Playlists or Liked Videos to view your collections.</p>
    </main>
  )
}
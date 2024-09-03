import { LikedVideos } from '@/components/liked-videos'

export default function LikedVideosPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Your Liked Videos</h1>
      <LikedVideos />
    </div>
  )
}

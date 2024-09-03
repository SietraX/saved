'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Video = {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string }
    }
  }
};

export const LikedVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/youtube/liked-videos');
        if (!response.ok) throw new Error('Failed to fetch liked videos');
        const data = await response.json();
        setVideos(data.items || []);
        setFilteredVideos(data.items || []);
      } catch (error) {
        console.error('Error fetching liked videos:', error);
        setError('Failed to load liked videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedVideos();
  }, [session, status]);

  useEffect(() => {
    const filtered = videos.filter(video => 
      video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  if (status === 'loading') return <div>Loading session...</div>;
  if (status === 'unauthenticated') return <div>Please sign in to view liked videos.</div>;
  if (isLoading) return <div>Loading liked videos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Liked Videos</h2>
      <input
        type="text"
        placeholder="Search liked videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border rounded text-black"
      />
      {filteredVideos.length === 0 ? (
        <p>No matching videos found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <li key={video.id} className="border p-2 rounded bg-gray-800">
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} className="w-full" />
              <p className="mt-2">{video.snippet.title}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

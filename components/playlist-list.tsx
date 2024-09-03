'use client'

import { useState, useEffect } from 'react'

export const PlaylistList = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/youtube/playlists');
        const data = await response.json();
        setPlaylists(data.items || []);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (isLoading) return <div>Loading playlists...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
      <ul>
        {playlists.map((playlist: any) => (
          <li key={playlist.id} className="mb-2">
            {playlist.snippet.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

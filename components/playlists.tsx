'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/youtube/playlists', {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch playlists');
        const data = await response.json();
        setPlaylists(data.items || []);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError('Failed to load playlists. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [session, status]);

  if (status === 'loading') return <div>Loading session...</div>;
  if (status === 'unauthenticated') return <div>Please sign in to view playlists.</div>;
  if (isLoading) return <div>Loading playlists...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
      {playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        <ul>
          {playlists.map((playlist: any) => (
            <li key={playlist.id} className="mb-2">
              {playlist.snippet.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

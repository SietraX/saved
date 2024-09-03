'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type PrivacyStatus = 'public' | 'unlisted' | 'private';
type Playlist = {
  id: string;
  snippet: {
    title: string;
  };
  status: {
    privacyStatus: PrivacyStatus;
  };
};

export const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (status !== 'authenticated') {
        console.log('User not authenticated');
        return;
      }
      
      try {
        console.log('Fetching playlists...');
        const response = await fetch('/api/youtube/playlists');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Playlists fetched:', data);
        setPlaylists(data.items || []);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [session, status]);

  useEffect(() => {
    if (privacyFilter === 'all') {
      setFilteredPlaylists(playlists);
    } else {
      setFilteredPlaylists(playlists.filter(playlist => 
        playlist.status.privacyStatus === privacyFilter
      ));
    }
  }, [playlists, privacyFilter]);

  if (status === 'loading') return <div>Loading session...</div>;
  if (status === 'unauthenticated') return <div>Please sign in to view playlists.</div>;
  if (isLoading) return <div>Loading playlists...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
      <select 
        className="mb-4 p-2 border rounded bg-white text-black"
        onChange={(e) => setPrivacyFilter(e.target.value as PrivacyStatus | 'all')}
      >
        <option value="all" className="text-black">All</option>
        <option value="public" className="text-black">Public</option>
        <option value="unlisted" className="text-black">Unlisted</option>
        <option value="private" className="text-black">Private</option>
      </select>
      {filteredPlaylists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        <ul className="space-y-2">
          {filteredPlaylists.map((playlist) => (
            <li key={playlist.id} className="border p-2 rounded">
              {playlist.snippet.title} - {playlist.status.privacyStatus}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

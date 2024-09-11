import useSWR from 'swr';
import { Playlist } from '@/types/index';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useYoutubePlaylists() {
  const { data, error, isLoading } = useSWR<{ items: Playlist[] }>(
    '/api/youtube/playlists',
    fetcher
  );

  return {
    playlists: data?.items,
    isLoading,
    error
  };
}
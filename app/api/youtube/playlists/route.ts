import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getAuthenticatedYoutube } from '@/lib/youtube';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  accessToken?: string;
}

export async function GET() {
  const session = await getServerSession() as ExtendedSession;
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const youtube = getAuthenticatedYoutube(session.accessToken);

  try {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    console.log('Fetching Watch Later videos...');
    const response = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: 'WL',  // 'WL' is a special ID for the Watch Later playlist
      maxResults: 50
    });

    console.log('Watch Later response:', JSON.stringify(response.data, null, 2));

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in YouTube watch later API:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

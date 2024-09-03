import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    console.log('Token received:', token); // Log the token (be careful with sensitive info)

    if (!token?.accessToken) {
      console.log('No access token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: token.accessToken as string });

    console.log('OAuth2Client created with access token');

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    console.log('YouTube client created, attempting to fetch playlists');

    const response = await youtube.playlists.list({
      part: ['snippet', 'status'],
      mine: true,
      maxResults: 50
    });

    console.log('Playlists fetched successfully');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Detailed error in YouTube playlists API:', error);
    return NextResponse.json({ error: 'An error occurred', details: error }, { status: 500 });
  }
}

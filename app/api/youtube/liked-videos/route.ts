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

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails', 'status'],
      myRating: 'like',
      maxResults: 50
    });

    const videos = response.data.items?.map(item => {
      const duration = item.contentDetails?.duration;
      const width = item.snippet?.thumbnails?.maxres?.width || item.snippet?.thumbnails?.standard?.width || 0;
      const height = item.snippet?.thumbnails?.maxres?.height || item.snippet?.thumbnails?.standard?.height || 0;
      
      let isShort = false;

      if (duration) {
        // Parse the duration string
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (match) {
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          const seconds = parseInt(match[3]) || 0;
          
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;

          // Consider multiple factors to determine if it's a short:
          // 1. Duration is 60 seconds or less
          // 2. Video has a vertical aspect ratio (height > width)
          // 3. Check for "#shorts" in the title or description
          isShort = (totalSeconds <= 60 && height > width) || 
                    !!((item.snippet?.title?.toLowerCase().includes('#shorts')) ||
                       (item.snippet?.description?.toLowerCase().includes('#shorts')));
        }
      }

      return {
        ...item,
        creatorContentType: isShort ? 'SHORTS' : 'VIDEO_ON_DEMAND'
      };
    });

    return NextResponse.json({ items: videos });
  } catch (error) {
    console.error('Error in YouTube liked videos API:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

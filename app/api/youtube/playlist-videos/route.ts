import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const playlistId = req.nextUrl.searchParams.get("id");

  if (!token?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!playlistId) {
    return NextResponse.json(
      { error: "Playlist ID is required" },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token.accessToken as string });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  try {
    const response = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: playlistId,
      maxResults: 50,
    });

    const playlistItems = response.data.items;
    const videoIds = playlistItems?.map(item => item.contentDetails?.videoId).filter(Boolean) as string[];

    const videoDetailsResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails", "statistics"],
      id: videoIds,
    });

    const videoDetails = videoDetailsResponse.data.items;

    const videos = playlistItems?.map(item => {
      const videoDetail = videoDetails?.find(v => v.id === item.contentDetails?.videoId);
      return {
        ...item,
        id: item.contentDetails?.videoId, // Ensure this is set correctly
        statistics: videoDetail?.statistics,
        contentDetails: {
          ...item.contentDetails,
          duration: videoDetail?.contentDetails?.duration
        }
      };
    });

    return NextResponse.json({ items: videos });
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

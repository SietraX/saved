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

    const videoIds = response.data.items
      ?.map((item) => item.snippet?.resourceId?.videoId)
      .filter((id): id is string => typeof id === 'string') || [];

    const videoDetails = await youtube.videos.list({
      part: ["snippet", "statistics"],
      id: videoIds,
    });

    return NextResponse.json(videoDetails.data);
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

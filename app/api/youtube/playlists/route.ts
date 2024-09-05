import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.playlists.list({
      part: ["snippet", "status", "contentDetails"],
      mine: true,
      maxResults: 50,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Detailed error in YouTube playlists API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

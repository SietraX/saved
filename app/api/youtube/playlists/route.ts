import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      console.log("No access token found in the token object");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.playlists.list({
      part: ["snippet", "status"],
      mine: true,
      maxResults: 50,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Detailed error in YouTube playlists API:", error);
    return NextResponse.json(
      { error: "An error occurred", details: error },
      { status: 500 }
    );
  }
}

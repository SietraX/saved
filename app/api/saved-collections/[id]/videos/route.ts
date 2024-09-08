import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.sub || !token?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch saved collection videos from Supabase
    const { data: savedVideos, error } = await supabase
      .from("saved_collection_videos")
      .select("*")
      .eq("collection_id", params.id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract video IDs
    const videoIds = savedVideos.map(item => item.video_id);

    // Fetch additional details from YouTube API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Only make the API call if there are video IDs to fetch
    if (videoIds.length > 0) {
      const videoDetailsResponse = await youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: videoIds, // Pass the array of video IDs directly
      });

      const videoDetails = videoDetailsResponse.data.items;

      // Combine Supabase data with YouTube data
      const combinedVideos = savedVideos.map(savedVideo => {
        const youtubeData = videoDetails?.find(v => v.id === savedVideo.video_id);
        return {
          id: savedVideo.video_id,
          snippet: youtubeData?.snippet,
          contentDetails: youtubeData?.contentDetails,
          statistics: youtubeData?.statistics,
        };
      });

      return NextResponse.json({ items: combinedVideos });
    } else {
      // If there are no video IDs, return an empty array
      return NextResponse.json({ items: [] });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.sub || !token?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { videoUrl, collectionId } = await req.json();

    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Check if the video already exists in the collection
    const { data: existingVideo, error: checkError } = await supabase
      .from("saved_collection_videos")
      .select("video_id")
      .eq("collection_id", collectionId)
      .eq("video_id", videoId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Supabase error:", checkError);
      return NextResponse.json({ error: "Failed to check for existing video" }, { status: 500 });
    }

    if (existingVideo) {
      return NextResponse.json({ error: "Video already exists in this collection" }, { status: 409 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const videoResponse = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const videoDetails = videoResponse.data.items[0];

    const { error } = await supabase.from("saved_collection_videos").insert({
      collection_id: collectionId,
      video_id: videoId,
      user_id: token.sub,
      title: videoDetails.snippet?.title,
      thumbnail_url: videoDetails.snippet?.thumbnails?.default?.url,
      channel_title: videoDetails.snippet?.channelTitle,
      published_at: videoDetails.snippet?.publishedAt,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { fetchAndStoreTranscript } from "@/utils/transcriptHandler";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.sub || !token?.accessToken) {
      console.error("Authentication failed: Missing token or accessToken");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const videoId = body.videoId;
    const collectionId = body.collectionId;

    if (!videoId || !collectionId) {
      console.error("Missing required fields:", { videoId, collectionId });
      return NextResponse.json(
        { error: "Missing videoId or collectionId" },
        { status: 400 }
      );
    }

    // Check if the video already exists in the collection
    const { data: existingVideo, error: checkError } = await supabase
      .from("saved_collection_videos")
      .select("video_id")
      .eq("collection_id", collectionId)
      .eq("video_id", videoId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing video:", checkError);
      return NextResponse.json(
        { error: "Failed to check for existing video" },
        { status: 500 }
      );
    }

    if (existingVideo) {
      return NextResponse.json(
        { error: "Video already exists in this collection" },
        { status: 409 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const videoResponse = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      console.error("Video not found on YouTube");
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const videoDetails = videoResponse.data.items[0];

    const { error } = await supabase.from("saved_collection_videos").insert({
      collection_id: collectionId,
      video_id: videoId,
      user_id: token.sub,
      title: videoDetails.snippet?.title,
      thumbnail_url: videoDetails.snippet?.thumbnails?.default?.url,
      channel_title: videoDetails.snippet?.channelTitle || null,
      published_at: videoDetails.snippet?.publishedAt,
    });

    if (error) {
      console.error("Error adding video to collection:", error);
      return NextResponse.json(
        { error: "Failed to add video" },
        { status: 500 }
      );
    }

    // After successfully inserting the video
    await fetchAndStoreTranscript(videoId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in add-video route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

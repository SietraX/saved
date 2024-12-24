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
  console.log("Starting video addition process");
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("Auth token status:", token ? "Present" : "Missing");

    if (!token?.sub || !token?.accessToken) {
      console.error("Authentication failed: Missing token or accessToken");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const videoId = body.videoId;
    const collectionId = body.collectionId;
    console.log(
      `Processing request for videoId: ${videoId}, collectionId: ${collectionId}`
    );

    if (!videoId || !collectionId) {
      console.error("Missing required fields:", { videoId, collectionId });
      return NextResponse.json(
        { error: "Missing videoId or collectionId" },
        { status: 400 }
      );
    }

    // Check if the video already exists in the collection
    console.log("Checking for existing video in collection");
    const { data: existingVideo, error: checkError } = await supabase
      .from("saved_collection_videos")
      .select("video_id")
      .eq("collection_id", collectionId)
      .eq("video_id", videoId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Supabase error checking existing video:", checkError);
      return NextResponse.json(
        { error: "Failed to check for existing video" },
        { status: 500 }
      );
    }

    if (existingVideo) {
      console.log("Video already exists in collection");
      return NextResponse.json(
        { error: "Video already exists in this collection" },
        { status: 409 }
      );
    }

    console.log("Initializing YouTube API client");
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    console.log("Fetching video details from YouTube");
    const videoResponse = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      console.error("Video not found on YouTube");
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const videoDetails = videoResponse.data.items[0];
    console.log("Video details retrieved:", {
      title: videoDetails.snippet?.title,
      channelTitle: videoDetails.snippet?.channelTitle,
    });

    console.log("Adding video to collection in Supabase");
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

    console.log("Video added successfully, starting transcript fetch");
    // After successfully inserting the video
    await fetchAndStoreTranscript(videoId);
    console.log("Transcript process completed");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in add-video route:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

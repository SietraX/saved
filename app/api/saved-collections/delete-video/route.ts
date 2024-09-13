import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.sub) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { videoId, collectionId } = await req.json();

    // Delete the video from the collection
    const { error: deleteError } = await supabase
      .from("saved_collection_videos")
      .delete()
      .match({ video_id: videoId, collection_id: collectionId, user_id: token.sub });

    if (deleteError) {
      console.error("Supabase error:", deleteError);
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    }

    // Check if the video exists in any other collections
    const { data: existingVideos, error: checkError } = await supabase
      .from("saved_collection_videos")
      .select("id")
      .eq("video_id", videoId)
      .limit(1);

    if (checkError) {
      console.error("Supabase error:", checkError);
      return NextResponse.json({ error: "Failed to check video existence" }, { status: 500 });
    }

    // If the video doesn't exist in any other collections, delete its transcript
    if (existingVideos.length === 0) {
      const { error: transcriptDeleteError } = await supabase
        .from("video_transcripts")
        .delete()
        .eq("video_id", videoId);

      if (transcriptDeleteError) {
        console.error("Supabase error:", transcriptDeleteError);
        return NextResponse.json({ error: "Failed to delete transcript" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
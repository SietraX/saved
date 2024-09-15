import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getToken } from "next-auth/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TranscriptSegment {
  text: string;
  start: number;
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.sub) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchTerm } = await req.json();

    // First, get the video_ids from the user's saved collections
    const { data: userVideos, error: userVideosError } = await supabase
      .from("saved_collection_videos")
      .select("video_id")
      .eq("user_id", token.sub);

    if (userVideosError) {
      console.error("Error fetching user videos:", userVideosError);
      return NextResponse.json(
        { error: "Failed to fetch user videos" },
        { status: 500 }
      );
    }

    const userVideoIds = userVideos.map((v) => v.video_id);

    // Now, search within these videos
    const { data, error } = await supabase
      .from("video_transcripts")
      .select(
        `
        video_id,
        title,
        transcript,
        videos!video_transcripts_video_uuid_fkey(thumbnail_url)
      `
      )
      .textSearch("transcript_search", `'${searchTerm}'`, {
        type: "plain",
        config: "english",
      })
      .in("video_id", userVideoIds);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to perform search" },
        { status: 500 }
      );
    }

    const processedResults = (data as any[]).map((item) => {
      const matchedSegments = item.transcript.filter(
        (segment: TranscriptSegment) =>
          segment.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return {
        videoId: item.video_id,
        title: item.title,
        thumbnailUrl: item.videos?.thumbnail_url,
        matches: matchedSegments.map((segment: TranscriptSegment) => ({
          text: segment.text,
          timestamp: segment.start,
        })),
      };
    });

    return NextResponse.json({ results: processedResults });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { results: [], error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

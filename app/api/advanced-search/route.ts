import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TranscriptSegment {
  text: string;
  start: number;
}

interface VideoTranscript {
  video_id: string;
  title: string;
  transcript: TranscriptSegment[];
}

export async function POST(req: NextRequest) {
  try {
    const { searchTerm } = await req.json();

    const { data, error } = await supabase
      .from("video_transcripts")
      .select("video_id, title, transcript")
      .textSearch('transcript_search', searchTerm, {
        type: 'plain',
        config: 'english'
      });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }

    // Process the results to include timestamps and matched text
    const processedResults = (data as VideoTranscript[]).map(item => {
      const matchedSegments = item.transcript.filter(segment =>
        segment.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return {
        videoId: item.video_id,
        title: item.title,
        matches: matchedSegments.map(segment => ({
          text: segment.text,
          timestamp: segment.start
        }))
      };
    });

    return NextResponse.json({ results: processedResults });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
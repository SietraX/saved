import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchAndStoreTranscript(videoId: string) {
  try {
    // Check if transcript already exists
    const { data: existingTranscript } = await supabase
      .from("video_transcripts")
      .select("id")
      .eq("video_id", videoId)
      .single();

    if (existingTranscript) {
      console.log(`Transcript for video ${videoId} already exists`);
      return;
    }

    const response = await fetch(
      `http://localhost:8000/api/transcript/${videoId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.statusText}`);
    }

    const transcriptData = await response.json();

    // Store the transcript in Supabase
    const { error: insertError } = await supabase
      .from("video_transcripts")
      .insert({
        video_id: videoId,
        transcript: transcriptData.transcript,
        // Add other relevant fields here
      });

    if (insertError) {
      throw new Error(`Failed to store transcript: ${insertError.message}`);
    }

    console.log(`Successfully fetched and stored transcript for video ${videoId}`);
  } catch (error) {
    console.error("Error fetching and storing transcript:", error);
  }
}
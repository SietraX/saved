import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function logWithTimestamp(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

export async function fetchAndStoreTranscript(videoId: string) {
  try {
    logWithTimestamp(`Starting transcript fetch for video ${videoId}`);

    // Check if transcript already exists
    const { data: existingTranscript, error: checkError } = await supabase
      .from("video_transcripts")
      .select("*")
      .eq("video_id", videoId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      logWithTimestamp("Error checking existing transcript:", checkError);
      throw new Error(
        `Failed to check existing transcript: ${checkError.message}`
      );
    }

    if (existingTranscript) {
      // Update fetch count and last_fetched
      const { error: updateError } = await supabase
        .from("video_transcripts")
        .update({
          fetch_count: (existingTranscript.fetch_count || 0) + 1,
          last_fetched: new Date().toISOString(),
        })
        .eq("video_id", videoId);

      if (updateError) {
        logWithTimestamp("Error updating fetch count:", updateError);
      }
      return existingTranscript;
    }

    const response = await fetch(
      `http://127.0.0.1:8001/api/transcript/${videoId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch transcript: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const transcriptData = await response.json();

    // Store the transcript in Supabase with all fields
    const insertData = {
      video_id: videoId,
      transcript: transcriptData.transcript,
      title: transcriptData.title,
      channel_id: transcriptData.channel_id,
      channel_title: transcriptData.channel_title,
      published_at: transcriptData.published_at,
      language: transcriptData.language,
      is_generated: transcriptData.is_generated,
      duration: transcriptData.duration,
      fetch_count: 1,
      last_fetched: new Date().toISOString(),
      processing_status: "completed",
    };

    const { error: insertError } = await supabase
      .from("video_transcripts")
      .insert(insertData);

    if (insertError) {
      // If it's a duplicate key error, treat it as a success
      if (insertError.code === "23505") {
        const { data: existingData } = await supabase
          .from("video_transcripts")
          .select("*")
          .eq("video_id", videoId)
          .single();
        return existingData;
      }

      logWithTimestamp("Error inserting transcript:", insertError);
      throw new Error(`Failed to store transcript: ${insertError.message}`);
    }

    logWithTimestamp(`Completed transcript fetch for video ${videoId}`);
    return insertData;
  } catch (error) {
    logWithTimestamp("Error in fetchAndStoreTranscript:", error);
    throw error;
  }
}

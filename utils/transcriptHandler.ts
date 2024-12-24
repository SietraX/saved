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
    logWithTimestamp(
      `=== Starting transcript fetch process for video ${videoId} ===`
    );
    logWithTimestamp("Supabase configuration:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "Missing",
      key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Present" : "Missing",
    });

    // Check if transcript already exists
    logWithTimestamp("Checking for existing transcript in Supabase");
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
      logWithTimestamp(
        `Transcript for video ${videoId} already exists, updating fetch count`
      );
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
        // Don't throw error here, just log it
      }

      logWithTimestamp("Successfully updated existing transcript");
      return existingTranscript;
    }

    logWithTimestamp(
      `Making request to transcript backend for video ${videoId}`
    );
    const response = await fetch(
      `http://127.0.0.1:8001/api/transcript/${videoId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    logWithTimestamp("Backend response status:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logWithTimestamp("Backend error response:", errorText);
      throw new Error(
        `Failed to fetch transcript: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const transcriptData = await response.json();
    logWithTimestamp(`Received transcript data from backend:`, {
      dataPresent: !!transcriptData,
      transcriptLength: transcriptData?.transcript?.length || 0,
      fields: Object.keys(transcriptData),
    });

    // Store the transcript in Supabase with all fields
    logWithTimestamp(`Preparing to store transcript in Supabase`);
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
    logWithTimestamp("Insert data prepared:", {
      hasTranscript: !!insertData.transcript,
      hasTitle: !!insertData.title,
      fields: Object.keys(insertData),
    });

    const { error: insertError } = await supabase
      .from("video_transcripts")
      .insert(insertData);

    if (insertError) {
      // If it's a duplicate key error, treat it as a success
      if (insertError.code === "23505") {
        logWithTimestamp(
          "Transcript already exists (concurrent insert), treating as success"
        );
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

    logWithTimestamp(
      `=== Successfully completed transcript fetch and storage for video ${videoId} ===`
    );
    return insertData;
  } catch (error) {
    logWithTimestamp("=== ERROR in fetchAndStoreTranscript ===");
    logWithTimestamp("Error details:", error);
    if (error instanceof Error) {
      logWithTimestamp("Error stack:", error.stack);
    }
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

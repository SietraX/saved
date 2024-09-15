import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
import { google, youtube_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateUniqueName(userId: string, baseName: string): Promise<string> {
  let name = baseName;
  let suffix = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data, error } = await supabase
      .from("saved_collections")
      .select("id")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

    if (error || !data) {
      isUnique = true;
    } else {
      name = `${baseName} (${suffix})`;
      suffix++;
    }
  }

  return name;
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { playlistIds } = await req.json();

    if (!playlistIds || !Array.isArray(playlistIds) || playlistIds.length === 0) {
      return NextResponse.json({ error: "Invalid playlist IDs" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    let clonedCount = 0;

    for (const playlistId of playlistIds) {
      try {
        // Fetch playlist details
        const playlistResponse = await youtube.playlists.list({
          part: ["snippet"],
          id: [playlistId],
        });

        const playlistDetails = playlistResponse.data.items?.[0];
        if (!playlistDetails) {
          continue;
        }

        // Generate a unique name for the new collection
        const baseName = playlistDetails.snippet?.title || `Cloned Playlist ${playlistId}`;
        const uniqueName = await generateUniqueName(token.sub as string, baseName);

        // Create a new saved collection
        const { data: newCollection, error: collectionError } = await supabase
          .from("saved_collections")
          .insert({ user_id: token.sub, name: uniqueName })
          .select()
          .single();

        if (collectionError) {
          console.error("Error creating collection:", collectionError);
          continue;
        }


        let pageToken: string | undefined = undefined;
        do {
          const response: GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse> = await youtube.playlistItems.list({
            part: ["snippet", "contentDetails"],
            playlistId: playlistId,
            maxResults: 50,
            pageToken: pageToken,
          });

          const playlistItems = response.data.items;
          if (!playlistItems) {
            continue;
          }

          const videoIds = playlistItems.map((item: youtube_v3.Schema$PlaylistItem) => item.contentDetails?.videoId).filter(Boolean) as string[];

          const videoDetailsResponse = await youtube.videos.list({
            part: ["snippet", "contentDetails"],
            id: videoIds,
          });

          const videoDetails = videoDetailsResponse.data.items;

          const videosToInsert = videoDetails?.map(video => ({
            collection_id: newCollection.id,
            video_id: video.id!,
            user_id: token.sub,
            title: video.snippet?.title,
            thumbnail_url: video.snippet?.thumbnails?.default?.url,
            channel_title: video.snippet?.channelTitle,
            published_at: video.snippet?.publishedAt,
          }));

          if (videosToInsert && videosToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from("saved_collection_videos")
              .insert(videosToInsert);

            if (insertError) {
              console.error("Error inserting videos:", insertError);
            } else {
            }
          } else {
          }

          pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);

        clonedCount++;
      } catch (playlistError) {
        console.error(`Error processing playlist ${playlistId}:`, playlistError);
      }
    }

    return NextResponse.json({ success: true, clonedCount });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
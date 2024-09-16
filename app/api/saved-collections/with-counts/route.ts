import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.sub) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: collections, error } = await supabase
      .from("saved_collections")
      .select(`
        *,
        saved_collection_videos (
          thumbnail_url
        )
      `)
      .eq("user_id", token.sub)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const { count, data: videos } = await supabase
          .from("saved_collection_videos")
          .select("*", { count: "exact" })
          .eq("collection_id", collection.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const video = videos && videos[0];
        let thumbnailUrl = "/default-playlist-image.png";

        if (video && video.thumbnail_url) {
          // Try to get the highest quality thumbnail
          thumbnailUrl = video.thumbnail_url.replace('/default.', '/maxresdefault.');
        }

        return {
          ...collection,
          videoCount: count || 0,
          thumbnailUrl
        };
      })
    );

    return NextResponse.json(collectionsWithCounts);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
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

    const { data: collections, error: collectionsError } = await supabase
      .from("saved_collections")
      .select("*")
      .eq("user_id", token.sub)
      .order("display_order", { ascending: true });

    if (collectionsError) {
      console.error("Supabase error:", collectionsError);
      return NextResponse.json({ error: collectionsError.message }, { status: 500 });
    }

    const { data: videoCounts, error: countsError } = await supabase
      .from("saved_collection_videos")
      .select("collection_id")
      .eq("user_id", token.sub);

    if (countsError) {
      console.error("Supabase error:", countsError);
      return NextResponse.json({ error: "Failed to fetch video counts" }, { status: 500 });
    }

    const counts = videoCounts.reduce((acc, item) => {
      acc[item.collection_id] = (acc[item.collection_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const collectionsWithCounts = collections.map(collection => ({
      ...collection,
      videoCount: counts[collection.id] || 0
    }));

    return NextResponse.json(collectionsWithCounts);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
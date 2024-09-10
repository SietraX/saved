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

    const { data, error } = await supabase
      .from("saved_collection_videos")
      .select("collection_id")
      .eq("user_id", token.sub);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch video counts" }, { status: 500 });
    }

    const videoCounts = data.reduce((acc, item) => {
      acc[item.collection_id] = (acc[item.collection_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(videoCounts);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
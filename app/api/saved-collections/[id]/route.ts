import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name } = await req.json();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("saved_collections")
    .update({ name, updated_at: now })
    .eq("id", params.id)
    .eq("user_id", token.sub)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Start a Supabase transaction
  const { data, error } = await supabase.rpc('delete_collection_and_videos', {
    p_collection_id: params.id,
    p_user_id: token.sub
  });

  if (error) {
    console.error("Error deleting collection and videos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_collections")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", token.sub)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

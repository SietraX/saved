import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { collections } = await req.json();

  // Update the order for each collection
  const updates = collections.map((collection: any, index: number) => 
    supabase
      .from('saved_collections')
      .update({ display_order: index })
      .eq('id', collection.id)
      .eq('user_id', token.sub)
  );

  const results = await Promise.all(updates);

  // Check if any update failed
  const hasError = results.some(result => result.error);

  if (hasError) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('saved_collection_videos')
      .select('collection_id')
      .eq('video_id', videoId);

    if (error) throw error;

    const collectionsWithVideo = data.map(item => item.collection_id);

    res.status(200).json({ collectionsWithVideo });
  } catch (error) {
    console.error('Error checking video in collections:', error);
    res.status(500).json({ error: 'An error occurred while checking the video in collections' });
  }
}
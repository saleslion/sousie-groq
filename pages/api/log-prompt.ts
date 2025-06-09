
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, response } = req.body;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { error } = await supabase.from('prompts').insert({ user_id: user.id, text: prompt, response });
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Saved' });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userId, cuisineFilter, surprise } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages missing or malformed' });
  }

  try {
    const groqRes = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages,
      temperature: 0.7,
    });

    const reply = groqRes.choices?.[0]?.message?.content || '';

    // Optional: Log to Supabase
    if (userId) {
      await supabase.from('prompts').insert([
        {
          user_id: userId,
          messages,
          response: reply,
          surprise,
          cuisine_filter: cuisineFilter || null,
        },
      ]);
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Groq API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

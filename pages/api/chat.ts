// /pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const groqApiKey = process.env.GROQ_API_KEY!;
const model = 'llama3-70b-8192';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid messages' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();

    const message = data.choices?.[0]?.message?.content;
    if (!message) return res.status(500).json({ error: 'No content from AI' });

    // Optionally log entire conversation
    await supabase.from('chat_logs').insert([{ thread: JSON.stringify(messages), reply: message }]);

    res.status(200).json({ reply: message });
  } catch (err) {
    console.error('Chat API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

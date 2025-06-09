// /pages/api/groq.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

if (!supabaseUrl || !supabaseKey || !groqApiKey) {
  throw new Error('❌ Missing SUPABASE_URL, SUPABASE_ANON_KEY, or GROQ_API_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const buildPrompt = (ingredients: string) => `
You are a professional AI chef assistant. Generate a full menu using the following ingredients: ${ingredients}

Return exactly:
- 4 main dishes
- 4 side dishes

Each dish must include:
- name
- short description
- ingredients (with both metric and US units)
- detailed step-by-step preparation instructions (5–8 steps as an array of strings)

Return ONLY valid JSON. Do NOT include any explanation or extra text. Format:

{
  "mains": [
    {
      "name": "...",
      "description": "...",
      "ingredients": [
        { "item": "chicken breast", "metric": "200g", "us": "7oz" }
      ],
      "steps": [
        "Step 1: ...",
        "Step 2: ..."
      ]
    }
  ],
  "sides": [ ... ]
}
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ingredients } = req.body;
  if (!ingredients || typeof ingredients !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid ingredients' });
  }

  const prompt = buildPrompt(ingredients);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: 'No valid response from Groq' });
    }

    const content = data.choices[0].message.content;
    const first = content.indexOf('{');
    const last = content.lastIndexOf('}');
    if (first === -1 || last === -1) {
      return res.status(500).json({ error: 'No JSON block found' });
    }

    const jsonBlock = content.slice(first, last + 1);

    await supabase.from('logs').insert([{ prompt, response: jsonBlock }]);

    return res.status(200).json({ result: jsonBlock });
  } catch (error) {
    console.error('❌ Groq API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

import { ChatCompletionMessageParam } from 'openai/resources';
import { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  try {
    const groqRes = await groq.chat.completions.create({
      messages: messages as ChatCompletionMessageParam[],
      model: 'llama3-70b-8192',
    });

    const reply = groqRes.choices?.[0]?.message?.content;
    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('❌ GROQ API error:', error);
    res.status(500).json({ error: 'Failed to get reply from AI.' });
  }
}

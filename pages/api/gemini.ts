
import type { NextApiRequest, NextApiResponse } from 'next';
import { askGemini } from '../../lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  const result = await askGemini(prompt);
  res.status(200).json({ result });
}

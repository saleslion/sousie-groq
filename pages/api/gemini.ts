// pages/api/gemini.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing Gemini API Key' })
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    res.status(200).json({ result })
  } catch (err: any) {
    console.error('Gemini error:', err?.response?.data || err.message)
    res.status(500).json({ error: 'Failed to connect to Gemini API' })
  }
}

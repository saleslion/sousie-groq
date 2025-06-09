import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  const { prompt } = req.body

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY in .env.local' })
  }

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt must be a non-empty string' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini API error:', data)
      return res.status(response.status).json({ error: data.error?.message || 'Unknown Gemini error' })
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated'
    return res.status(200).json({ result: resultText })

  } catch (err: any) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

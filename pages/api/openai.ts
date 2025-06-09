// pages/api/openai.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const openaiKey = process.env.OPENAI_API_KEY!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // 👈 switched to available model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (data.error) {
      return res.status(500).json({ error: data.error.message })
    }

    const result = data.choices?.[0]?.message?.content || 'No response.'
    res.status(200).json({ result })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to connect to OpenAI' })
  }
}

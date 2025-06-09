// pages/api/get-feedback.ts
import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'demo-user-id' // fallback since we're not using auth for now

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('prompt, response')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('🔴 Supabase error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  } catch (err: any) {
    console.error('🔴 Unknown API error:', err.message || err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}

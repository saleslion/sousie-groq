// pages/api/get-feedback.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req, res) {
  const userId = 'demo-user-id' // TEMP userId

  const { data, error } = await supabase
    .from('feedback')
    .select('prompt, response')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) return res.status(500).json({ error })
  res.status(200).json(data)
}

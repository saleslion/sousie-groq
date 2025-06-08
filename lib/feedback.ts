// lib/feedback.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function submitFeedback(userId: string, prompt: string, response: string, rating: number) {
  return await supabase.from('feedback').insert([{ user_id: userId, prompt, response, rating }])
}

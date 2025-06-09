// lib/logRecipe.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const logRecipe = async (prompt: string, cuisine: string, fullResponse: any) => {
  const { error } = await supabase.from('recipes').insert({
    prompt,
    cuisine,
    full_response: fullResponse,
  })

  if (error) {
    console.error('❌ Failed to log recipe:', error)
  }
}

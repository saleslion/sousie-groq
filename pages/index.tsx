import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useState } from 'react'
import Rating from '../components/Rating'
import { submitFeedback } from '../lib/feedback'

export default function Home() {
  const { data: session } = useSession()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')

  const askAI = async () => {
    const customPrompt = `I have the following ingredients: ${prompt}. Suggest a menu with 1 main dish and 2 side dishes.`

    try {
      const historyRes = await axios.get('/api/get-feedback')
      const memory = historyRes.data
        .map((p: any) => `User asked: "${p.prompt}" → You answered: "${p.response}"`)
        .join('\n')

      const fullPrompt = `Context:\n${memory}\nNew request:\n${customPrompt}`

      const { data } = await axios.post('/api/gemini', { prompt: fullPrompt })
      setResponse(data.result)

      if (session?.user) {
        await axios.post('/api/log-prompt', {
          prompt: customPrompt,
          response: data.result
        })
      }
    } catch (err) {
      console.error('AI call failed:', err)
      setResponse("❌ Failed to generate response. Please check your Gemini API key.")
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sousie – Your Smart Cooking Assistant</h1>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="What ingredients do you have?"
      />
      <button
        onClick={askAI}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Ask Sousie
      </button>

      {response && (
        <>
          <p className="mt-6 whitespace-pre-wrap">{response}</p>
          <Rating
            onRate={(rating) => {
              if (session?.user) {
                submitFeedback(session.user.id, prompt, response, rating)
              }
            }}
          />
        </>
      )}
    </div>
  )
}

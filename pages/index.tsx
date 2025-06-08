
import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useSession } from '@supabase/auth-helpers-react';

export default function Home() {
  const [recipe, setRecipe] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const session = useSession();

  const surpriseMe = async () => {
    const { data } = await axios.get('/api/surprise');
    setRecipe(data);
  };

  const askAI = async () => {
    const customPrompt = `I have the following ingredients: ${prompt}. Suggest a menu with 1 main dish and 2 side dishes.`;
    const { data } = await axios.post('/api/gemini', { prompt: customPrompt });
    setResponse(data.result);
    if (session?.user) {
      await axios.post('/api/log-prompt', { prompt: customPrompt, response: data.result });
    }
  };

  const signIn = async () => await supabase.auth.signInWithOAuth({ provider: 'google' });
  const signOut = async () => await supabase.auth.signOut();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl mb-4 font-bold">🍳 Sousie – Your AI Kitchen Pal</h1>
      {session ? (
        <div className="mb-4">Welcome, {session.user.email}! <button onClick={signOut} className="text-red-600 ml-2">Sign Out</button></div>
      ) : (
        <button className="bg-gray-800 text-white px-4 py-2 rounded mb-4" onClick={signIn}>Sign in with Google</button>
      )}
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={surpriseMe}>Surprise Me!</button>
      {recipe && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{recipe.strMeal}</h2>
          <img src={recipe.strMealThumb} alt={recipe.strMeal} className="w-full rounded-md" />
          <p className="mt-2 text-sm">{recipe.strInstructions}</p>
        </div>
      )}
      <input
        type="text"
        placeholder="Enter ingredients (e.g. chicken, rice, carrots)"
        className="border p-2 w-full mb-2"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={askAI}>Ask Sousie</button>
      {response && <div className="mt-4 p-2 border rounded"><p>{response}</p></div>}
    </div>
  );
}

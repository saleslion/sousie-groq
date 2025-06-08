
import axios from 'axios';

export async function askGemini(prompt: string) {
  const res = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );
  return res.data.candidates[0].content.parts[0].text;
}

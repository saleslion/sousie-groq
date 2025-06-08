// pages/api/gemini.ts

export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '❌ Gemini API key not found in env.' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt || 'Suggest a delicious meal for dinner tonight.' }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('🔴 Gemini error response:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Unknown Gemini API error.' });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No AI result returned.';
    return res.status(200).json({ result });

  } catch (err) {
    console.error('❌ Gemini request failed:', err);
    return res.status(500).json({ error: 'Gemini request failed.' });
  }
}

import { useState } from 'react';
import Head from 'next/head';
import MenuDisplay from '../components/MenuDisplay';

type Role = 'user' | 'assistant';

type Message = {
  role: Role;
  content: string;
};

type MenuData = {
  menu?: string;
  main: (string | any)[];
  side: (string | any)[];
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [unit, setUnit] = useState<'metric' | 'us'>('metric');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput('');
    await fetchAndParseReply(newMessages);
  };

  const fetchAndParseReply = async (chatHistory: Message[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      const reply = data.reply;

      let parsed: MenuData | null = null;
      try {
        parsed = JSON.parse(reply);
      } catch {
        parsed = null;
      }

      setMenuData(parsed);
      setMessages([...chatHistory, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Failed to fetch reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurprise = async () => {
    const surprisePrompt = {
      role: 'user',
      content: 'Surprise me with 4 delicious menus to cook today. Each menu should include 4 mains and 4 sides.',
    };
    const newMessages: Message[] = [surprisePrompt];
    setMessages([surprisePrompt]);
    await fetchAndParseReply(newMessages);
  };

  const handleReset = () => {
    setMessages([]);
    setMenuData(null);
    setInput('');
  };

  return (
    <>
      <Head>
        <title>Sousie – Your AI Cooking Assistant</title>
      </Head>
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">🍳 Sousie – What’s Cooking?</h1>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            🔁 Start Over
          </button>
          <button
            onClick={handleSurprise}
            className="px-4 py-2 rounded-xl bg-green-200 hover:bg-green-300 transition"
          >
            🎲 Surprise Me
          </button>
          <button
            onClick={() => setUnit(unit === 'metric' ? 'us' : 'metric')}
            className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 transition ml-auto"
          >
            🔄 Unit: {unit === 'metric' ? 'Metric' : 'US'}
          </button>
        </div>

        {menuData && <MenuDisplay menuData={menuData} unit={unit} />}

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 border rounded-xl"
              placeholder="What do you feel like cooking?"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
            >
              {loading ? 'Cooking...' : 'Ask'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

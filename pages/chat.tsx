import React, { useState, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Ingredient = {
  item: string;
  metric: string;
  us: string;
};

type Dish = {
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
};

type MenuData = {
  mains: Dish[];
  sides: Dish[];
};

export default function SousieChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi, I’m Sousie! What ingredients do you have or what do you feel like cooking?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleDish = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Hi again! What’s in your pantry or what do you feel like cooking today?',
      },
    ]);
    setInput('');
    setMenu(null);
    setExpanded({});
  };

  const handleSurprise = async () => {
    setLoading(true);
    const surprisePrompt: Message = {
      role: 'user',
      content:
        'Surprise me with 4 diverse and exciting menus with fun names, a main dish and side dish, with ingredients and steps in a fun narrative tone like "Sunset in a Bowl".',
    };

    await fetchAndParseReply([...messages, surprisePrompt]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setInput('');
    await fetchAndParseReply(newMessages);
  };

  const fetchAndParseReply = async (chatHistory: Message[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      const content = data.reply || 'Sorry, Sousie had trouble thinking. Try again!';
      setMessages([...chatHistory, { role: 'assistant', content }]);

      const first = content.indexOf('[');
      const last = content.lastIndexOf(']');
      if (first !== -1 && last !== -1) {
        const raw = content.slice(first, last + 1)
          .replace(/“|”/g, '"')
          .replace(/‘|’/g, "'")
          .replace(/,\s*([}\]])/g, '$1');

        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const converted: MenuData = {
              mains: parsed.map((m: any) => ({
                name: m.main?.dish || m.main || 'Main Dish',
                description: m.menu || '',
                ingredients: m.main?.ingredients
                  ? Object.entries(m.main.ingredients).map(([item, amount]) => ({
                      item,
                      metric: amount,
                      us: amount,
                    }))
                  : [],
                steps: m.main?.steps || [],
              })),
              sides: parsed.map((m: any) => ({
                name: m.side?.dish || m.side || 'Side Dish',
                description: m.menu || '',
                ingredients: m.side?.ingredients
                  ? Object.entries(m.side.ingredients).map(([item, amount]) => ({
                      item,
                      metric: amount,
                      us: amount,
                    }))
                  : [],
                steps: m.side?.steps || [],
              })),
            };
            setMenu(converted);
          }
        } catch (err) {
          console.warn('⚠️ Could not parse menu JSON.', err);
        }
      }
    } catch (err) {
      console.error('❌ Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderChatMessage = (msg: Message, idx: number) => (
    <div
      key={idx}
      className={`p-3 rounded-lg my-2 max-w-xl whitespace-pre-wrap ${
        msg.role === 'user' ? 'bg-blue-100 text-right ml-auto' : 'bg-gray-100 text-left mr-auto'
      }`}
    >
      {msg.content}
    </div>
  );

  const renderDish = (dish: Dish) => {
    const isOpen = expanded[dish.name];
    return (
      <div key={dish.name} className="rounded-xl border bg-white shadow hover:shadow-md transition-all">
        <button
          onClick={() => toggleDish(dish.name)}
          className="w-full text-left p-3 font-semibold text-lg"
        >
          {isOpen ? '▼ ' : '▶ '}
          {dish.name}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-[1000px] p-4' : 'max-h-0 p-0'
          }`}
        >
          <p className="italic mb-2 text-sm">{dish.description}</p>

          {dish.ingredients.length > 0 && (
            <>
              <h4 className="font-semibold mb-1 text-sm">🧂 Ingredients:</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {dish.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  >
                    {ing.item}: {ing.metric}
                  </span>
                ))}
              </div>
            </>
          )}
          {dish.steps.length > 0 && (
            <>
              <h4 className="font-semibold text-sm mt-2 mb-1">👨‍🍳 Steps:</h4>
              <ol className="list-decimal ml-5 text-sm">
                {dish.steps.map((step, i) => (
                  <li key={i} className="mb-1">
                    {step}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 flex flex-col max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🍳 Sousie – Chat Mode</h1>
        <div className="flex gap-2">
          <button
            onClick={resetChat}
            className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            🧼 Start Over
          </button>
          <button
            onClick={handleSurprise}
            disabled={loading}
            className="text-sm px-3 py-1 bg-yellow-300 rounded hover:bg-yellow-400 disabled:opacity-50"
          >
            🎲 Surprise Me
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map(renderChatMessage)}
        <div ref={chatEndRef} />
      </div>

      <textarea
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
        placeholder="What’s in your fridge or on your mind?"
        className="w-full border rounded p-3 resize-none"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className="bg-black text-white py-2 px-4 mt-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Cooking...' : 'Send'}
      </button>

      {menu && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">🍽️ Main Dishes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu.mains.map(renderDish)}
          </div>
          <h2 className="text-xl font-bold mt-6 mb-2">🥗 Side Dishes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu.sides.map(renderDish)}
          </div>
        </div>
      )}
    </div>
  );
}

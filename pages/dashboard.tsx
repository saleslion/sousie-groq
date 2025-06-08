
import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const session = useSession();
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      supabase.from('prompts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
        .then(({ data }) => setPrompts(data || []));
    }
  }, [session]);

  if (!session) return <p className="p-4">Please sign in to view your dashboard.</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧾 Your Prompt History</h2>
      {prompts.map(p => (
        <div key={p.id} className="mb-4 p-3 border rounded bg-white shadow">
          <p className="font-semibold">Prompt:</p><p>{p.text}</p>
          <p className="font-semibold mt-2">Response:</p><p>{p.response}</p>
        </div>
      ))}
    </div>
  );
}

'use client';
import { useState } from 'react';
export default function DoctorMode() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_OPENROUTER_API_KEY },
        body: JSON.stringify({ model: 'qwen/qwen-2.5-7b-instruct', messages: [{ role: 'system', content: 'You are a senior doctor. Provide differential diagnosis, diagnostic approach, and initial management.' }, { role: 'user', content: input }] }),
      });
      const data = await res.json();
      setResult(data.choices[0].message.content);
    } catch (e) { setResult('Error connecting to AI'); }
    finally { setLoading(false); }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">Doctor Mode</h1>
      <textarea className="w-full bg-slate-800 p-4 rounded-xl text-white mb-4" rows={3} placeholder="Describe the case..." value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={analyze} disabled={loading} className="bg-cyan-600 px-6 py-2 rounded-full">{loading ? 'Analyzing...' : 'Analyze'}</button>
      {result && <div className="mt-4 p-4 bg-slate-800 rounded-xl whitespace-pre-wrap">{result}</div>}
    </div>
  );
}

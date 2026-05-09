'use client';
import { useState } from 'react';
export default function Exam() {
  const [topic, setTopic] = useState('');
  const [mcq, setMcq] = useState('');
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_OPENROUTER_API_KEY },
        body: JSON.stringify({ model: 'qwen/qwen-2.5-7b-instruct', messages: [{ role: 'system', content: 'Generate a single best answer MCQ with 5 options, correct answer, and explanation.' }, { role: 'user', content: 'Topic: ' + topic }] }),
      });
      const data = await res.json();
      setMcq(data.choices[0].message.content);
    } catch (e) {}
    finally { setLoading(false); }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">MCQ Generator</h1>
      <input className="w-full bg-slate-800 p-3 rounded-xl mb-4" placeholder="Topic..." value={topic} onChange={(e) => setTopic(e.target.value)} />
      <button onClick={generate} disabled={loading} className="bg-cyan-600 px-6 py-2 rounded-full">{loading ? 'Generating...' : 'Generate MCQ'}</button>
      {mcq && <div className="mt-4 p-4 bg-slate-800 rounded-xl whitespace-pre-wrap">{mcq}</div>}
    </div>
  );
}

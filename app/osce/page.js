'use client';
import { useState } from 'react';
export default function OSCE() {
  const [scenario, setScenario] = useState('');
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const start = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_OPENROUTER_API_KEY },
        body: JSON.stringify({ model: 'qwen/qwen-2.5-7b-instruct', messages: [{ role: 'system', content: 'You are an OSCE examiner. Ask questions step by step.' }, { role: 'user', content: 'Start an OSCE case about: ' + scenario + '. Ask first question.' }] }),
      });
      const data = await res.json();
      setChat([{ sender: 'examiner', text: data.choices[0].message.content }]);
    } catch (e) { alert('Error'); }
    finally { setLoading(false); }
  };
  const answer = async () => {
    if (!input.trim()) return;
    const newChat = [...chat, { sender: 'student', text: input }];
    setChat(newChat); setInput(''); setLoading(true);
    try {
      const history = newChat.map(m => m.sender + ': ' + m.text).join('\n');
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_OPENROUTER_API_KEY },
        body: JSON.stringify({ model: 'qwen/qwen-2.5-7b-instruct', messages: [{ role: 'system', content: 'You are an OSCE examiner.' }, { role: 'user', content: 'Continue as examiner. History:\n' + history + '\n\nNext question:' }] }),
      });
      const data = await res.json();
      setChat(prev => [...prev, { sender: 'examiner', text: data.choices[0].message.content }]);
    } catch (e) { alert('Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">OSCE Examiner</h1>
      {chat.length === 0 ? (
        <><input className="w-full bg-slate-800 p-3 rounded-xl mb-4" placeholder="Scenario..." value={scenario} onChange={(e) => setScenario(e.target.value)} />
        <button onClick={start} disabled={loading} className="bg-cyan-600 px-6 py-2 rounded-full">{loading ? 'Starting...' : 'Start Session'}</button></>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
          {chat.map((m, i) => (<div key={i} className={m.sender === 'examiner' ? 'text-cyan-200' : 'text-white bg-slate-700 p-3 rounded-xl'}><strong>{m.sender === 'examiner' ? 'Examiner' : 'You'}:</strong> {m.text}</div>))}
          <div className="flex space-x-2"><input className="flex-1 bg-slate-800 p-3 rounded-xl" placeholder="Your answer..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && answer()} /><button onClick={answer} disabled={loading} className="bg-cyan-600 px-4 py-2 rounded-full">Send</button></div>
        </div>
      )}
    </div>
  );
}

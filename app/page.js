'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

let recognition = null;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

function startListening(lang = 'en-US') {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject('Speech not supported');
    recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.onresult = (e) => resolve(e.results[0][0].transcript);
    recognition.onerror = () => reject('Mic error');
    recognition.start();
  });
}

function speakText(text, lang = 'en-US') {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  synth.speak(u);
}

const CHAT_KEY = 'chat';
function save(m) { try { localStorage.setItem(CHAT_KEY, JSON.stringify(m.slice(-50))); } catch(e) {} }
function load() { try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch(e) { return []; } }

async function searchPDF(query) {
  try {
    const r = await fetch('/api/search', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ query }) });
    const d = await r.json();
    return d.results || null;
  } catch(e) { return null; }
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-3 rounded-2xl ${isUser ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState('');
  const [voiceOn, setVoiceOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [listening, setListening] = useState(false);
  const [engine, setEngine] = useState(null);
  const [modelStatus, setModelStatus] = useState('');

  // تحميل النموذج المحلي
  useEffect(() => {
    async function init() {
      setModelStatus('Loading AI model (first time takes 2-3 min)...');
      try {
        const eng = await CreateMLCEngine('Llama-3.2-1B-Instruct-q4f16_1-MLC', {
          initProgressCallback: (p) => setModelStatus('Loading AI: ' + Math.round(p.progress * 100) + '%')
        });
        setEngine(eng);
        setModelStatus('AI Ready!');
      } catch(e) {
        setModelStatus('AI model failed. Using PDF search only.');
      }
    }
    init();
  }, []);

  useEffect(() => { const s = load(); if (s.length) setMsgs(s); }, []);
  useEffect(() => { save(msgs); }, [msgs]);

  const send = useCallback(async (txt) => {
    if (!txt.trim() || loading) return;
    const um = { role: 'user', content: txt };
    const upd = [...msgs, um];
    setMsgs(upd); setInp(''); setLoading(true);
    
    let reply = '';
    
    // نجرب PDF أولاً
    const pdfResult = await searchPDF(txt);
    if (pdfResult) {
      reply = pdfResult;
    } else if (engine) {
      // إذا لا يوجد PDF، نستخدم WebLLM
      try {
        const llmReply = await engine.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are a medical tutor. Answer in English with Arabic when needed. Be concise.' },
            { role: 'user', content: txt }
          ],
          max_tokens: 300
        });
        reply = llmReply.choices[0].message.content;
      } catch(e) {
        reply = 'AI error: ' + e.message;
      }
    } else {
      reply = modelStatus;
    }
    
    setMsgs(p => [...p, { role: 'assistant', content: reply }]);
    if (voiceOn) speakText(reply, lang);
    setLoading(false);
  }, [msgs, loading, voiceOn, lang, engine, modelStatus]);

  const mic = async () => {
    if (!voiceOn) { setVoiceOn(true); return; }
    if (listening) { recognition?.abort(); setListening(false); return; }
    setListening(true);
    try {
      const t = await startListening(lang);
      if (t) { setInp(t); send(t); }
    } catch(e) { alert('Mic error.'); }
    setListening(false);
  };

  return (
    <div className="flex flex-col h-full">
      {modelStatus && !modelStatus.includes('Ready') && (
        <div className="bg-yellow-600 text-white text-center py-1 text-sm">{modelStatus}</div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {msgs.map((m,i) => <Bubble key={i} msg={m} />)}
          {msgs.length === 0 && (
            <div className="text-center text-slate-400 mt-20">
              <h2 className="text-2xl font-bold">🩺 Medical Voice AI</h2>
              <p className="mt-2">{engine ? 'AI Ready - Ask anything!' : modelStatus}</p>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 bg-slate-800/80 border-t border-slate-600 flex items-center gap-2">
        <select value={lang} onChange={e => setLang(e.target.value)} className="bg-slate-700 text-white rounded px-2 py-1 text-xs">
          <option value="en-US">EN</option>
          <option value="ar-SA">AR</option>
        </select>
        <button onClick={mic} className={`p-3 rounded-full text-white text-lg ${voiceOn ? (listening ? 'bg-red-500' : 'bg-cyan-600') : 'bg-slate-600'}`}>
          🎤
        </button>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(inp)}
          placeholder={engine ? 'Ask any medical question...' : 'Upload PDFs first...'} disabled={loading}
          className="flex-1 bg-slate-700 rounded-full px-4 py-2 text-white text-sm placeholder-slate-400 outline-none" />
        <button onClick={() => send(inp)} disabled={loading || !inp.trim()} className="bg-cyan-600 p-3 rounded-full text-white disabled:opacity-50">➤</button>
      </div>
    </div>
  );
}

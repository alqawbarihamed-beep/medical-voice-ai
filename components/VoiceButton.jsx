'use client';
import { useState } from 'react';
import { startListening, stopListening } from '@/lib/voice';

export default function VoiceButton({ onResult, isVoiceOn, onToggle, language }) {
  const [listening, setListening] = useState(false);

  const handleMic = async () => {
    if (!isVoiceOn) {
      onToggle();
      return;
    }
    if (listening) {
      stopListening();
      setListening(false);
    } else {
      setListening(true);
      try {
        const transcript = await startListening(language);
        if (transcript) onResult(transcript);
      } catch (e) {
        alert('Voice recognition error');
      } finally {
        setListening(false);
      }
    }
  };

  return (
    <button
      onClick={handleMic}
      className={`p-3 rounded-full transition ${isVoiceOn ? (listening ? 'bg-red-500 animate-pulse' : 'bg-cyan-600') : 'bg-slate-600'} text-white`}
      title={isVoiceOn ? (listening ? 'Listening...' : 'Start speaking') : 'Enable voice'}
    >
      🎤
    </button>
  );
}

let recognition = null;
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function startListening(lang = 'en-US') {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject('Speech recognition not supported');
    recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.onresult = (e) => resolve(e.results[0][0].transcript);
    recognition.onerror = (e) => reject(e.error);
    recognition.start();
  });
}

export function stopListening() {
  if (recognition) recognition.abort();
}

export function speakText(text, lang = 'en-US') {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  synth.speak(u);
}

export function stopSpeaking() {
  if (synth) synth.cancel();
}

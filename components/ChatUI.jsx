import MessageBubble from './MessageBubble';

export default function ChatUI({ messages }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} />
      ))}
      {messages.length === 0 && (
        <div className="text-center text-slate-400 mt-20">
          <h2 className="text-2xl font-bold">Medical Voice AI</h2>
          <p className="mt-2">Ask a clinical question or tap the mic</p>
        </div>
      )}
    </div>
  );
}

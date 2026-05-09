import './globals.css';

export const metadata = {
  title: 'Medical Voice AI',
  description: 'OSCE & Clinical AI Assistant',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <div className="flex min-h-screen">
          <aside className="w-64 bg-slate-800 p-4 space-y-2 border-r border-slate-600 hidden md:block">
            <h1 className="text-xl font-bold mb-4 text-cyan-300">MedVoice AI</h1>
            <nav className="space-y-1">
              <a href="/" className="block p-3 rounded-lg bg-cyan-600 text-white">Chat</a>
              <a href="/doctor-mode" className="block p-3 rounded-lg text-slate-300 hover:bg-slate-700">Doctor Mode</a>
              <a href="/osce" className="block p-3 rounded-lg text-slate-300 hover:bg-slate-700">OSCE Examiner</a>
              <a href="/exam" className="block p-3 rounded-lg text-slate-300 hover:bg-slate-700">MCQ Generator</a>
              <a href="/upload" className="block p-3 rounded-lg text-slate-300 hover:bg-slate-700">Upload PDF</a>
              <a href="/dashboard" className="block p-3 rounded-lg text-slate-300 hover:bg-slate-700">Dashboard</a>
            </nav>
          </aside>
          <main className="flex-1 h-screen overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}

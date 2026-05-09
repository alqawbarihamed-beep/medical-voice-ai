'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '💬 Chat', icon: '💬' },
  { href: '/doctor-mode', label: '🩺 Doctor Mode', icon: '🩺' },
  { href: '/osce', label: '🎓 OSCE Examiner', icon: '🎓' },
  { href: '/exam', label: '📝 MCQ Generator', icon: '📝' },
  { href: '/upload', label: '📚 Upload PDF', icon: '📚' },
  { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-800/70 glass flex flex-col p-4 space-y-2 border-r border-slate-600">
      <h1 className="text-xl font-bold mb-4 text-cyan-300">🩻 MedVoice AI</h1>
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <div
            className={`p-3 rounded-lg cursor-pointer transition ${
              pathname === item.href
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.icon} {item.label}
          </div>
        </Link>
      ))}
    </aside>
  );
}

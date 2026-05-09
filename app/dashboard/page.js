'use client';
export default function Dashboard() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-300 mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl"><h2 className="text-lg">Sessions</h2><p className="text-2xl">0</p></div>
        <div className="bg-slate-800 p-4 rounded-xl"><h2 className="text-lg">Avg Score</h2><p className="text-2xl">0</p></div>
      </div>
    </div>
  );
}

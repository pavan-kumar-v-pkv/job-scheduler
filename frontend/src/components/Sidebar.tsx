'use client';

export default function Sidebar({ onNavigate }: { onNavigate: (section: string) => void }) {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white fixed top-0 left-0 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">📋 Job Scheduler</h2>
      <nav className="flex flex-col gap-2">
        <button onClick={() => onNavigate('create')} className="text-left hover:bg-gray-700 p-2 rounded">
          ➕ Create Job
        </button>
        <button onClick={() => onNavigate('scheduled')} className="text-left hover:bg-gray-700 p-2 rounded">
          📅 Scheduled Jobs
        </button>
        <span className="text-left hover:bg-gray-700 p-2 rounded text-gray-400 cursor-not-allowed">
          📊 Events (coming soon)
        </span>
      </nav>
    </aside>
  );
}

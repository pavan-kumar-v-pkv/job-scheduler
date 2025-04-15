'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white fixed top-0 left-0 p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">📋 Job Scheduler</h2>
      <nav className="flex flex-col gap-2">
        <a href="#create-job-form" className="hover:bg-gray-700 p-2 rounded">➕ Create Job</a>
        <a href="#scheduled-jobs" className="hover:bg-gray-700 p-2 rounded">📅 Scheduled Jobs</a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded text-gray-400 cursor-not-allowed">📊 Events (coming soon)</a>
      </nav>
    </aside>
  );
}

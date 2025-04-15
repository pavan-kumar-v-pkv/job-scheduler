'use client'

export default function Sidebar() {
  return (
    <aside className="bg-gray-800 text-white w-64 h-screen p-4 fixed top-0 left-0 flex flex-col">
      <div className="text-2xl font-bold p-4 border-b border-gray-700">Job Scheduler</div>
      <nav className="flex-1 p-4 space-y-3">
        <a className="block hover:bg-gray-800 p-2 rounded" href="#">Overview</a>
        <a className="block hover:bg-gray-800 p-2 rounded" href="#">Schedules</a>
        <a className="block hover:bg-gray-800 p-2 rounded" href="#">Events</a>
      </nav>
    </aside>
  )
}

'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import JobModal from '@/components/JobModal'
import JobTable from '@/components/JobTable'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📅 Schedules</h1>
          <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
            ➕ Create Schedule
          </button>
        </div>
        <JobTable />
        <JobModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  )
}

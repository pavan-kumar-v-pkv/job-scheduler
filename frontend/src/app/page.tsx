'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import JobModal from '@/components/JobModal';
import JobTable from '@/components/JobTable';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const createRef = useRef<HTMLElement | null>(null);
  const scheduledRef = useRef<HTMLElement | null>(null);

  const scrollToSection = (section: string) => {
    if (section === 'create') createRef.current?.scrollIntoView({ behavior: 'smooth' });
    else if (section === 'scheduled') scheduledRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex">
      <Sidebar onNavigate={scrollToSection} />
      <main className="ml-64 p-8 w-full">
        <section ref={createRef} id="create-job-form">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">📅 Schedules</h1>
            <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
              ➕ Create Schedule
            </button>
          </div>
        </section>

        <section ref={scheduledRef} id="scheduled-jobs">
          <JobTable />
        </section>

        <JobModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Job } from '@/types/Job';

export default function JobTable() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get<Job[]>('http://localhost:8080/api/jobs');
      setJobs(res.data.reverse()); // show latest first
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  useEffect(() => {
    fetchJobs(); // fetch on mount
    const interval = setInterval(fetchJobs, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Scheduled Jobs</h2>
      <table className="min-w-full bg-white border rounded-xl shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Status</th>
            <th className="p-2">Scheduled</th>
            <th className="p-2">Cron</th>
            <th className="p-2">Topic</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                No jobs found.
              </td>
            </tr>
          )}
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="p-2">{job.id}</td>
              <td className="p-2">{job.jobName}</td>
              <td className="p-2">{job.jobType}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-white ${
                  job.status === 'PENDING' ? 'bg-yellow-500' :
                  job.status === 'SUCCESS' ? 'bg-green-600' :
                  job.status === 'FAILED' ? 'bg-red-600' : 'bg-blue-500'
                }`}>
                  {job.status}
                </span>
              </td>
              <td className="p-2">{job.scheduledTime?.replace('T', ' ').substring(0, 16) || '-'}</td>
              <td className="p-2">{job.cronExpression || '-'}</td>
              <td className="p-2">{job.kafkaTopic}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

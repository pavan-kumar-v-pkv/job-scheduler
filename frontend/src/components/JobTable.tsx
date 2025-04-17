"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Job } from "@/types/Job";
import { toast } from "sonner";
import JobModal from "./JobModal";
import cronstrue from "cronstrue";


export default function JobTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(8); // number of jobs per page
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/jobs/paginated?page=${page}&size=${size}&sort=createdAt,desc`
      );
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };
  // Delete job
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/jobs/${id}`);
      toast.success("🗑️ Job deleted!");
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      toast.error("❌ Failed to delete job");
      console.error(err);
    }
  };

  // Edit job
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchJobs(); // fetch on mount
    const interval = setInterval(fetchJobs, 10000); // every 10s
    return () => clearInterval(interval);
  }, [page]);

  return (
    <div className="overflow-x-auto max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Scheduled Jobs</h2>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name or topic"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64 mb-2 md:mb-0"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <table className="min-w-full bg-white border rounded-xl shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Job ID</th>
            <th className="p-2">Job Name</th>
            <th className="p-2">Job Type</th>
            <th className="p-2">Execution Status</th>
            <th className="p-2">Scheduled Time (IST)</th>
            <th className="p-2">Cron Schedule</th>
            <th className="p-2">Kafka Topic</th>
            <th className="p-2">Binary</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-gray-500">
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-3xl">📭</span>
                  <span className="text-sm">
                    No jobs scheduled yet. Click ➕ Create Schedule to add one.
                  </span>
                </div>
              </td>
            </tr>
          )}
          {jobs
            .filter(
              (job) =>
                job.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.kafkaTopic.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter((job) =>
              statusFilter === "ALL" ? true : job.status === statusFilter
            )
            .map((job) => (
              <tr key={job.id} className="border-t">
                <td className="p-2">{job.id}</td>
                <td className="p-2">{job.jobName}</td>
                <td className="p-2">{job.jobType}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      job.status === "PENDING"
                        ? "bg-yellow-500"
                        : job.status === "SUCCESS"
                        ? "bg-green-600"
                        : job.status === "FAILED"
                        ? "bg-red-600"
                        : "bg-blue-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="p-2">
                  {job.scheduledTime ? (
                    <>
                      {new Date(job.scheduledTime).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                      <br />
                      {new Date(job.scheduledTime).toLocaleTimeString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  {job.cronExpression
                    ? cronstrue.toString(job.cronExpression, {
                        use24HourTimeFormat: true,
                      })
                    : "-"}
                </td>

                <td className="p-2">{job.kafkaTopic}</td>
                <td className="p-2">
                  {job.binaryPath ? (
                    <a
                      href={`http://localhost:8080/api/files/download/${job.binaryPath}`}
                      className="text-blue-600 underline"
                      download
                    >
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => handleEdit(job)} // define this method below
                  >
                    Edit
                  </button>
                  <br />
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2">{`Page ${page + 1} of ${totalPages}`}</span>
        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <JobModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingJob(null);
        }}
        editingJob={editingJob}
      />
    </div>
  );
}

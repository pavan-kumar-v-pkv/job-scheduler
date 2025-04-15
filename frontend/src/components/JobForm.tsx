"use client";

import { useState } from "react";
import { toast } from 'react-toastify';
import axios from "axios";

export default function JobForm() {
  const [form, setForm] = useState<{
    jobName: string;
    jobType: string;
    timeZone: string;
    scheduledTime: string;
    binaryFile: File | null;
    kafkaTopic: string;
    metadata: string;
    cronExpression: string;
  }>({
    jobName: "",
    jobType: "DELAYED",
    timeZone: "Asia/Kolkata",
    scheduledTime: "",
    binaryFile: null,
    kafkaTopic: "",
    metadata: "",
    cronExpression: "",
  });

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "binaryFile") {
      setForm((prev) => ({ ...prev, binaryFile: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let binaryFileName = null;

    if (form.binaryFile) {
      const data = new FormData();
      data.append("file", form.binaryFile);

      try {
        const res = await axios.post(
          "http://localhost:8080/api/files/upload",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        binaryFileName = res.data; // filename returned from backend
      } catch (err) {
        toast.error("❌ File upload failed!");
        return;
      }
    }

    const payload = {
      jobName: form.jobName,
      jobType: form.jobType,
      timeZone: form.timeZone,
      scheduledTime: form.jobType === "DELAYED" ? form.scheduledTime : null,
      binaryFileName: binaryFileName,
      kafkaTopic: form.kafkaTopic,
      metadata: form.metadata ? JSON.stringify({ msg: form.metadata }) : null,
      cronExpression: form.jobType === "RECURRING" ? form.cronExpression : null,
    };

    try {
      await axios.post("http://localhost:8080/api/jobs/schedule", payload);
      toast.success("✅ Job Scheduled!");
      setForm({
        jobName: "",
        jobType: "DELAYED",
        timeZone: "Asia/Kolkata",
        scheduledTime: "",
        binaryFile: null,
        kafkaTopic: "",
        metadata: "",
        cronExpression: "",
      });
    } catch (err) {
      toast.error("❌ Failed to schedule job.");
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow w-full max-w-xl mx-auto mb-10"
    >
      <h2 className="text-xl font-bold mb-4">Schedule a Job</h2>

      <div className="grid gap-4">
        <input
          className="border p-2 rounded"
          name="jobName"
          placeholder="Job Name"
          value={form.jobName}
          onChange={handleChange}
          required
        />
        <label className="text-gray-600 font-medium">Select Job Type</label>
        <select
          className="border p-2 rounded"
          name="jobType"
          value={form.jobType}
          onChange={handleChange}
        >
          <option value="IMMEDIATE">IMMEDIATE</option>
          <option value="ONE_TIME">ONE_TIME</option>
          <option value="DELAYED">DELAYED</option>
          <option value="RECURRING">RECURRING</option>
        </select>

        <input
          className="border p-2 rounded"
          name="timeZone"
          placeholder="Time Zone"
          value={form.timeZone}
          onChange={handleChange}
          required
        />
        {["ONE_TIME", "DELAYED"].includes(form.jobType) && (
          <input
            type="datetime-local"
            className="border p-2 rounded"
            name="scheduledTime"
            value={form.scheduledTime}
            onChange={handleChange}
            required
          />
        )}

        {form.jobType === "RECURRING" && (
          <>
            <input
              className="border p-2 rounded"
              name="cronExpression"
              placeholder="Cron expression (e.g., 0 * * * * *)"
              value={form.cronExpression}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 ml-1">
              Runs every minute. Format: sec min hour day month week
            </p>
          </>
        )}

        {/* Binary file input */}
        <input
          type="file"
          className="border p-2 rounded"
          name="binaryFile"
          onChange={handleChange}
        />
        {form.binaryFile && (
          <div className="text-sm text-gray-600">📎 {form.binaryFile.name}</div>
        )}

        <input
          className="border p-2 rounded"
          name="kafkaTopic"
          placeholder="Kafka Topic"
          value={form.kafkaTopic}
          onChange={handleChange}
          required
        />
        <input
          className="border p-2 rounded"
          name="metadata"
          placeholder="Message / Metadata"
          value={form.metadata}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Schedule Job
        </button>
      </div>
    </form>
  );
}

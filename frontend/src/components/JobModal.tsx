"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useEffect } from "react";
import { Job } from "@/types/Job";
import axios from "axios";
import { toast } from "react-toastify";

export default function JobModal({
  isOpen,
  onClose,
  editingJob,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingJob?: Job | null;
}) {
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
    timeZone: "Asia/Calcutta",
    scheduledTime: "",
    binaryFile: null,
    kafkaTopic: "",
    metadata: "",
    cronExpression: "",
  });

  useEffect(() => {
    if (editingJob) {
      setForm({
        jobName: editingJob.jobName,
        jobType: editingJob.jobType,
        timeZone: editingJob.timeZone,
        scheduledTime: editingJob.scheduledTime || "",
        binaryFile: null,
        kafkaTopic: editingJob.kafkaTopic,
        metadata: editingJob.metadata || "",
        cronExpression: editingJob.cronExpression || "",
      });
    }
  }, [editingJob]);

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
          data
        );
        binaryFileName = res.data;
      } catch {
        toast.error("File upload failed");
        return;
      }
    }

    const payload = {
      jobName: form.jobName,
      jobType: form.jobType,
      timeZone: form.timeZone,
      scheduledTime: form.jobType !== "RECURRING" ? form.scheduledTime : null,
      cronExpression: form.jobType === "RECURRING" ? form.cronExpression : null,
      binaryFileName,
      kafkaTopic: form.kafkaTopic,
      metadata: form.metadata ? JSON.stringify({ msg: form.metadata }) : null,
    };

    const method = editingJob ? "put" : "post";
    const url = editingJob
      ? `http://localhost:8080/api/jobs/${editingJob.id}`
      : "http://localhost:8080/api/jobs/schedule";

    try {
      await axios[method](url, payload);
      toast.success(editingJob ? "Job updated!" : "Job scheduled!");
      onClose();
    } catch (err) {
      toast.error("Failed to submit job");
      console.error(err);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4 bg-black bg-opacity-30">
        <Dialog.Panel className="bg-white rounded p-6 w-full max-w-xl space-y-4 shadow-xl">
          <Dialog.Title className="text-lg font-bold">
            Create Schedule
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Job Name</label>
              <input
                className="border p-2 w-full rounded"
                name="jobName"
                value={form.jobName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Type</label>
              <select
                className="border p-2 w-full rounded"
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
              >
                <option value="IMMEDIATE">IMMEDIATE</option>
                <option value="ONE_TIME">ONE_TIME</option>
                <option value="DELAYED">DELAYED</option>
                <option value="RECURRING">RECURRING</option>
              </select>
            </div>

            {(form.jobType === "ONE_TIME" || form.jobType === "DELAYED") && (
              <div>
                <label className="block mb-1 font-medium">Scheduled Time</label>
                <input
                  type="datetime-local"
                  className="border p-2 w-full rounded"
                  name="scheduledTime"
                  value={form.scheduledTime}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {form.jobType === "RECURRING" && (
              <div className="space-y-2">
                <label className="block mb-1 font-medium">Recurrence</label>
                <select
                  className="border p-2 w-full rounded"
                  name="recurringOption"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setForm((prev) => ({ ...prev, cronExpression: "" }));
                    } else {
                      setForm((prev) => ({
                        ...prev,
                        cronExpression:
                          val === "hourly"
                            ? "0 0 * * * *"
                            : val === "daily"
                            ? "0 0 12 * * *"
                            : val === "weekly"
                            ? "0 0 12 * * 1"
                            : val === "monthly"
                            ? "0 0 12 1 * *"
                            : "",
                      }));
                    }
                  }}
                >
                  <option value="">Select frequency</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>

                {form.cronExpression === "" && (
                  <div>
                    <input
                      className="border p-2 w-full rounded mt-2"
                      name="cronExpression"
                      placeholder="Enter custom cron expression (e.g., 0 15 10 ? * *)"
                      value={form.cronExpression}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: <code>sec min hour day month day-of-week </code>
                      Example: <code>0 15 10 ? * *</code> → Every day at 10:15
                      AM
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block mb-1 font-medium">Time Zone</label>
              <select
                className="border p-2 w-full rounded"
                name="timeZone"
                value={form.timeZone || "Asia/Calcutta"}
                onChange={handleChange}
                required
              >
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Kafka Topic</label>
              <input
                className="border p-2 w-full rounded"
                name="kafkaTopic"
                value={form.kafkaTopic}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Metadata / Message
              </label>
              <input
                className="border p-2 w-full rounded"
                name="metadata"
                value={form.metadata}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Upload Binary File
              </label>
              <input
                type="file"
                className="border p-2 w-full rounded"
                name="binaryFile"
                onChange={handleChange}
              />
              {form.binaryFile && (
                <p className="text-xs mt-1 text-gray-600">
                  Selected: {form.binaryFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" className="text-gray-500" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

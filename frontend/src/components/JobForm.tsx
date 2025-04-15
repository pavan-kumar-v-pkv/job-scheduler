'use client';

import { useState } from 'react';
import axios from 'axios';

export default function JobForm() {
  const [form, setForm] = useState({
    jobName: '',
    jobType: 'DELAYED',
    timeZone: 'Asia/Kolkata',
    scheduledTime: '',
    binaryPath: '',
    kafkaTopic: '',
    metadata: '',
    cronExpression: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      ...form,
      scheduledTime: form.jobType === 'DELAYED' ? form.scheduledTime : null,
      cronExpression: form.jobType === 'RECURRING' ? form.cronExpression : null,
      binaryPath: form.binaryPath || null,
      metadata: form.metadata ? JSON.stringify({ msg: form.metadata }) : null
    };

    try {
      await axios.post('http://localhost:8080/api/jobs/schedule', payload);
      alert('✅ Job Scheduled!');
      setForm({
        jobName: '',
        jobType: 'DELAYED',
        timeZone: 'Asia/Kolkata',
        scheduledTime: '',
        binaryPath: '',
        kafkaTopic: '',
        metadata: '',
        cronExpression: ''
      });
    } catch (err) {
      console.error(err);
      alert('❌ Failed to schedule job.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-xl mx-auto mb-10">
      <h2 className="text-xl font-bold mb-4 text-black">Schedule a Job</h2>

      <div className="grid gap-4">
        <input className="border p-2 rounded text-black" name="jobName" placeholder="Job Name" value={form.jobName} onChange={handleChange} required />
        <select className="border p-2 rounded text-black" name="jobType" value={form.jobType} onChange={handleChange}>
          <option value="DELAYED">DELAYED</option>
          <option value="RECURRING">RECURRING</option>
        </select>
        <input className="border p-2 rounded text-black" name="timeZone" placeholder="Time Zone" value={form.timeZone} onChange={handleChange} required />
        
        {form.jobType === 'DELAYED' && (
          <input type="datetime-local" className="border p-2 rounded text-black" name="scheduledTime" value={form.scheduledTime} onChange={handleChange} required />
        )}
        
        {form.jobType === 'RECURRING' && (
          <input className="border p-2 rounded text-black" name="cronExpression" placeholder="Cron Expression" value={form.cronExpression} onChange={handleChange} required />
        )}
        
        <input className="border p-2 rounded text-black" name="binaryPath" placeholder="Binary Path (optional)" value={form.binaryPath} onChange={handleChange} />
        <input className="border p-2 rounded text-black" name="kafkaTopic" placeholder="Kafka Topic" value={form.kafkaTopic} onChange={handleChange} required />
        <input className="border p-2 rounded text-black" name="metadata" placeholder="Message / Metadata" value={form.metadata} onChange={handleChange} required />
        
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Schedule Job
        </button>
      </div>
    </form>
  );
}

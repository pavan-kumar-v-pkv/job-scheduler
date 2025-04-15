'use client'

import { useState } from 'react'
import axios from 'axios'

export default function JobModal({ isOpen, onClose }: any) {
  const [form, setForm] = useState({
    jobName: '',
    jobType: 'DELAYED',
    timeZone: 'Asia/Kolkata',
    scheduledTime: '',
    binaryPath: '',
    kafkaTopic: '',
    metadata: '',
    cronExpression: ''
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const payload = {
      ...form,
      scheduledTime: form.jobType === 'DELAYED' ? form.scheduledTime : null,
      cronExpression: form.jobType === 'RECURRING' ? form.cronExpression : null,
      binaryPath: form.binaryPath || null,
      metadata: form.metadata ? JSON.stringify({ msg: form.metadata }) : null
    }

    try {
      await axios.post('http://localhost:8080/api/jobs/schedule', payload)
      alert('✅ Job Scheduled!')
      onClose()
    } catch (err) {
      console.error(err)
      alert('❌ Failed to schedule job.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-lg space-y-4">
        <h2 className="text-lg font-bold">Create Schedule</h2>

        <input name="jobName" placeholder="Job Name" className="border p-2 w-full" onChange={handleChange} required />
        <select name="jobType" value={form.jobType} onChange={handleChange} className="border p-2 w-full">
          <option value="DELAYED">DELAYED</option>
          <option value="RECURRING">RECURRING</option>
        </select>
        <input name="timeZone" placeholder="Time Zone" value={form.timeZone} onChange={handleChange} className="border p-2 w-full" required />
        {form.jobType === 'DELAYED' && (
          <input name="scheduledTime" type="datetime-local" className="border p-2 w-full" onChange={handleChange} required />
        )}
        {form.jobType === 'RECURRING' && (
          <input name="cronExpression" placeholder="Cron Expression" className="border p-2 w-full" onChange={handleChange} required />
        )}
        <input name="binaryPath" placeholder="Binary Path" className="border p-2 w-full" onChange={handleChange} />
        <input name="kafkaTopic" placeholder="Kafka Topic" className="border p-2 w-full" onChange={handleChange} required />
        <input name="metadata" placeholder="Message / Metadata" className="border p-2 w-full" onChange={handleChange} required />

        <div className="flex justify-between mt-4">
          <button type="button" onClick={onClose} className="bg-gray-400 px-4 py-2 rounded text-white">Cancel</button>
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white">Create</button>
        </div>
      </form>
    </div>
  )
}

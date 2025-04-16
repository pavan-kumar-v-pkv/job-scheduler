'use client'

import { useState, useEffect } from 'react'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-end p-4">
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-4 py-1 rounded"
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
      {children}
    </div>
  )
}

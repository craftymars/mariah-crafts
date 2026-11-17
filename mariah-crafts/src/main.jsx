
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

function AdminRedirect() {
  useEffect(() => {
    window.location.replace('https://mariah-crafts-cms.vercel.app/')
  }, [])

  return <p>Redirecting to Mariah Crafts CMS...</p>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={<AdminRedirect />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)


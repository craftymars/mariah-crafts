
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import AdminGate from './components/admin/AdminGate.jsx'
import AdminDashboard from './components/admin/AdminDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/admin/*"
          element={
            <AdminGate>
              <AdminDashboard />
            </AdminGate>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)


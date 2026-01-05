import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import PublicMenu from './pages/PublicMenu.jsx'
import AdminLogin from './pages/AdminLogin.jsx'  // NEW
import Admin from './pages/Admin.jsx'
import AdminGuard from './components/AdminGuard.jsx'  // NEW - create this file
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<PublicMenu />} />
        </Route>
        <Route path="/admin" element={<AdminGuard />} />
        
        {/* NEW: Separate login route */}
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* NEW: Protected admin routes */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route index element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

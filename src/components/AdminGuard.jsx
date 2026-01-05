import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import App from '../App.jsx'

export default function AdminGuard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('asha_admin_token')
  const level = localStorage.getItem('asha_admin_level')

  useEffect(() => {
    if (!token || !level || parseInt(token.split('_')[0]) < Date.now() - 60000) {
      localStorage.removeItem('asha_admin_token')
      localStorage.removeItem('asha_admin_level')
      navigate('/admin-login')
    }
  }, [navigate, token, level])

  if (!token || !level) return null // Loading state

  return (
    <App>
      <Outlet />
    </App>
  )
}

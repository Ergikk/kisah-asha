import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminLogin } from '../api/client.js'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { token, level } = await adminLogin(password)
      localStorage.setItem('asha_admin_token', token)
      localStorage.setItem('asha_admin_level', level)
      navigate('/admin')
    } catch (error) {
      setError('Password salah!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#6f7f72] text-white flex items-center justify-center px-4">
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 w-full max-w-sm border border-white/20">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Asha Logo" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-wide">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 opacity-90">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#803932] hover:bg-[#6a2f29] text-white font-bold py-3 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memeriksa...' : 'Masuk Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm opacity-70 hover:underline"
          >
            ← Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  )
}


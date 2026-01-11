import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '/logo.png'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    const token = localStorage.getItem('asha_admin_token')
    if (token && parseInt(token.split('_')[0]) > Date.now() - 60*60*1000) {
      setIsAuthenticated(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#6f7f72] text-white">
      <div className="mx-auto max-w-[430px] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] px-4 py-5">
        <header className="flex items-center justify-between bg-[#363635] backdrop-blur-sm rounded-full px-5 py-3 mb-5">
          <img src={logo} alt="Asha Logo" className="h-5 w-auto" />
          <div className="font-semibold tracking-wide text-lg">
            {isAdmin ? 'Admin' : 'asha'}
          </div>
          {/* Admin UI: Logout only when authenticated + admin */}
          {isAuthenticated && isAdmin ? (
            <button 
              onClick={() => {
                localStorage.removeItem('asha_admin_token')
                setIsAuthenticated(false)
                navigate('/')
              }}
              className="text-sm opacity-80 hover:underline"
            >
              Logout
            </button>
          ) : null}
        </header>
        
        <Outlet />
        
        <footer className="mt-12 border-t border-white/30 pt-6 text-center text-sm opacity-90">
          <div>
            Reservation <a href="https://wa.me/+6282225254485" className="font-semibold hover:underline">0822-2525-4485</a>
          </div>
          <div className="mt-1">
            Instagram <a href="https://instagram.com/kisah.asha" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">@kisah.asha</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

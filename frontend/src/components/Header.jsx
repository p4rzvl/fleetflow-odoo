import { Truck, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/vehicles', label: 'Vehicles' },
    { path: '/dispatch', label: 'Dispatch' },
    { path: '/drivers', label: 'Drivers' },
    { path: '/maintenance', label: 'Maintenance' },
    { path: '/finance', label: 'Finance' },
    { path: '/analytics', label: 'Analytics' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <Truck size={28} />
          <h1>Fleet<span>Flow</span></h1>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === item.path ? 'var(--primary-blue)' : 'var(--gray-600)',
              fontWeight: location.pathname === item.path ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'color 0.2s'
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="status-indicator"></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>System Online</span>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: 'none',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.5rem',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            color: 'var(--gray-600)',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header

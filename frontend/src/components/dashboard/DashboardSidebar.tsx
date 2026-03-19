import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  {
    id: 'sites',
    label: 'Sites',
    path: '/sites',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'globe',
    label: 'Globe',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-8" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
]

function getActiveId(pathname: string): string {
  if (pathname.startsWith('/sites')) return 'sites'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  return 'dashboard'
}

export default function DashboardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const active = getActiveId(location.pathname)

  const siteIdMatch = location.pathname.match(/^\/dashboard\/(.+)/)
  const dashboardPath = siteIdMatch ? `/dashboard/${siteIdMatch[1]}` : '/sites'

  return (
    <div
      className="flex flex-col items-center py-4 gap-1 border border-border h-full"
      style={{
        background: 'rgba(6, 14, 22, 0.82)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path === '/dashboard' ? dashboardPath : item.path)}
          title={item.label}
          className={`
            relative w-10 h-10 flex items-center justify-center rounded transition-all duration-200 cursor-pointer
            ${active === item.id
              ? 'text-accent'
              : 'text-dim hover:text-text'
            }
          `}
        >
          {active === item.id && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-accent rounded-r"
              style={{ boxShadow: '0 0 6px rgba(100,240,200,0.4)' }}
            />
          )}
          {item.icon}
        </button>
      ))}

      <div className="flex-1" />

      {/* Logout */}
      <button
        title="Logout"
        onClick={() => logout()}
        className="w-10 h-10 flex items-center justify-center text-dim hover:text-danger transition-colors cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  )
}

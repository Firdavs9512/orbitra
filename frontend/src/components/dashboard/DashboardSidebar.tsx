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
    id: 'users',
    label: 'Users',
    path: '/users',
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

function getActiveId(pathname: string): string {
  if (pathname.startsWith('/sites')) return 'sites'
  if (pathname.startsWith('/users')) return 'users'
  if (pathname.startsWith('/profile')) return 'profile'
  return 'sites'
}

export default function DashboardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, isAdmin } = useAuth()
  const active = getActiveId(location.pathname)

  return (
    <div
      className="flex flex-col items-center py-4 gap-1 border border-border h-full"
      style={{
        background: 'rgba(6, 14, 22, 0.82)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {NAV_ITEMS.filter((item: any) => !item.adminOnly || isAdmin).map((item: any) => (
        <button
          key={item.id}
          onClick={() => navigate(item.path)}
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

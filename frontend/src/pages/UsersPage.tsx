import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { UserManagement } from '../types/auth'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const roleConfig = {
  admin: { color: '#64f0c8', label: 'Admin' },
  viewer: { color: '#ffb84c', label: 'Viewer' },
}

interface AddUserModalProps {
  onClose: () => void
  onSuccess: () => void
}

function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'viewer' as 'admin' | 'viewer',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/api/auth/users', formData)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GlassCard className="!p-6 w-full max-w-md">
        <h2 className="font-sans text-text text-xl font-semibold mb-4">Add New User</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[10px] text-dim uppercase tracking-wider mb-2">
              Full Name
            </label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-dim uppercase tracking-wider mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-dim uppercase tracking-wider mb-2">
              Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-dim uppercase tracking-wider mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'viewer' })}
              className="w-full bg-bg-light border border-border rounded-lg px-4 py-3 font-mono text-sm text-text focus:outline-none focus:border-accent transition-colors"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="font-mono text-[11px] text-red-400 text-center">{error}</div>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}

function UserCard({ user, currentUserId, onRoleChange, onDelete }: {
  user: UserManagement
  currentUserId: string
  onRoleChange: (userId: string, role: 'admin' | 'viewer') => void
  onDelete: (userId: string) => void
}) {
  const [isChangingRole, setIsChangingRole] = useState(false)
  const role = roleConfig[user.role]
  const isCurrentUser = user.id === currentUserId

  const handleRoleToggle = async () => {
    if (isCurrentUser) return
    setIsChangingRole(true)
    const newRole = user.role === 'admin' ? 'viewer' : 'admin'
    await onRoleChange(user.id, newRole)
    setIsChangingRole(false)
  }

  const handleDelete = () => {
    if (isCurrentUser) return
    if (confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      onDelete(user.id)
    }
  }

  return (
    <GlassCard className="!p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border font-mono text-sm text-accent"
              style={{ background: 'rgba(10, 20, 32, 0.55)' }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-sans text-accent text-base font-medium leading-tight">
                {user.fullName}
                {isCurrentUser && (
                  <span className="ml-2 font-mono text-[9px] text-dim uppercase tracking-wider">(You)</span>
                )}
              </div>
              <div className="font-mono text-[11px] text-dim mt-0.5">
                {user.email}
              </div>
            </div>
          </div>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-border"
            style={{ color: role.color }}
          >
            {role.label}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10px] text-dim tracking-wider">
            Created {timeAgo(user.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            {!isCurrentUser && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleRoleToggle}
                  disabled={isChangingRole}
                  className="!w-auto !py-1.5 !px-4 !text-[9px]"
                >
                  {isChangingRole ? 'Updating...' : `Make ${user.role === 'admin' ? 'Viewer' : 'Admin'}`}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="!w-auto !py-1.5 !px-4 !text-[9px] !text-red-400 !border-red-400/20"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/sites')
    }
  }, [isAdmin, navigate])

  const loadUsers = () => {
    setLoading(true)
    api.get<UserManagement[]>('/api/auth/users')
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId: string, role: 'admin' | 'viewer') => {
    try {
      await api.patch(`/api/auth/users/${userId}/role`, { role })
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Failed to update user role')
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/api/auth/users/${userId}`)
      loadUsers()
    } catch (err: any) {
      alert(err.message || 'Failed to delete user')
    }
  }

  if (!isAdmin) return null

  return (
    <>
      <DashboardLayout
        topbar={<DashboardTopbar />}
        sidebar={<DashboardSidebar />}
        main={
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-sans text-text text-2xl font-semibold">User Management</h1>
                <p className="font-mono text-[11px] text-dim uppercase tracking-wider mt-1">
                  {users.length} users total
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                className="!w-auto !px-6"
              >
                + Add User
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <span className="font-mono text-[11px] text-dim uppercase tracking-wider animate-pulse">
                  Loading users...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="font-mono text-[11px] text-red-400 uppercase tracking-wider">
                  {error}
                </span>
                <Button variant="ghost" onClick={loadUsers} className="!w-auto !px-6">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id || ''}
                    onRoleChange={handleRoleChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        }
      />

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadUsers}
        />
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import useFormValidation from '../hooks/useFormValidation'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Profile form
  const profileForm = useFormValidation(
    { fullName: user?.fullName || '', email: user?.email || '' },
    {
      fullName: {
        required: true,
        minLength: 2,
      },
      email: {
        required: true,
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email format',
        },
      },
    },
  )

  // Password form
  const passwordForm = useFormValidation(
    { oldPassword: '', newPassword: '', confirmPassword: '' },
    {
      oldPassword: {
        required: true,
        minLength: 8,
      },
      newPassword: {
        required: true,
        minLength: 8,
      },
      confirmPassword: {
        required: true,
        minLength: 8,
      },
    },
  )

  // Update profile form when user loads
  useEffect(() => {
    if (user) {
      profileForm.handleChange({ target: { name: 'fullName', value: user.fullName } } as any)
      profileForm.handleChange({ target: { name: 'email', value: user.email } } as any)
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileForm.validate()) return

    setProfileError(null)
    setProfileSuccess(null)
    setLoading(true)
    try {
      await api.patch('/api/auth/profile', {
        fullName: profileForm.values.fullName,
        email: profileForm.values.email,
      })
      setProfileSuccess('Profile updated successfully')
      setTimeout(() => setProfileSuccess(null), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.validate()) return

    if (passwordForm.values.newPassword !== passwordForm.values.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordError(null)
    setPasswordSuccess(null)
    setLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        oldPassword: passwordForm.values.oldPassword,
        newPassword: passwordForm.values.newPassword,
      })
      setPasswordSuccess('Password changed successfully')
      // Reset password form
      passwordForm.handleChange({ target: { name: 'oldPassword', value: '' } } as any)
      passwordForm.handleChange({ target: { name: 'newPassword', value: '' } } as any)
      passwordForm.handleChange({ target: { name: 'confirmPassword', value: '' } } as any)
      setTimeout(() => setPasswordSuccess(null), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      topbar={<DashboardTopbar />}
      sidebar={<DashboardSidebar />}
      main={
        <div className="p-4 max-w-3xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-sans text-text text-2xl font-semibold">Profile Settings</h1>
            <p className="font-mono text-[11px] text-dim uppercase tracking-wider mt-1">
              Manage your account information
            </p>
          </div>

          {/* Profile Information Card */}
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
                // Personal Information
              </h2>
              {user?.role && (
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    style={{
                      boxShadow: '0 0 8px var(--color-accent)',
                    }}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                    {user.role}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                value={profileForm.values.fullName}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                error={profileForm.errors.fullName}
                placeholder="John Doe"
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={profileForm.values.email}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                error={profileForm.errors.email}
                placeholder="john@example.com"
              />

              {profileSuccess && (
                <div className="font-mono text-[10px] text-accent tracking-wider text-center py-2 border border-accent/30 rounded-lg bg-accent/5">
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="font-mono text-[10px] text-danger tracking-wider text-center py-2 border border-danger/30 rounded-lg bg-danger/5">
                  {profileError}
                </div>
              )}

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </GlassCard>

          {/* Change Password Card */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
                // Change Password
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-accent2"
                  style={{
                    boxShadow: '0 0 8px var(--color-accent2)',
                  }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent2">
                  Secure
                </span>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <Input
                label="Current Password"
                name="oldPassword"
                type="password"
                value={passwordForm.values.oldPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.errors.oldPassword}
                placeholder="••••••••"
              />

              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.errors.newPassword}
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.errors.confirmPassword}
                placeholder="••••••••"
              />

              <p className="font-mono text-[10px] text-dim tracking-wider">
                Password must be at least 8 characters long
              </p>

              {passwordSuccess && (
                <div className="font-mono text-[10px] text-accent tracking-wider text-center py-2 border border-accent/30 rounded-lg bg-accent/5">
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="font-mono text-[10px] text-danger tracking-wider text-center py-2 border border-danger/30 rounded-lg bg-danger/5">
                  {passwordError}
                </div>
              )}

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </GlassCard>
        </div>
      }
    />
  )
}

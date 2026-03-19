import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import useFormValidation from '../hooks/useFormValidation'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const { values, errors, handleChange, handleBlur, validate } = useFormValidation(
    { email: '', password: '' },
    {
      email: {
        required: true,
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email format',
        },
      },
      password: {
        required: true,
        minLength: 8,
      },
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setApiError(null)
    setIsSubmitting(true)
    try {
      await login(values.email, values.password)
      navigate('/sites')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <GlassCard className="max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
            // System Access
          </h2>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{
                boxShadow: '0 0 8px var(--color-accent)',
                animation: 'pulse-blink 1.5s ease-in-out infinite',
              }}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
              Secure
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email / Username"
            name="email"
            type="text"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            placeholder="operator@orbitra.io"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={setRememberMe}
            />
            <Link
              to="#"
              className="font-mono text-[10px] uppercase tracking-wider text-accent2 hover:text-accent transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {apiError && (
            <div className="font-mono text-[10px] text-danger tracking-wider text-center py-2 border border-danger/30 rounded-lg bg-danger/5">
              {apiError}
            </div>
          )}

          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
          </Button>
        </form>

        {/* Footer */}
        <div className="border-t border-border mt-6 pt-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
            No access?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent2 transition-colors"
            >
              Request Clearance
            </Link>
          </span>
        </div>
      </GlassCard>
    </AuthLayout>
  )
}

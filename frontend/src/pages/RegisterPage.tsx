import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import useFormValidation from '../hooks/useFormValidation'

export default function RegisterPage() {
  const [acceptTerms, setAcceptTerms] = useState(false)

  const { values, errors, handleChange, handleBlur, validate } = useFormValidation(
    { fullName: '', email: '', password: '', confirmPassword: '' },
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
      password: {
        required: true,
        minLength: 8,
      },
      confirmPassword: {
        required: true,
        match: { field: 'password', message: 'Passwords do not match' },
      },
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) return
    if (validate()) {
      console.log('Register:', values)
    }
  }

  return (
    <AuthLayout>
      <GlassCard className="max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
            // New Operator
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-border text-accent2">
            Register
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
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

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />

          <Checkbox
            label={
              <>
                I accept the{' '}
                <Link to="#" className="text-accent2 hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </>
            }
            checked={acceptTerms}
            onChange={setAcceptTerms}
          />

          <Button variant="primary" type="submit" disabled={!acceptTerms}>
            Create Operator Account
          </Button>
        </form>

        {/* Footer */}
        <div className="border-t border-border mt-6 pt-4 text-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
            Existing operator?{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent2 transition-colors"
            >
              Authenticate
            </Link>
          </span>
        </div>
      </GlassCard>
    </AuthLayout>
  )
}

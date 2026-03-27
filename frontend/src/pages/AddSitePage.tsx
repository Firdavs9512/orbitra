import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import useFormValidation from '../hooks/useFormValidation'
import { api } from '../lib/api'
import type { Website } from '../types/analytics'

/* ── Orbital background animation ── */
function OrbitalBackground({ generated }: { generated: boolean }) {
  const rings = [
    { size: 300, opacity: 0.07, speed: 25 },
    { size: 450, opacity: 0.05, speed: 35 },
    { size: 600, opacity: 0.03, speed: 50 },
  ]

  const dots = [
    { cx: '18%', cy: '25%', size: 4, color: 'var(--color-accent)', delay: 0 },
    { cx: '82%', cy: '20%', size: 3, color: 'var(--color-accent2)', delay: 0.5 },
    { cx: '75%', cy: '72%', size: 5, color: 'var(--color-accent)', delay: 1.0 },
    { cx: '25%', cy: '78%', size: 3, color: 'var(--color-warn)', delay: 1.5 },
    { cx: '90%', cy: '45%', size: 4, color: 'var(--color-accent2)', delay: 0.8 },
    { cx: '10%', cy: '55%', size: 3, color: 'var(--color-accent)', delay: 2.0 },
    { cx: '55%', cy: '12%', size: 3, color: 'var(--color-accent2)', delay: 1.3 },
    { cx: '50%', cy: '88%', size: 4, color: 'var(--color-accent)', delay: 0.3 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: generated
            ? 'radial-gradient(ellipse at 50% 50%, rgba(100,240,200,0.06) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(68,204,255,0.04) 0%, transparent 60%)',
          transition: 'background 0.8s ease',
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(100,240,200,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(100,240,200,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)',
        }}
      />

      {/* Orbital rings — centered */}
      {rings.map((ring, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: ring.size,
            height: ring.size,
            top: '50%',
            left: '50%',
            borderColor: `rgba(100, 240, 200, ${ring.opacity})`,
            animation: `orbit-spin ${ring.speed}s linear infinite${i % 2 === 1 ? ' reverse' : ''}`,
          }}
        />
      ))}

      {/* Radar sweep */}
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: '50%',
          left: '50%',
          animation: 'radar-sweep 6s linear infinite',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(100, 240, 200, 0.04) 40deg, transparent 80deg)',
        }}
      />

      {/* Floating dots */}
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: dot.size,
            height: dot.size,
            left: dot.cx,
            top: dot.cy,
            backgroundColor: dot.color,
            boxShadow: `0 0 ${dot.size * 3}px ${dot.color}`,
            animation: `float-dot ${2 + i * 0.3}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}

      {/* Connection lines — lines from left to form */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
        <line x1="10%" y1="25%" x2="35%" y2="40%" stroke="var(--color-accent)" strokeWidth="1" />
        <line x1="90%" y1="20%" x2="65%" y2="35%" stroke="var(--color-accent2)" strokeWidth="1" />
        <line x1="85%" y1="75%" x2="65%" y2="60%" stroke="var(--color-accent)" strokeWidth="1" />
        <line x1="15%" y1="80%" x2="35%" y2="60%" stroke="var(--color-accent2)" strokeWidth="1" />
      </svg>

      {/* Central glow point */}
      <div
        className="absolute rounded-full"
        style={{
          width: 8,
          height: 8,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: generated ? 'var(--color-accent)' : 'var(--color-accent2)',
          boxShadow: `0 0 30px 10px ${generated ? 'rgba(100,240,200,0.15)' : 'rgba(68,204,255,0.12)'}`,
          transition: 'all 0.8s ease',
        }}
      />

      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 w-full h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(100,240,200,0.08), transparent)',
            animation: 'scanMove 5s linear infinite',
          }}
        />
      </div>
    </div>
  )
}

/* ── Additional info panel (right side) ── */
function InfoPanel({ generated }: { generated: boolean }) {
  const steps = [
    { num: '01', label: 'Enter website details', done: generated },
    { num: '02', label: 'Generate tracking code', done: generated },
    { num: '03', label: 'Add script to your site', done: false },
    { num: '04', label: 'Start receiving data', done: false },
  ]

  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      {/* Title */}
      <div>
        <h2 className="font-sans text-text text-xl font-semibold mb-2">Connect Your Website</h2>
        <p className="font-mono text-[11px] text-dim leading-relaxed">
          Add a single line of code to start collecting real-time analytics data from your website.
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <div key={step.num} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-semibold border flex-shrink-0"
              style={{
                borderColor: step.done ? 'var(--color-accent)' : 'var(--color-border)',
                color: step.done ? 'var(--color-accent)' : 'var(--color-dim)',
                background: step.done ? 'rgba(100,240,200,0.08)' : 'transparent',
              }}
            >
              {step.done ? '✓' : step.num}
            </div>
            <span
              className="font-mono text-[11px] tracking-wider"
              style={{ color: step.done ? 'var(--color-accent)' : 'var(--color-dim)' }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mini stats */}
      <div
        className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border"
        style={{ background: 'rgba(6, 14, 22, 0.5)' }}
      >
        {[
          { label: 'Latency', value: '12ms' },
          { label: 'Uptime', value: '99.98%' },
          { label: 'Nodes', value: '48' },
        ].map((m) => (
          <div key={m.label} className="flex flex-col items-center">
            <span className="font-mono text-[8px] uppercase tracking-wider text-dim">{m.label}</span>
            <span className="font-mono text-[12px] text-text font-semibold mt-0.5">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: generated ? 'var(--color-accent)' : 'var(--color-accent2)',
            boxShadow: `0 0 6px ${generated ? 'var(--color-accent)' : 'var(--color-accent2)'}`,
            animation: 'pulse-blink 1.5s ease-in-out infinite',
          }}
        />
        <span
          className="font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ color: generated ? 'var(--color-accent)' : 'var(--color-accent2)' }}
        >
          {generated ? 'Tracking Code Generated' : 'Awaiting Configuration'}
        </span>
      </div>
    </div>
  )
}

export default function AddSitePage() {
  const navigate = useNavigate()
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [idCopied, setIdCopied] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { values, errors, handleChange, handleBlur, validate } = useFormValidation(
    { name: '', domain: '' },
    {
      name: {
        required: true,
        minLength: 2,
      },
      domain: {
        required: true,
        pattern: {
          value: /^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/,
          message: 'Enter a valid domain (e.g. example.com)',
        },
      },
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const site = await api.post<Website>('/api/sites', {
        name: values.name,
        domain: values.domain,
      })
      setTrackingId(site.trackingId)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create site')
    } finally {
      setSubmitting(false)
    }
  }

  const trackingScript = trackingId
    ? `<script src="https://orbitra.io/track.js" data-site="${trackingId}"></script>`
    : ''

  const copyScript = () => {
    navigator.clipboard.writeText(trackingScript)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const copyId = () => {
    if (!trackingId) return
    navigator.clipboard.writeText(trackingId)
    setIdCopied(true)
    setTimeout(() => setIdCopied(false), 2000)
  }

  const generated = !!trackingId

  return (
    <DashboardLayout
      topbar={<DashboardTopbar />}
      sidebar={<DashboardSidebar />}
      main={
        <div className="relative min-h-full">
          {/* Orbital background — across entire page */}
          <OrbitalBackground generated={generated} />

          {/* Content */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-full items-center p-6 lg:p-10">
            {/* Left side: Form (3/5) */}
            <div className="lg:col-span-3 flex justify-center">
              {!trackingId ? (
                <GlassCard className="w-full max-w-md">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
                      // Connect Website
                    </h2>
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-border text-accent2">
                      New
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      label="Website Name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.name}
                      placeholder="My Blog"
                    />

                    <Input
                      label="Domain"
                      name="domain"
                      value={values.domain}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.domain}
                      placeholder="example.com"
                    />

                    {submitError && (
                      <div className="font-mono text-[11px] text-red-400 tracking-wider">
                        {submitError}
                      </div>
                    )}

                    <Button variant="primary" type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Generate Tracking Code'}
                    </Button>
                  </form>

                  {/* Footer */}
                  <div className="border-t border-border mt-6 pt-4 text-center">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
                      <Link
                        to="/sites"
                        className="text-accent hover:text-accent2 transition-colors"
                      >
                        ← Back to Sites
                      </Link>
                    </span>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="w-full max-w-md">
                  {/* Success Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
                      // Tracking Code Ready
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
                        Generated
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Site Info */}
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-accent text-base font-medium">{values.domain}</span>
                      <span className="font-mono text-[10px] text-dim uppercase tracking-wider">{values.name}</span>
                    </div>

                    {/* Tracking ID */}
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim block mb-1.5">
                        Tracking ID
                      </span>
                      <div className="flex items-center gap-3">
                        <code className="font-mono text-lg text-accent font-semibold tracking-wider">
                          {trackingId}
                        </code>
                        <button
                          onClick={copyId}
                          className="font-mono text-[9px] uppercase tracking-wider text-accent2 hover:text-accent transition-colors cursor-pointer"
                        >
                          {idCopied ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Script Snippet */}
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim block mb-1.5">
                        Paste this in your {'<head>'} tag
                      </span>
                      <div
                        className="relative rounded-lg p-4 border border-border overflow-x-auto"
                        style={{ background: 'rgba(2, 4, 8, 0.6)' }}
                      >
                        <code className="font-mono text-[11px] text-accent2 leading-relaxed break-all">
                          {trackingScript}
                        </code>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <Button variant="primary" onClick={copyScript}>
                        {codeCopied ? '✓ Code Copied!' : 'Copy Tracking Code'}
                      </Button>
                      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                      </Button>
                    </div>

                    {/* Back link */}
                    <div className="border-t border-border pt-4 text-center">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
                        <Link
                          to="/sites"
                          className="text-accent hover:text-accent2 transition-colors"
                        >
                          ← Back to Sites
                        </Link>
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right side: Info panel (2/5) */}
            <div className="hidden lg:block lg:col-span-2">
              <InfoPanel generated={generated} />
            </div>
          </div>
        </div>
      }
    />
  )
}

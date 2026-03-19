import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import type { Website } from '../types/analytics'

const statusConfig = {
  active: { color: '#64f0c8', label: 'Active' },
  pending: { color: '#ffb84c', label: 'Pending' },
  inactive: { color: '#ff5f63', label: 'Inactive' },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'No data yet'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function WebsiteCard({ site }: { site: Website }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const status = statusConfig[site.status]

  const copyTrackingId = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(site.trackingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard className="!p-5 hover:border-border-bright transition-all duration-200 cursor-pointer group">
      <div className="flex flex-col gap-4">
        {/* Top: Status + Domain */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: status.color,
                boxShadow: `0 0 8px ${status.color}`,
                animation: site.status === 'active' ? 'glow-pulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <div>
              <div className="font-sans text-accent text-base font-medium leading-tight">
                {site.domain}
              </div>
              <div className="font-mono text-[10px] text-dim uppercase tracking-wider mt-0.5">
                {site.name}
              </div>
            </div>
          </div>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-border"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Tracking ID */}
        <div className="flex items-center gap-2">
          <code className="font-mono text-[11px] text-dim tracking-wider">{site.trackingId}</code>
          <button
            onClick={copyTrackingId}
            className="font-mono text-[9px] uppercase tracking-wider text-accent2 hover:text-accent transition-colors cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-dim">Users</span>
            <span className="font-mono text-sm font-semibold text-text mt-0.5">
              {site.stats.activeUsers.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-dim">Views 24h</span>
            <span className="font-mono text-sm font-semibold text-text mt-0.5">
              {site.stats.pageViews24h.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-dim">Avg Session</span>
            <span className="font-mono text-sm font-semibold text-text mt-0.5">
              {formatDuration(site.stats.avgSessionDuration)}
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10px] text-dim tracking-wider">
            {timeAgo(site.lastDataAt)}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => navigate(`/dashboard/${site.id}`)}
              className="!w-auto !py-1.5 !px-4 !text-[9px]"
            >
              Open Dashboard
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center border border-border"
        style={{ background: 'rgba(10, 20, 32, 0.55)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-sans text-text text-lg mb-1">No websites yet</p>
        <p className="font-mono text-[11px] text-dim uppercase tracking-wider">
          Connect your first website to start tracking
        </p>
      </div>
      <Link to="/sites/new">
        <Button variant="primary" className="!w-auto !px-8">
          Add Your First Website
        </Button>
      </Link>
    </div>
  )
}

export default function SitesPage() {
  const [sites, setSites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Website[]>('/api/sites')
      .then(setSites)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout
      topbar={<DashboardTopbar />}
      sidebar={<DashboardSidebar />}
      main={
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-sans text-text text-2xl font-semibold">Your Websites</h1>
              <p className="font-mono text-[11px] text-dim uppercase tracking-wider mt-1">
                {sites.length} properties connected
              </p>
            </div>
            <Link to="/sites/new">
              <Button variant="primary" className="!w-auto !px-6">
                + Add Website
              </Button>
            </Link>
          </div>

          {/* Grid or Empty State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="font-mono text-[11px] text-dim uppercase tracking-wider animate-pulse">
                Loading websites...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="font-mono text-[11px] text-red-400 uppercase tracking-wider">
                {error}
              </span>
              <Button variant="ghost" onClick={() => window.location.reload()} className="!w-auto !px-6">
                Retry
              </Button>
            </div>
          ) : sites.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sites.map((site) => (
                <WebsiteCard key={site.id} site={site} />
              ))}
            </div>
          )}
        </div>
      }
    />
  )
}

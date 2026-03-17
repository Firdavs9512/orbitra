import type { AnalyticsStats } from '../../types/analytics'
import StatCard from './StatCard'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

interface StatsGridProps {
  stats: AnalyticsStats
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <StatCard
        label="Page Views / min"
        value={stats.pageViewsPerMinute}
        subtext="real-time"
        trend="neutral"
      />
      <StatCard
        label="Avg Session"
        value={formatDuration(stats.avgSessionDuration)}
        subtext="duration"
        trend="neutral"
      />
      <StatCard
        label="Bounce Rate"
        value={`${stats.bounceRate}%`}
        subtext={stats.bounceRate > 50 ? 'above target' : 'within target'}
        trend={stats.bounceRate > 50 ? 'down' : 'up'}
      />
      <StatCard
        label="Sessions 24h"
        value={formatNumber(stats.totalSessions24h)}
        subtext={`${formatNumber(stats.totalPageViews24h)} page views`}
        trend="up"
      />
    </div>
  )
}

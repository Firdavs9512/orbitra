import type Redis from 'ioredis'
import type { OrbitraConfig } from '../config'
import type { DatabaseProvider } from '../providers/interface'
import type {
  EventRow, ActiveUser, ActivityEvent, DashboardData,
  AnalyticsStats, CountryStats, PageStats, TrafficSource, GlobePoint,
} from '../types'

const SOURCE_COLORS: Record<string, string> = {
  'direct': '#64f0c8',
  'google.com': '#44ccff',
  'bing.com': '#44ccff',
  'twitter.com': '#ffb84c',
  'facebook.com': '#ffb84c',
  'reddit.com': '#ffb84c',
  'linkedin.com': '#ffb84c',
  'github.com': '#b388ff',
  'producthunt.com': '#b388ff',
}

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source.toLowerCase()] || '#69f0ae'
}

function classifyReferrer(referrer: string): string {
  if (!referrer || referrer === 'direct' || referrer === '') return 'Direct'
  if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('duckduckgo')) return 'Organic Search'
  if (referrer.includes('twitter') || referrer.includes('facebook') || referrer.includes('reddit') || referrer.includes('linkedin')) return 'Social'
  if (referrer.includes('mail') || referrer.includes('email')) return 'Email'
  return 'Referral'
}

export class RealtimeService {
  private activeUsers = new Map<string, Map<string, ActiveUser>>() // siteId -> (visitorId -> ActiveUser)
  private recentEvents = new Map<string, ActivityEvent[]>() // siteId -> recent events
  private peakConcurrent = new Map<string, number>() // siteId -> peak
  private broadcastInterval: ReturnType<typeof setInterval> | null = null
  private onDashboardUpdate: ((siteId: string, data: DashboardData) => void) | null = null

  constructor(
    private db: DatabaseProvider,
    private redis: Redis,
    private config: OrbitraConfig,
  ) {}

  start(): void {
    this.broadcastInterval = setInterval(() => {
      this.broadcastAll()
    }, this.config.realtime.broadcastIntervalMs)
  }

  stop(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval)
      this.broadcastInterval = null
    }
  }

  onUpdate(handler: (siteId: string, data: DashboardData) => void): void {
    this.onDashboardUpdate = handler
  }

  handleEvent(siteId: string, event: EventRow): void {
    // Update active users
    if (!this.activeUsers.has(siteId)) {
      this.activeUsers.set(siteId, new Map())
    }
    const siteUsers = this.activeUsers.get(siteId)!

    const activeUser: ActiveUser = {
      id: event.visitorId,
      location: {
        lat: event.lat,
        lng: event.lng,
        city: event.city,
        country: event.country,
        countryCode: event.countryCode,
      },
      currentPage: event.path,
      device: event.device,
      browser: event.browser,
      referrer: event.referrer,
      sessionStart: siteUsers.get(event.visitorId)?.sessionStart || event.timestamp,
      lastActivity: event.timestamp,
    }
    siteUsers.set(event.visitorId, activeUser)

    // Track peak
    const current = siteUsers.size
    const peak = this.peakConcurrent.get(siteId) || 0
    if (current > peak) this.peakConcurrent.set(siteId, current)

    // Store in Redis with TTL for cleanup
    this.redis.set(
      `active:${siteId}:${event.visitorId}`,
      JSON.stringify(activeUser),
      'EX',
      this.config.realtime.activeUserTtlSeconds
    )

    // Add to recent events (skip heartbeats)
    if (event.type !== 'heartbeat') {
      const activityEvent: ActivityEvent = {
        id: event.id,
        type: event.type as ActivityEvent['type'],
        user: {
          id: event.visitorId,
          city: event.city,
          country: event.country,
          countryCode: event.countryCode,
          device: event.device,
        },
        page: event.path,
        detail: event.detail,
        timestamp: event.timestamp,
      }

      if (!this.recentEvents.has(siteId)) {
        this.recentEvents.set(siteId, [])
      }
      const events = this.recentEvents.get(siteId)!
      events.unshift(activityEvent)
      if (events.length > 50) events.length = 50
    }
  }

  getActiveUserCount(siteId: string): number {
    return this.activeUsers.get(siteId)?.size ?? 0
  }

  getActiveUsers(siteId: string): ActiveUser[] {
    const users = this.activeUsers.get(siteId)
    return users ? Array.from(users.values()) : []
  }

  private async broadcastAll(): Promise<void> {
    // Clean up stale users
    const now = Date.now()
    const ttl = this.config.realtime.activeUserTtlSeconds * 1000

    for (const [siteId, users] of this.activeUsers) {
      for (const [visitorId, user] of users) {
        if (now - new Date(user.lastActivity).getTime() > ttl) {
          users.delete(visitorId)
        }
      }
      if (users.size === 0) {
        this.activeUsers.delete(siteId)
        continue
      }

      // Build dashboard data for each active site
      try {
        const data = await this.buildDashboardData(siteId)
        if (this.onDashboardUpdate) {
          this.onDashboardUpdate(siteId, data)
        }
      } catch (err) {
        console.error(`Error building dashboard for site ${siteId}:`, err)
      }
    }
  }

  async buildDashboardData(siteId: string): Promise<DashboardData> {
    const users = this.getActiveUsers(siteId)
    const recentActivity = this.recentEvents.get(siteId) || []

    // DB queries
    const [pageViews24h, totalSessions24h, avgSessionDuration, bounceRate, pvPerMinute] =
      await Promise.all([
        this.db.getPageViews(siteId, '24h'),
        this.db.getTotalSessions(siteId, '24h'),
        this.db.getAvgSessionDuration(siteId, '24h'),
        this.db.getBounceRate(siteId, '24h'),
        this.db.getPageViewsLastMinute(siteId),
      ])

    const stats: AnalyticsStats = {
      activeUsers: users.length,
      pageViewsPerMinute: pvPerMinute,
      avgSessionDuration,
      bounceRate,
      totalPageViews24h: pageViews24h,
      totalSessions24h,
      peakConcurrent: this.peakConcurrent.get(siteId) || users.length,
    }

    const topCountries = this.computeTopCountries(users)
    const topPages = await this.computeTopPages(siteId, users)
    const trafficSources = this.computeTrafficSources(users)
    const globePoints = this.computeGlobePoints(users)

    return {
      stats,
      activeUsers: users,
      recentActivity,
      topPages,
      topCountries,
      trafficSources,
      globePoints,
    }
  }

  private computeTopCountries(users: ActiveUser[]): CountryStats[] {
    const counts = new Map<string, { country: string; countryCode: string; count: number }>()
    for (const u of users) {
      const key = u.location.countryCode
      const existing = counts.get(key)
      if (existing) existing.count++
      else counts.set(key, { country: u.location.country, countryCode: key, count: 1 })
    }
    const total = users.length || 1
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(c => ({
        country: c.country,
        countryCode: c.countryCode,
        users: c.count,
        percentage: Math.round((c.count / total) * 100),
      }))
  }

  private async computeTopPages(siteId: string, users: ActiveUser[]): Promise<PageStats[]> {
    const pageCounts = new Map<string, { path: string; count: number }>()
    for (const u of users) {
      const existing = pageCounts.get(u.currentPage)
      if (existing) existing.count++
      else pageCounts.set(u.currentPage, { path: u.currentPage, count: 1 })
    }

    const dbPages = await this.db.getTopPages(siteId, '24h', 8)
    const dbMap = new Map(dbPages.map(p => [p.path, p]))

    return Array.from(pageCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(p => ({
        path: p.path,
        title: dbMap.get(p.path)?.title || p.path,
        activeUsers: p.count,
        views24h: dbMap.get(p.path)?.views || p.count,
      }))
  }

  private computeTrafficSources(users: ActiveUser[]): TrafficSource[] {
    const counts = new Map<string, number>()
    for (const u of users) {
      const source = classifyReferrer(u.referrer)
      counts.set(source, (counts.get(source) || 0) + 1)
    }
    const total = users.length || 1

    const sourceColors: Record<string, string> = {
      'Direct': '#64f0c8',
      'Organic Search': '#44ccff',
      'Social': '#ffb84c',
      'Referral': '#b388ff',
      'Email': '#69f0ae',
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([source, userCount]) => ({
        source,
        users: userCount,
        percentage: Math.round((userCount / total) * 100),
        color: sourceColors[source] || '#69f0ae',
      }))
  }

  private computeGlobePoints(users: ActiveUser[]): GlobePoint[] {
    const grouped = new Map<string, { lat: number; lng: number; city: string; country: string; count: number }>()

    for (const user of users) {
      const key = `${user.location.lat},${user.location.lng}`
      const existing = grouped.get(key)
      if (existing) {
        existing.count++
      } else {
        grouped.set(key, {
          lat: user.location.lat,
          lng: user.location.lng,
          city: user.location.city,
          country: user.location.country,
          count: 1,
        })
      }
    }

    return Array.from(grouped.values()).map(({ lat, lng, city, country, count }) => ({
      lat,
      lng,
      size: 0.15 + Math.min(count * 0.08, 0.8),
      color: count > 10 ? '#44ccff' : '#64f0c8',
      label: `${city}, ${country}`,
      users: count,
    }))
  }
}

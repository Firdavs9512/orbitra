import type { DatabaseProvider } from '../providers/interface'
import type { RealtimeService } from './realtime'
import type { DashboardData, AnalyticsStats, ActivityEvent, Period } from '../types'

export class AnalyticsService {
  constructor(
    private db: DatabaseProvider,
    private realtime: RealtimeService,
  ) {}

  async getDashboardData(siteId: string): Promise<DashboardData> {
    return this.realtime.buildDashboardData(siteId)
  }

  async getStats(siteId: string, period: Period): Promise<AnalyticsStats> {
    const [pageViews, totalSessions, avgSessionDuration, bounceRate, pvPerMinute] =
      await Promise.all([
        this.db.getPageViews(siteId, period),
        this.db.getTotalSessions(siteId, period),
        this.db.getAvgSessionDuration(siteId, period),
        this.db.getBounceRate(siteId, period),
        this.db.getPageViewsLastMinute(siteId),
      ])

    return {
      activeUsers: this.realtime.getActiveUserCount(siteId),
      pageViewsPerMinute: pvPerMinute,
      avgSessionDuration,
      bounceRate,
      totalPageViews24h: pageViews,
      totalSessions24h: totalSessions,
      peakConcurrent: this.realtime.getActiveUserCount(siteId),
    }
  }

  async getRecentActivity(siteId: string, limit = 50): Promise<ActivityEvent[]> {
    const events = await this.db.getRecentEvents(siteId, limit)
    return events.map(e => ({
      id: e.id,
      type: e.type as ActivityEvent['type'],
      user: {
        id: e.visitorId,
        city: e.city,
        country: e.country,
        countryCode: e.countryCode,
        device: e.device,
      },
      page: e.path,
      detail: e.detail,
      timestamp: e.timestamp,
    }))
  }
}

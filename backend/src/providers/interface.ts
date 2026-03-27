import type { OrbitraConfig } from '../config'
import type { UserRow, SiteRow, EventRow, Period } from '../types'

export interface DatabaseProvider {
  // Lifecycle
  init(): Promise<void>
  close(): Promise<void>

  // Users (auth)
  createUser(user: { id: string; email: string; fullName: string; passwordHash: string; role: string }): Promise<void>
  getUserByEmail(email: string): Promise<UserRow | null>
  getUserById(id: string): Promise<UserRow | null>
  getAllUsers(): Promise<UserRow[]>
  updateUserRole(userId: string, role: string): Promise<void>
  deleteUser(userId: string): Promise<void>
  getUserCount(): Promise<number>
  updateUser(userId: string, data: { email?: string; fullName?: string }): Promise<void>
  updateUserPassword(userId: string, passwordHash: string): Promise<void>

  // Sites
  createSite(site: {
    id: string
    userId: string
    name: string
    domain: string
    trackingId: string
  }): Promise<void>
  getSitesByUserId(userId: string): Promise<SiteRow[]>
  getAllSites(): Promise<SiteRow[]>
  getSiteByTrackingId(trackingId: string): Promise<SiteRow | null>
  getSiteById(id: string): Promise<SiteRow | null>
  updateSiteLastData(siteId: string, timestamp: string): Promise<void>
  updateSiteStatus(siteId: string, status: 'active' | 'pending' | 'inactive'): Promise<void>
  deleteSite(id: string): Promise<void>

  // Events
  insertEvent(event: EventRow): Promise<void>
  insertEvents(events: EventRow[]): Promise<void>

  // Queries
  getPageViews(siteId: string, period: Period): Promise<number>
  getTotalSessions(siteId: string, period: Period): Promise<number>
  getAvgSessionDuration(siteId: string, period: Period): Promise<number>
  getBounceRate(siteId: string, period: Period): Promise<number>
  getTopPages(siteId: string, period: Period, limit?: number): Promise<{ path: string; title: string; views: number }[]>
  getTopCountries(siteId: string, period: Period, limit?: number): Promise<{ country: string; countryCode: string; users: number }[]>
  getTopReferrers(siteId: string, period: Period, limit?: number): Promise<{ source: string; users: number }[]>
  getRecentEvents(siteId: string, limit?: number): Promise<EventRow[]>
  getPageViewsLastMinute(siteId: string): Promise<number>
}

export async function createDatabaseProvider(config: OrbitraConfig): Promise<DatabaseProvider> {
  const providerName = config.database.provider

  if (providerName === 'sqlite') {
    const { SQLiteProvider } = await import('./sqlite')
    const provider = new SQLiteProvider(config.database.sqlite)
    await provider.init()
    return provider
  }

  if (providerName === 'clickhouse') {
    const { ClickHouseProvider } = await import('./clickhouse')
    const provider = new ClickHouseProvider(config.database.clickhouse)
    await provider.init()
    return provider
  }

  throw new Error(`Unknown database provider: ${providerName}`)
}

import { createClient, type ClickHouseClient } from '@clickhouse/client'
import type { DatabaseProvider } from './interface'
import type { UserRow, SiteRow, EventRow, Period } from '../types'

function periodToInterval(period: Period): string {
  const map: Record<Period, string> = {
    '5m': '5 MINUTE',
    '30m': '30 MINUTE',
    '1h': '1 HOUR',
    '24h': '24 HOUR',
    '7d': '7 DAY',
    '30d': '30 DAY',
  }
  return map[period] || map['24h']
}

async function query(client: ClickHouseClient, sql: string, params?: Record<string, any>): Promise<any[]> {
  const result = await client.query({ query: sql, query_params: params, format: 'JSONEachRow' })
  return (await result.json()) as any
}

export class ClickHouseProvider implements DatabaseProvider {
  private client!: ClickHouseClient

  constructor(private config: { url: string; database: string; username?: string; password?: string }) {}

  async init(): Promise<void> {
    this.client = createClient({
      url: this.config.url,
      username: this.config.username || 'default',
      password: this.config.password || '',
      database: this.config.database,
    })

    await this.client.exec({ query: `CREATE DATABASE IF NOT EXISTS ${this.config.database}` })

    await this.client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS ${this.config.database}.users (
          id String, email String, full_name String, password_hash String,
          created_at DateTime64(3, 'UTC') DEFAULT now64()
        ) ENGINE = MergeTree() ORDER BY id
      `,
    })

    await this.client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS ${this.config.database}.sites (
          id String, user_id String, name String, domain String, tracking_id String,
          status LowCardinality(String) DEFAULT 'pending',
          created_at DateTime64(3, 'UTC') DEFAULT now64(),
          last_data_at Nullable(DateTime64(3, 'UTC'))
        ) ENGINE = ReplacingMergeTree() ORDER BY (user_id, id)
      `,
    })

    await this.client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS ${this.config.database}.events (
          id String, site_id String, session_id String, visitor_id String,
          type LowCardinality(String), path String, title String, referrer String,
          browser LowCardinality(String), device LowCardinality(String),
          country LowCardinality(String), country_code LowCardinality(String),
          city String, lat Float64, lng Float64, detail String,
          timestamp DateTime64(3, 'UTC')
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (site_id, timestamp, type)
        TTL toDateTime(timestamp) + INTERVAL 1 YEAR
      `,
    })
  }

  async close(): Promise<void> {
    await this.client.close()
  }

  // ── Users ──

  async createUser(user: { id: string; email: string; fullName: string; passwordHash: string }): Promise<void> {
    await this.client.insert({
      table: 'users',
      values: [{ id: user.id, email: user.email, full_name: user.fullName, password_hash: user.passwordHash }],
      format: 'JSONEachRow',
    })
  }

  async getUserByEmail(email: string): Promise<UserRow | null> {
    const rows = await query(this.client, 'SELECT * FROM users WHERE email = {email:String} LIMIT 1', { email })
    if (rows.length === 0) return null
    const r = rows[0]
    return { id: r.id, email: r.email, fullName: r.full_name, passwordHash: r.password_hash, createdAt: r.created_at }
  }

  async getUserById(id: string): Promise<UserRow | null> {
    const rows = await query(this.client, 'SELECT * FROM users WHERE id = {id:String} LIMIT 1', { id })
    if (rows.length === 0) return null
    const r = rows[0]
    return { id: r.id, email: r.email, fullName: r.full_name, passwordHash: r.password_hash, createdAt: r.created_at }
  }

  // ── Sites ──

  async createSite(site: { id: string; userId: string; name: string; domain: string; trackingId: string }): Promise<void> {
    await this.client.insert({
      table: 'sites',
      values: [{ id: site.id, user_id: site.userId, name: site.name, domain: site.domain, tracking_id: site.trackingId }],
      format: 'JSONEachRow',
    })
  }

  async getSitesByUserId(userId: string): Promise<SiteRow[]> {
    const rows = await query(this.client, 'SELECT * FROM sites FINAL WHERE user_id = {userId:String} ORDER BY created_at DESC', { userId })
    return rows.map(this.mapSiteRow)
  }

  async getSiteByTrackingId(trackingId: string): Promise<SiteRow | null> {
    const rows = await query(this.client, 'SELECT * FROM sites FINAL WHERE tracking_id = {trackingId:String} LIMIT 1', { trackingId })
    return rows.length > 0 ? this.mapSiteRow(rows[0]) : null
  }

  async getSiteById(id: string): Promise<SiteRow | null> {
    const rows = await query(this.client, 'SELECT * FROM sites FINAL WHERE id = {id:String} LIMIT 1', { id })
    return rows.length > 0 ? this.mapSiteRow(rows[0]) : null
  }

  async updateSiteLastData(siteId: string, timestamp: string): Promise<void> {
    const site = await this.getSiteById(siteId)
    if (!site) return
    await this.client.insert({
      table: 'sites',
      values: [{
        id: site.id, user_id: site.userId, name: site.name, domain: site.domain,
        tracking_id: site.trackingId, status: 'active', created_at: site.createdAt,
        last_data_at: timestamp,
      }],
      format: 'JSONEachRow',
    })
  }

  async updateSiteStatus(siteId: string, status: 'active' | 'pending' | 'inactive'): Promise<void> {
    const site = await this.getSiteById(siteId)
    if (!site) return
    await this.client.insert({
      table: 'sites',
      values: [{
        id: site.id, user_id: site.userId, name: site.name, domain: site.domain,
        tracking_id: site.trackingId, status, created_at: site.createdAt,
        last_data_at: site.lastDataAt,
      }],
      format: 'JSONEachRow',
    })
  }

  async deleteSite(id: string): Promise<void> {
    await this.client.exec({ query: `ALTER TABLE events DELETE WHERE site_id = '${id}'` })
    await this.client.exec({ query: `ALTER TABLE sites DELETE WHERE id = '${id}'` })
  }

  private mapSiteRow(row: any): SiteRow {
    return {
      id: row.id, userId: row.user_id, name: row.name, domain: row.domain,
      trackingId: row.tracking_id, status: row.status, createdAt: row.created_at,
      lastDataAt: row.last_data_at || null,
    }
  }

  // ── Events ──

  async insertEvent(event: EventRow): Promise<void> {
    await this.client.insert({
      table: 'events',
      values: [{
        id: event.id, site_id: event.siteId, session_id: event.sessionId,
        visitor_id: event.visitorId, type: event.type, path: event.path,
        title: event.title, referrer: event.referrer, browser: event.browser,
        device: event.device, country: event.country, country_code: event.countryCode,
        city: event.city, lat: event.lat, lng: event.lng, detail: event.detail,
        timestamp: event.timestamp,
      }],
      format: 'JSONEachRow',
    })
  }

  async insertEvents(events: EventRow[]): Promise<void> {
    await this.client.insert({
      table: 'events',
      values: events.map(e => ({
        id: e.id, site_id: e.siteId, session_id: e.sessionId,
        visitor_id: e.visitorId, type: e.type, path: e.path,
        title: e.title, referrer: e.referrer, browser: e.browser,
        device: e.device, country: e.country, country_code: e.countryCode,
        city: e.city, lat: e.lat, lng: e.lng, detail: e.detail,
        timestamp: e.timestamp,
      })),
      format: 'JSONEachRow',
    })
  }

  // ── Queries ──

  async getPageViews(siteId: string, period: Period): Promise<number> {
    const rows = await query(this.client,
      `SELECT count() as count FROM events WHERE site_id = {siteId:String} AND type = 'pageview' AND timestamp >= now() - INTERVAL ${periodToInterval(period)}`,
      { siteId })
    return Number(rows[0]?.count ?? 0)
  }

  async getTotalSessions(siteId: string, period: Period): Promise<number> {
    const rows = await query(this.client,
      `SELECT uniqExact(session_id) as count FROM events WHERE site_id = {siteId:String} AND timestamp >= now() - INTERVAL ${periodToInterval(period)}`,
      { siteId })
    return Number(rows[0]?.count ?? 0)
  }

  async getAvgSessionDuration(siteId: string, period: Period): Promise<number> {
    const rows = await query(this.client, `
      SELECT avg(duration) as avg_duration FROM (
        SELECT dateDiff('second', min(timestamp), max(timestamp)) as duration
        FROM events WHERE site_id = {siteId:String} AND timestamp >= now() - INTERVAL ${periodToInterval(period)}
        GROUP BY session_id HAVING count() > 1
      )`, { siteId })
    return Math.round(Number(rows[0]?.avg_duration ?? 0))
  }

  async getBounceRate(siteId: string, period: Period): Promise<number> {
    const rows = await query(this.client, `
      SELECT countIf(pv_count = 1) * 100.0 / nullIf(count(), 0) as bounce_rate FROM (
        SELECT session_id, countIf(type = 'pageview') as pv_count
        FROM events WHERE site_id = {siteId:String} AND timestamp >= now() - INTERVAL ${periodToInterval(period)}
        GROUP BY session_id
      )`, { siteId })
    return Math.round(Number(rows[0]?.bounce_rate ?? 0))
  }

  async getTopPages(siteId: string, period: Period, limit = 8): Promise<{ path: string; title: string; views: number }[]> {
    return query(this.client, `
      SELECT path, any(title) as title, count() as views FROM events
      WHERE site_id = {siteId:String} AND type = 'pageview' AND timestamp >= now() - INTERVAL ${periodToInterval(period)}
      GROUP BY path ORDER BY views DESC LIMIT {limit:UInt32}
    `, { siteId, limit })
  }

  async getTopCountries(siteId: string, period: Period, limit = 10): Promise<{ country: string; countryCode: string; users: number }[]> {
    return query(this.client, `
      SELECT country, country_code as countryCode, uniqExact(visitor_id) as users FROM events
      WHERE site_id = {siteId:String} AND timestamp >= now() - INTERVAL ${periodToInterval(period)} AND country != ''
      GROUP BY country, country_code ORDER BY users DESC LIMIT {limit:UInt32}
    `, { siteId, limit })
  }

  async getTopReferrers(siteId: string, period: Period, limit = 10): Promise<{ source: string; users: number }[]> {
    return query(this.client, `
      SELECT referrer as source, uniqExact(visitor_id) as users FROM events
      WHERE site_id = {siteId:String} AND timestamp >= now() - INTERVAL ${periodToInterval(period)} AND referrer != ''
      GROUP BY referrer ORDER BY users DESC LIMIT {limit:UInt32}
    `, { siteId, limit })
  }

  async getRecentEvents(siteId: string, limit = 50): Promise<EventRow[]> {
    const rows = await query(this.client, `
      SELECT * FROM events WHERE site_id = {siteId:String} AND type != 'heartbeat'
      ORDER BY timestamp DESC LIMIT {limit:UInt32}
    `, { siteId, limit })
    return rows.map(this.mapEventRow)
  }

  async getPageViewsLastMinute(siteId: string): Promise<number> {
    const rows = await query(this.client,
      `SELECT count() as count FROM events WHERE site_id = {siteId:String} AND type = 'pageview' AND timestamp >= now() - INTERVAL 1 MINUTE`,
      { siteId })
    return Number(rows[0]?.count ?? 0)
  }

  private mapEventRow(row: any): EventRow {
    return {
      id: row.id, siteId: row.site_id, sessionId: row.session_id,
      visitorId: row.visitor_id, type: row.type, path: row.path,
      title: row.title, referrer: row.referrer, browser: row.browser,
      device: row.device, country: row.country, countryCode: row.country_code,
      city: row.city, lat: Number(row.lat), lng: Number(row.lng),
      detail: row.detail, timestamp: row.timestamp,
    }
  }
}

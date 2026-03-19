import { Database } from 'bun:sqlite'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import type { DatabaseProvider } from './interface'
import type { UserRow, SiteRow, EventRow, Period } from '../types'

function periodToSql(period: Period): string {
  const map: Record<Period, string> = {
    '5m': "datetime('now', '-5 minutes')",
    '30m': "datetime('now', '-30 minutes')",
    '1h': "datetime('now', '-1 hour')",
    '24h': "datetime('now', '-24 hours')",
    '7d': "datetime('now', '-7 days')",
    '30d': "datetime('now', '-30 days')",
  }
  return map[period] || map['24h']
}

export class SQLiteProvider implements DatabaseProvider {
  private db!: Database

  constructor(private config: { path: string }) {}

  async init(): Promise<void> {
    mkdirSync(dirname(this.config.path), { recursive: true })
    this.db = new Database(this.config.path)
    this.db.exec('PRAGMA journal_mode = WAL')
    this.db.exec('PRAGMA foreign_keys = ON')
    this.createTables()
  }

  async close(): Promise<void> {
    this.db.close()
  }

  private createTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        tracking_id TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_data_at TEXT
      )
    `)
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id)')
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sites_tracking ON sites(tracking_id)')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        type TEXT NOT NULL,
        path TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        referrer TEXT NOT NULL DEFAULT '',
        browser TEXT NOT NULL DEFAULT '',
        device TEXT NOT NULL DEFAULT 'desktop',
        country TEXT NOT NULL DEFAULT '',
        country_code TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT '',
        lat REAL NOT NULL DEFAULT 0,
        lng REAL NOT NULL DEFAULT 0,
        detail TEXT NOT NULL DEFAULT '',
        timestamp TEXT NOT NULL
      )
    `)
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_events_site_ts ON events(site_id, timestamp)')
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)')
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_events_site_type ON events(site_id, type)')
  }

  // ── Users ──

  async createUser(user: { id: string; email: string; fullName: string; passwordHash: string }): Promise<void> {
    this.db.prepare(
      'INSERT INTO users (id, email, full_name, password_hash) VALUES (?, ?, ?, ?)'
    ).run(user.id, user.email, user.fullName, user.passwordHash)
  }

  async getUserByEmail(email: string): Promise<UserRow | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
    if (!row) return null
    return { id: row.id, email: row.email, fullName: row.full_name, passwordHash: row.password_hash, createdAt: row.created_at }
  }

  async getUserById(id: string): Promise<UserRow | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
    if (!row) return null
    return { id: row.id, email: row.email, fullName: row.full_name, passwordHash: row.password_hash, createdAt: row.created_at }
  }

  // ── Sites ──

  async createSite(site: { id: string; userId: string; name: string; domain: string; trackingId: string }): Promise<void> {
    this.db.prepare(
      'INSERT INTO sites (id, user_id, name, domain, tracking_id) VALUES (?, ?, ?, ?, ?)'
    ).run(site.id, site.userId, site.name, site.domain, site.trackingId)
  }

  async getSitesByUserId(userId: string): Promise<SiteRow[]> {
    const rows = this.db.prepare('SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[]
    return rows.map(this.mapSiteRow)
  }

  async getSiteByTrackingId(trackingId: string): Promise<SiteRow | null> {
    const row = this.db.prepare('SELECT * FROM sites WHERE tracking_id = ?').get(trackingId) as any
    return row ? this.mapSiteRow(row) : null
  }

  async getSiteById(id: string): Promise<SiteRow | null> {
    const row = this.db.prepare('SELECT * FROM sites WHERE id = ?').get(id) as any
    return row ? this.mapSiteRow(row) : null
  }

  async updateSiteLastData(siteId: string, timestamp: string): Promise<void> {
    this.db.prepare('UPDATE sites SET last_data_at = ?, status = ? WHERE id = ?').run(timestamp, 'active', siteId)
  }

  async updateSiteStatus(siteId: string, status: 'active' | 'pending' | 'inactive'): Promise<void> {
    this.db.prepare('UPDATE sites SET status = ? WHERE id = ?').run(status, siteId)
  }

  async deleteSite(id: string): Promise<void> {
    this.db.prepare('DELETE FROM events WHERE site_id = ?').run(id)
    this.db.prepare('DELETE FROM sites WHERE id = ?').run(id)
  }

  private mapSiteRow(row: any): SiteRow {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      domain: row.domain,
      trackingId: row.tracking_id,
      status: row.status,
      createdAt: row.created_at,
      lastDataAt: row.last_data_at,
    }
  }

  // ── Events ──

  async insertEvent(event: EventRow): Promise<void> {
    this.db.prepare(`
      INSERT INTO events (id, site_id, session_id, visitor_id, type, path, title, referrer, browser, device, country, country_code, city, lat, lng, detail, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id, event.siteId, event.sessionId, event.visitorId, event.type,
      event.path, event.title, event.referrer, event.browser, event.device,
      event.country, event.countryCode, event.city, event.lat, event.lng,
      event.detail, event.timestamp
    )
  }

  async insertEvents(events: EventRow[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO events (id, site_id, session_id, visitor_id, type, path, title, referrer, browser, device, country, country_code, city, lat, lng, detail, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const tx = this.db.transaction((events: EventRow[]) => {
      for (const e of events) {
        stmt.run(e.id, e.siteId, e.sessionId, e.visitorId, e.type, e.path, e.title, e.referrer, e.browser, e.device, e.country, e.countryCode, e.city, e.lat, e.lng, e.detail, e.timestamp)
      }
    })
    tx(events)
  }

  // ── Queries ──

  async getPageViews(siteId: string, period: Period): Promise<number> {
    const row = this.db.prepare(
      `SELECT COUNT(*) as count FROM events WHERE site_id = ? AND type = 'pageview' AND timestamp >= ${periodToSql(period)}`
    ).get(siteId) as any
    return row?.count ?? 0
  }

  async getTotalSessions(siteId: string, period: Period): Promise<number> {
    const row = this.db.prepare(
      `SELECT COUNT(DISTINCT session_id) as count FROM events WHERE site_id = ? AND timestamp >= ${periodToSql(period)}`
    ).get(siteId) as any
    return row?.count ?? 0
  }

  async getAvgSessionDuration(siteId: string, period: Period): Promise<number> {
    const row = this.db.prepare(`
      SELECT AVG(duration) as avg_duration FROM (
        SELECT (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 86400 as duration
        FROM events
        WHERE site_id = ? AND timestamp >= ${periodToSql(period)}
        GROUP BY session_id
        HAVING COUNT(*) > 1
      )
    `).get(siteId) as any
    return Math.round(row?.avg_duration ?? 0)
  }

  async getBounceRate(siteId: string, period: Period): Promise<number> {
    const row = this.db.prepare(`
      SELECT
        CAST(SUM(CASE WHEN pv_count = 1 THEN 1 ELSE 0 END) AS REAL) / NULLIF(COUNT(*), 0) * 100 as bounce_rate
      FROM (
        SELECT session_id, COUNT(*) as pv_count
        FROM events
        WHERE site_id = ? AND type = 'pageview' AND timestamp >= ${periodToSql(period)}
        GROUP BY session_id
      )
    `).get(siteId) as any
    return Math.round(row?.bounce_rate ?? 0)
  }

  async getTopPages(siteId: string, period: Period, limit = 8): Promise<{ path: string; title: string; views: number }[]> {
    return this.db.prepare(`
      SELECT path, title, COUNT(*) as views
      FROM events
      WHERE site_id = ? AND type = 'pageview' AND timestamp >= ${periodToSql(period)}
      GROUP BY path
      ORDER BY views DESC
      LIMIT ?
    `).all(siteId, limit) as any[]
  }

  async getTopCountries(siteId: string, period: Period, limit = 10): Promise<{ country: string; countryCode: string; users: number }[]> {
    const rows = this.db.prepare(`
      SELECT country, country_code, COUNT(DISTINCT visitor_id) as users
      FROM events
      WHERE site_id = ? AND timestamp >= ${periodToSql(period)} AND country != ''
      GROUP BY country_code
      ORDER BY users DESC
      LIMIT ?
    `).all(siteId, limit) as any[]
    return rows.map(r => ({ country: r.country, countryCode: r.country_code, users: r.users }))
  }

  async getTopReferrers(siteId: string, period: Period, limit = 10): Promise<{ source: string; users: number }[]> {
    return this.db.prepare(`
      SELECT referrer as source, COUNT(DISTINCT visitor_id) as users
      FROM events
      WHERE site_id = ? AND timestamp >= ${periodToSql(period)} AND referrer != ''
      GROUP BY referrer
      ORDER BY users DESC
      LIMIT ?
    `).all(siteId, limit) as any[]
  }

  async getRecentEvents(siteId: string, limit = 50): Promise<EventRow[]> {
    const rows = this.db.prepare(
      "SELECT * FROM events WHERE site_id = ? AND type != 'heartbeat' ORDER BY timestamp DESC LIMIT ?"
    ).all(siteId, limit) as any[]
    return rows.map(this.mapEventRow)
  }

  async getPageViewsLastMinute(siteId: string): Promise<number> {
    const row = this.db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE site_id = ? AND type = 'pageview' AND timestamp >= datetime('now', '-1 minute')"
    ).get(siteId) as any
    return row?.count ?? 0
  }

  private mapEventRow(row: any): EventRow {
    return {
      id: row.id,
      siteId: row.site_id,
      sessionId: row.session_id,
      visitorId: row.visitor_id,
      type: row.type,
      path: row.path,
      title: row.title,
      referrer: row.referrer,
      browser: row.browser,
      device: row.device,
      country: row.country,
      countryCode: row.country_code,
      city: row.city,
      lat: row.lat,
      lng: row.lng,
      detail: row.detail,
      timestamp: row.timestamp,
    }
  }
}

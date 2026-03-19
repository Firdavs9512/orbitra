// ── Backend internal types ──

export type Period = '5m' | '30m' | '1h' | '24h' | '7d' | '30d'

export interface UserRow {
  id: string
  email: string
  fullName: string
  passwordHash: string
  createdAt: string
}

export interface SiteRow {
  id: string
  userId: string
  name: string
  domain: string
  trackingId: string
  status: 'active' | 'pending' | 'inactive'
  createdAt: string
  lastDataAt: string | null
}

export interface EventRow {
  id: string
  siteId: string
  sessionId: string
  visitorId: string
  type: 'pageview' | 'click' | 'scroll' | 'form_submit' | 'purchase' | 'signup' | 'error' | 'heartbeat'
  path: string
  title: string
  referrer: string
  browser: string
  device: 'desktop' | 'mobile' | 'tablet'
  country: string
  countryCode: string
  city: string
  lat: number
  lng: number
  detail: string
  timestamp: string
}

// ── Frontend-matching response types ──

export interface GeoPoint {
  lat: number
  lng: number
  city: string
  country: string
  countryCode: string
}

export interface ActiveUser {
  id: string
  location: GeoPoint
  currentPage: string
  device: 'desktop' | 'mobile' | 'tablet'
  browser: string
  referrer: string
  sessionStart: string
  lastActivity: string
}

export interface ActivityEvent {
  id: string
  type: 'pageview' | 'click' | 'scroll' | 'form_submit' | 'purchase' | 'signup' | 'error'
  user: {
    id: string
    city: string
    country: string
    countryCode: string
    device: 'desktop' | 'mobile' | 'tablet'
  }
  page: string
  detail: string
  timestamp: string
}

export interface AnalyticsStats {
  activeUsers: number
  pageViewsPerMinute: number
  avgSessionDuration: number
  bounceRate: number
  totalPageViews24h: number
  totalSessions24h: number
  peakConcurrent: number
}

export interface CountryStats {
  country: string
  countryCode: string
  users: number
  percentage: number
}

export interface PageStats {
  path: string
  title: string
  activeUsers: number
  views24h: number
}

export interface TrafficSource {
  source: string
  users: number
  percentage: number
  color: string
}

export interface GlobePoint {
  lat: number
  lng: number
  size: number
  color: string
  label: string
  users: number
}

export interface DashboardData {
  stats: AnalyticsStats
  activeUsers: ActiveUser[]
  recentActivity: ActivityEvent[]
  topPages: PageStats[]
  topCountries: CountryStats[]
  trafficSources: TrafficSource[]
  globePoints: GlobePoint[]
}

export interface Website {
  id: string
  name: string
  domain: string
  trackingId: string
  status: 'active' | 'pending' | 'inactive'
  createdAt: string
  lastDataAt: string | null
  stats: {
    activeUsers: number
    pageViews24h: number
    avgSessionDuration: number
  }
}

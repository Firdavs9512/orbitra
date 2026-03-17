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

export interface DashboardData {
  stats: AnalyticsStats
  activeUsers: ActiveUser[]
  recentActivity: ActivityEvent[]
  topPages: PageStats[]
  topCountries: CountryStats[]
  trafficSources: TrafficSource[]
  globePoints: GlobePoint[]
}

export interface GlobePoint {
  lat: number
  lng: number
  size: number
  color: string
  label: string
  users: number
}

import type {
  ActiveUser,
  ActivityEvent,
  AnalyticsStats,
  CountryStats,
  DashboardData,
  GeoPoint,
  GlobePoint,
  PageStats,
  TrafficSource,
} from '../types/analytics'

const LOCATIONS: GeoPoint[] = [
  { lat: 40.7128, lng: -74.006, city: 'New York', country: 'United States', countryCode: 'US' },
  { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'United States', countryCode: 'US' },
  { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'United States', countryCode: 'US' },
  { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'United States', countryCode: 'US' },
  { lat: 51.5074, lng: -0.1278, city: 'London', country: 'United Kingdom', countryCode: 'GB' },
  { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France', countryCode: 'FR' },
  { lat: 52.52, lng: 13.405, city: 'Berlin', country: 'Germany', countryCode: 'DE' },
  { lat: 41.9028, lng: 12.4964, city: 'Rome', country: 'Italy', countryCode: 'IT' },
  { lat: 40.4168, lng: -3.7038, city: 'Madrid', country: 'Spain', countryCode: 'ES' },
  { lat: 55.7558, lng: 37.6173, city: 'Moscow', country: 'Russia', countryCode: 'RU' },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  { lat: 37.5665, lng: 126.978, city: 'Seoul', country: 'South Korea', countryCode: 'KR' },
  { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China', countryCode: 'CN' },
  { lat: 39.9042, lng: 116.4074, city: 'Beijing', country: 'China', countryCode: 'CN' },
  { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
  { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
  { lat: 19.076, lng: 72.8777, city: 'Mumbai', country: 'India', countryCode: 'IN' },
  { lat: 28.6139, lng: 77.209, city: 'New Delhi', country: 'India', countryCode: 'IN' },
  { lat: 13.0827, lng: 80.2707, city: 'Chennai', country: 'India', countryCode: 'IN' },
  { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
  { lat: -22.9068, lng: -43.1729, city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR' },
  { lat: 19.4326, lng: -99.1332, city: 'Mexico City', country: 'Mexico', countryCode: 'MX' },
  { lat: -34.6037, lng: -58.3816, city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR' },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', countryCode: 'AU' },
  { lat: -37.8136, lng: 144.9631, city: 'Melbourne', country: 'Australia', countryCode: 'AU' },
  { lat: 6.5244, lng: 3.3792, city: 'Lagos', country: 'Nigeria', countryCode: 'NG' },
  { lat: -1.2921, lng: 36.8219, city: 'Nairobi', country: 'Kenya', countryCode: 'KE' },
  { lat: -33.9249, lng: 18.4241, city: 'Cape Town', country: 'South Africa', countryCode: 'ZA' },
  { lat: 30.0444, lng: 31.2357, city: 'Cairo', country: 'Egypt', countryCode: 'EG' },
  { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE', countryCode: 'AE' },
  { lat: 24.7136, lng: 46.6753, city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA' },
  { lat: 41.0082, lng: 28.9784, city: 'Istanbul', country: 'Turkey', countryCode: 'TR' },
  { lat: 59.3293, lng: 18.0686, city: 'Stockholm', country: 'Sweden', countryCode: 'SE' },
  { lat: 60.1699, lng: 24.9384, city: 'Helsinki', country: 'Finland', countryCode: 'FI' },
  { lat: 50.0755, lng: 14.4378, city: 'Prague', country: 'Czech Republic', countryCode: 'CZ' },
  { lat: 47.4979, lng: 19.0402, city: 'Budapest', country: 'Hungary', countryCode: 'HU' },
  { lat: 52.2297, lng: 21.0122, city: 'Warsaw', country: 'Poland', countryCode: 'PL' },
  { lat: 45.4215, lng: -75.6972, city: 'Ottawa', country: 'Canada', countryCode: 'CA' },
  { lat: 49.2827, lng: -123.1207, city: 'Vancouver', country: 'Canada', countryCode: 'CA' },
  { lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'Canada', countryCode: 'CA' },
]

const PAGES: { path: string; title: string }[] = [
  { path: '/', title: 'Home' },
  { path: '/pricing', title: 'Pricing' },
  { path: '/docs', title: 'Documentation' },
  { path: '/docs/getting-started', title: 'Getting Started' },
  { path: '/docs/api-reference', title: 'API Reference' },
  { path: '/blog', title: 'Blog' },
  { path: '/blog/product-update', title: 'Product Update' },
  { path: '/blog/how-to-guide', title: 'How-to Guide' },
  { path: '/dashboard', title: 'Dashboard' },
  { path: '/settings', title: 'Settings' },
  { path: '/settings/billing', title: 'Billing' },
  { path: '/integrations', title: 'Integrations' },
  { path: '/about', title: 'About Us' },
  { path: '/contact', title: 'Contact' },
  { path: '/changelog', title: 'Changelog' },
]

const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Arc', 'Brave']
const REFERRERS = ['google.com', 'twitter.com', 'github.com', 'reddit.com', 'direct', 'linkedin.com', 'bing.com', 'producthunt.com']
const DEVICES: ActiveUser['device'][] = ['desktop', 'mobile', 'tablet']
const EVENT_TYPES: ActivityEvent['type'][] = ['pageview', 'click', 'scroll', 'form_submit', 'purchase', 'signup', 'error']

const EVENT_DETAILS: Record<ActivityEvent['type'], string[]> = {
  pageview: ['Viewed page', 'Landed on page', 'Navigated to page'],
  click: ['Clicked "Get Started"', 'Clicked "Learn More"', 'Clicked "Sign Up"', 'Clicked "Download"', 'Clicked nav link'],
  scroll: ['Scrolled to bottom', 'Scrolled 50%', 'Scrolled to pricing section'],
  form_submit: ['Submitted contact form', 'Submitted feedback', 'Submitted search query'],
  purchase: ['Purchased Pro plan', 'Purchased Team plan', 'Upgraded subscription'],
  signup: ['Created new account', 'Registered via Google', 'Registered via GitHub'],
  error: ['404 Not Found', 'API timeout', 'Form validation error', 'Payment declined'],
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function uid(): string {
  return Math.random().toString(36).substring(2, 10)
}

function generateActiveUser(): ActiveUser {
  const location = randomItem(LOCATIONS)
  const now = new Date()
  const sessionStart = new Date(now.getTime() - randomBetween(30, 1800) * 1000)

  return {
    id: uid(),
    location,
    currentPage: randomItem(PAGES).path,
    device: randomItem(DEVICES),
    browser: randomItem(BROWSERS),
    referrer: randomItem(REFERRERS),
    sessionStart: sessionStart.toISOString(),
    lastActivity: now.toISOString(),
  }
}

export function generateNewActivity(): ActivityEvent {
  const location = randomItem(LOCATIONS)
  const type = randomItem(EVENT_TYPES)
  const page = randomItem(PAGES)

  return {
    id: uid(),
    type,
    user: {
      id: uid(),
      city: location.city,
      country: location.country,
      countryCode: location.countryCode,
      device: randomItem(DEVICES),
    },
    page: page.path,
    detail: `${randomItem(EVENT_DETAILS[type])} ${page.path}`,
    timestamp: new Date().toISOString(),
  }
}

export function generateUpdatedStats(prev: AnalyticsStats): AnalyticsStats {
  const jitter = (val: number, range: number) => Math.max(0, val + randomBetween(-range, range))

  return {
    activeUsers: jitter(prev.activeUsers, 5),
    pageViewsPerMinute: jitter(prev.pageViewsPerMinute, 8),
    avgSessionDuration: Math.max(30, prev.avgSessionDuration + randomBetween(-10, 10)),
    bounceRate: Math.min(100, Math.max(0, prev.bounceRate + randomBetween(-2, 2))),
    totalPageViews24h: prev.totalPageViews24h + randomBetween(0, 15),
    totalSessions24h: prev.totalSessions24h + randomBetween(0, 3),
    peakConcurrent: Math.max(prev.peakConcurrent, prev.activeUsers),
  }
}

function computeGlobePoints(users: ActiveUser[]): GlobePoint[] {
  const grouped = new Map<string, { point: GeoPoint; count: number }>()

  for (const user of users) {
    const key = `${user.location.lat},${user.location.lng}`
    const existing = grouped.get(key)
    if (existing) {
      existing.count++
    } else {
      grouped.set(key, { point: user.location, count: 1 })
    }
  }

  return Array.from(grouped.values()).map(({ point, count }) => ({
    lat: point.lat,
    lng: point.lng,
    size: 0.15 + Math.min(count * 0.08, 0.8),
    color: count > 10 ? '#44ccff' : '#64f0c8',
    label: `${point.city}, ${point.country}`,
    users: count,
  }))
}

function computeTopCountries(users: ActiveUser[]): CountryStats[] {
  const counts = new Map<string, { country: string; countryCode: string; count: number }>()

  for (const user of users) {
    const key = user.location.countryCode
    const existing = counts.get(key)
    if (existing) {
      existing.count++
    } else {
      counts.set(key, { country: user.location.country, countryCode: key, count: 1 })
    }
  }

  const sorted = Array.from(counts.values()).sort((a, b) => b.count - a.count)
  const total = users.length || 1

  return sorted.slice(0, 10).map((c) => ({
    country: c.country,
    countryCode: c.countryCode,
    users: c.count,
    percentage: Math.round((c.count / total) * 100),
  }))
}

function computeTopPages(users: ActiveUser[]): PageStats[] {
  const counts = new Map<string, { page: (typeof PAGES)[number]; count: number }>()

  for (const user of users) {
    const page = PAGES.find((p) => p.path === user.currentPage) || PAGES[0]
    const existing = counts.get(page.path)
    if (existing) {
      existing.count++
    } else {
      counts.set(page.path, { page, count: 1 })
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ page, count }) => ({
      path: page.path,
      title: page.title,
      activeUsers: count,
      views24h: count * randomBetween(20, 80),
    }))
}

export function generateMockDashboard(): DashboardData {
  const userCount = randomBetween(280, 520)
  const activeUsers = Array.from({ length: userCount }, generateActiveUser)

  const stats: AnalyticsStats = {
    activeUsers: userCount,
    pageViewsPerMinute: randomBetween(45, 120),
    avgSessionDuration: randomBetween(120, 340),
    bounceRate: randomBetween(35, 55),
    totalPageViews24h: randomBetween(15000, 45000),
    totalSessions24h: randomBetween(3000, 8000),
    peakConcurrent: userCount + randomBetween(20, 100),
  }

  const recentActivity = Array.from({ length: 30 }, generateNewActivity)

  const trafficSources: TrafficSource[] = [
    { source: 'Direct', users: randomBetween(80, 150), percentage: 0, color: '#64f0c8' },
    { source: 'Organic Search', users: randomBetween(100, 200), percentage: 0, color: '#44ccff' },
    { source: 'Social', users: randomBetween(40, 100), percentage: 0, color: '#ffb84c' },
    { source: 'Referral', users: randomBetween(30, 80), percentage: 0, color: '#b388ff' },
    { source: 'Email', users: randomBetween(10, 40), percentage: 0, color: '#69f0ae' },
  ]

  const totalTraffic = trafficSources.reduce((s, t) => s + t.users, 0)
  trafficSources.forEach((t) => {
    t.percentage = Math.round((t.users / totalTraffic) * 100)
  })

  return {
    stats,
    activeUsers,
    recentActivity,
    topPages: computeTopPages(activeUsers),
    topCountries: computeTopCountries(activeUsers),
    trafficSources,
    globePoints: computeGlobePoints(activeUsers),
  }
}

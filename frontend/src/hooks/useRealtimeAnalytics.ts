import { useState, useEffect, useCallback, useRef } from 'react'
import type { DashboardData, ActiveUser, GlobePoint } from '../types/analytics'
import { generateMockDashboard, generateNewActivity, generateUpdatedStats } from '../data/mockAnalytics'

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function recomputeGlobePoints(users: ActiveUser[]): GlobePoint[] {
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

export default function useRealtimeAnalytics() {
  const [data, setData] = useState<DashboardData>(() => generateMockDashboard())
  const [isConnected, setIsConnected] = useState(true)
  const previousUsers = useRef(data.stats.activeUsers)

  const tick = useCallback(() => {
    setData((prev) => {
      const newEvents = Array.from({ length: randomBetween(1, 3) }, generateNewActivity)
      const recentActivity = [...newEvents, ...prev.recentActivity].slice(0, 50)

      const stats = generateUpdatedStats(prev.stats)

      let activeUsers = [...prev.activeUsers]

      // 10% chance to add/remove users
      if (Math.random() < 0.1) {
        const change = randomBetween(-3, 5)
        if (change > 0) {
          for (let i = 0; i < change; i++) {
            const locations = [
              { lat: 40.7128, lng: -74.006, city: 'New York', country: 'United States', countryCode: 'US' },
              { lat: 51.5074, lng: -0.1278, city: 'London', country: 'United Kingdom', countryCode: 'GB' },
              { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
              { lat: 19.076, lng: 72.8777, city: 'Mumbai', country: 'India', countryCode: 'IN' },
              { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
            ]
            const loc = locations[Math.floor(Math.random() * locations.length)]
            activeUsers.push({
              id: Math.random().toString(36).substring(2, 10),
              location: loc,
              currentPage: '/',
              device: (['desktop', 'mobile', 'tablet'] as const)[Math.floor(Math.random() * 3)],
              browser: 'Chrome',
              referrer: 'direct',
              sessionStart: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
            })
          }
        } else if (change < 0 && activeUsers.length > 10) {
          activeUsers = activeUsers.slice(0, activeUsers.length + change)
        }
      }

      stats.activeUsers = activeUsers.length
      previousUsers.current = prev.stats.activeUsers

      // Recompute derived data
      const globePoints = recomputeGlobePoints(activeUsers)

      // Recompute top countries
      const countryCounts = new Map<string, { country: string; countryCode: string; count: number }>()
      for (const u of activeUsers) {
        const key = u.location.countryCode
        const existing = countryCounts.get(key)
        if (existing) existing.count++
        else countryCounts.set(key, { country: u.location.country, countryCode: key, count: 1 })
      }
      const total = activeUsers.length || 1
      const topCountries = Array.from(countryCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((c) => ({
          country: c.country,
          countryCode: c.countryCode,
          users: c.count,
          percentage: Math.round((c.count / total) * 100),
        }))

      // Recompute top pages
      const pageCounts = new Map<string, { path: string; title: string; count: number }>()
      const PAGES = [
        { path: '/', title: 'Home' },
        { path: '/pricing', title: 'Pricing' },
        { path: '/docs', title: 'Documentation' },
        { path: '/dashboard', title: 'Dashboard' },
        { path: '/blog', title: 'Blog' },
        { path: '/settings', title: 'Settings' },
        { path: '/integrations', title: 'Integrations' },
        { path: '/about', title: 'About Us' },
      ]
      for (const u of activeUsers) {
        const page = PAGES.find((p) => p.path === u.currentPage) || PAGES[0]
        const existing = pageCounts.get(page.path)
        if (existing) existing.count++
        else pageCounts.set(page.path, { path: page.path, title: page.title, count: 1 })
      }
      const topPages = Array.from(pageCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map((p) => ({
          path: p.path,
          title: p.title,
          activeUsers: p.count,
          views24h: p.count * randomBetween(20, 80),
        }))

      return {
        stats,
        activeUsers,
        recentActivity,
        topPages,
        topCountries,
        trafficSources: prev.trafficSources,
        globePoints,
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(tick, 2000)
    setIsConnected(true)
    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [tick])

  return { data, isConnected, previousActiveUsers: previousUsers.current }
}

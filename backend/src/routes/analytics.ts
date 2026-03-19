import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { DatabaseProvider } from '../providers/interface'
import type { AnalyticsService } from '../services/analytics'
import type { Period } from '../types'

const analytics = new Hono<{
  Variables: {
    db: DatabaseProvider
    userId: string
    analytics: AnalyticsService
  }
}>()

analytics.use('*', authMiddleware)

const validPeriods: Period[] = ['5m', '30m', '1h', '24h', '7d', '30d']

function parsePeriod(raw: string | undefined): Period {
  if (raw && validPeriods.includes(raw as Period)) return raw as Period
  return '24h'
}

// GET /api/analytics/:siteId/dashboard
analytics.get('/:siteId/dashboard', async (c) => {
  const svc = c.get('analytics')
  const siteId = c.req.param('siteId')
  const data = await svc.getDashboardData(siteId)
  return c.json(data)
})

// GET /api/analytics/:siteId/stats
analytics.get('/:siteId/stats', async (c) => {
  const svc = c.get('analytics')
  const siteId = c.req.param('siteId')
  const period = parsePeriod(c.req.query('period'))
  const stats = await svc.getStats(siteId, period)
  return c.json(stats)
})

// GET /api/analytics/:siteId/pages
analytics.get('/:siteId/pages', async (c) => {
  const db = c.get('db')
  const siteId = c.req.param('siteId')
  const period = parsePeriod(c.req.query('period'))
  const limit = Number(c.req.query('limit')) || 8
  const pages = await db.getTopPages(siteId, period, limit)
  return c.json(pages)
})

// GET /api/analytics/:siteId/countries
analytics.get('/:siteId/countries', async (c) => {
  const db = c.get('db')
  const siteId = c.req.param('siteId')
  const period = parsePeriod(c.req.query('period'))
  const limit = Number(c.req.query('limit')) || 10
  const countries = await db.getTopCountries(siteId, period, limit)
  return c.json(countries)
})

// GET /api/analytics/:siteId/sources
analytics.get('/:siteId/sources', async (c) => {
  const db = c.get('db')
  const siteId = c.req.param('siteId')
  const period = parsePeriod(c.req.query('period'))
  const limit = Number(c.req.query('limit')) || 10
  const referrers = await db.getTopReferrers(siteId, period, limit)
  return c.json(referrers)
})

// GET /api/analytics/:siteId/activity
analytics.get('/:siteId/activity', async (c) => {
  const svc = c.get('analytics')
  const siteId = c.req.param('siteId')
  const limit = Number(c.req.query('limit')) || 50
  const activity = await svc.getRecentActivity(siteId, limit)
  return c.json(activity)
})

export default analytics

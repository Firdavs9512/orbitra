import { Hono } from 'hono'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { generateId, generateTrackingId } from '../utils/id'
import type { DatabaseProvider } from '../providers/interface'
import type { Website } from '../types'
import type { RealtimeService } from '../services/realtime'

const sites = new Hono<{
  Variables: {
    db: DatabaseProvider
    userId: string
    userRole: string
    realtime: RealtimeService
  }
}>()

// All routes require auth
sites.use('*', authMiddleware)

// GET /api/sites - All users can view sites
sites.get('/', async (c) => {
  const db = c.get('db')
  const realtime = c.get('realtime')
  const userId = c.get('userId')
  const userRole = c.get('userRole')

  // Admins see all sites, viewers only see their own
  const rows = userRole === 'admin'
    ? await db.getAllSites()
    : await db.getSitesByUserId(userId)

  const websites: Website[] = await Promise.all(
    rows.map(async (row) => {
      const activeUsers = realtime.getActiveUserCount(row.id)
      const pageViews24h = await db.getPageViews(row.id, '24h')
      const avgSessionDuration = await db.getAvgSessionDuration(row.id, '24h')

      return {
        id: row.id,
        name: row.name,
        domain: row.domain,
        trackingId: row.trackingId,
        status: row.status,
        createdAt: row.createdAt,
        lastDataAt: row.lastDataAt,
        stats: {
          activeUsers,
          pageViews24h,
          avgSessionDuration,
        },
      }
    })
  )

  return c.json(websites)
})

// POST /api/sites - Admin only
sites.post('/', adminMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const body = await c.req.json()
  const { name, domain } = body

  if (!name || name.length < 2) {
    return c.json({ error: 'Name must be at least 2 characters' }, 400)
  }
  if (!domain || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/.test(domain)) {
    return c.json({ error: 'Invalid domain format' }, 400)
  }

  const id = generateId()
  const trackingId = generateTrackingId()

  await db.createSite({ id, userId, name, domain, trackingId })

  const website: Website = {
    id,
    name,
    domain,
    trackingId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    lastDataAt: null,
    stats: { activeUsers: 0, pageViews24h: 0, avgSessionDuration: 0 },
  }

  return c.json(website, 201)
})

// DELETE /api/sites/:id - Admin only
sites.delete('/:id', adminMiddleware, async (c) => {
  const db = c.get('db')
  const siteId = c.req.param('id')

  const site = await db.getSiteById(siteId)
  if (!site) {
    return c.json({ error: 'Site not found' }, 404)
  }

  await db.deleteSite(siteId)
  return c.json({ success: true })
})

export default sites

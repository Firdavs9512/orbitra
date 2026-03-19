import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { generateId } from '../utils/id'
import { parseUserAgent } from '../utils/ua'
import { geoLookup } from '../services/geo'
import type { DatabaseProvider } from '../providers/interface'
import type { RealtimeService } from '../services/realtime'
import type { EventRow } from '../types'

const ingest = new Hono<{
  Variables: {
    db: DatabaseProvider
    realtime: RealtimeService
  }
}>()

// Tracking endpointlari har qanday domaindan kelishi kerak
ingest.use('*', cors({ origin: '*', allowMethods: ['POST', 'OPTIONS'], allowHeaders: ['Content-Type'] }))

// POST /api/event — no auth required, validated by trackingId
ingest.post('/event', async (c) => {
  const db = c.get('db')
  const realtime = c.get('realtime')

  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const { trackingId, visitorId, sessionId, type, path, title, referrer, detail, timestamp, screenWidth } = body

  if (!trackingId || !type || !path) {
    return c.json({ error: 'Missing required fields: trackingId, type, path' }, 400)
  }

  // Lookup site by tracking ID
  const site = await db.getSiteByTrackingId(trackingId)
  if (!site) {
    return c.json({ error: 'Invalid tracking ID' }, 404)
  }

  // Parse UA and GeoIP
  const ua = c.req.header('User-Agent') || ''
  const { browser, device } = parseUserAgent(ua)
  const ip = c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    || c.req.header('X-Real-IP')
    || '127.0.0.1'
  const geo = geoLookup(ip)

  const event: EventRow = {
    id: generateId(),
    siteId: site.id,
    sessionId: sessionId || generateId(),
    visitorId: visitorId || generateId(),
    type,
    path: path || '/',
    title: title || '',
    referrer: referrer || '',
    browser,
    device: screenWidth ? (screenWidth <= 768 ? 'mobile' : screenWidth <= 1024 ? 'tablet' : 'desktop') : device,
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    lat: geo.lat,
    lng: geo.lng,
    detail: detail || '',
    timestamp: timestamp || new Date().toISOString(),
  }

  // Insert event into database
  await db.insertEvent(event)

  // Update site last data timestamp
  await db.updateSiteLastData(site.id, event.timestamp)

  // Update realtime state
  realtime.handleEvent(site.id, event)

  return c.json({ ok: true })
})

// POST /api/events — batch insert
ingest.post('/events', async (c) => {
  const db = c.get('db')
  const realtime = c.get('realtime')

  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const { trackingId, events: rawEvents } = body
  if (!trackingId || !Array.isArray(rawEvents)) {
    return c.json({ error: 'Missing trackingId or events array' }, 400)
  }

  const site = await db.getSiteByTrackingId(trackingId)
  if (!site) {
    return c.json({ error: 'Invalid tracking ID' }, 404)
  }

  const ua = c.req.header('User-Agent') || ''
  const { browser, device } = parseUserAgent(ua)
  const ip = c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    || c.req.header('X-Real-IP')
    || '127.0.0.1'
  const geo = geoLookup(ip)

  const events: EventRow[] = rawEvents.map((raw: any) => ({
    id: generateId(),
    siteId: site.id,
    sessionId: raw.sessionId || generateId(),
    visitorId: raw.visitorId || generateId(),
    type: raw.type || 'pageview',
    path: raw.path || '/',
    title: raw.title || '',
    referrer: raw.referrer || '',
    browser,
    device: raw.screenWidth ? (raw.screenWidth <= 768 ? 'mobile' : raw.screenWidth <= 1024 ? 'tablet' : 'desktop') : device,
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    lat: geo.lat,
    lng: geo.lng,
    detail: raw.detail || '',
    timestamp: raw.timestamp || new Date().toISOString(),
  }))

  await db.insertEvents(events)
  await db.updateSiteLastData(site.id, events[events.length - 1].timestamp)

  for (const event of events) {
    realtime.handleEvent(site.id, event)
  }

  return c.json({ ok: true, count: events.length })
})

export default ingest

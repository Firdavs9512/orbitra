import { Hono } from 'hono'
import { loadConfig } from './config'
import { createDatabaseProvider } from './providers/interface'
import { createRedisClient } from './redis/client'
import { createCorsMiddleware } from './middleware/cors'
import { initGeo } from './services/geo'
import { RealtimeService } from './services/realtime'
import { AnalyticsService } from './services/analytics'
import { setupWebSocketHandlers } from './websocket/handler'
import authRoutes from './routes/auth'
import siteRoutes from './routes/sites'
import ingestRoutes from './routes/ingest'
import analyticsRoutes from './routes/analytics'
import trackerRoutes from './routes/tracker'
import type { DatabaseProvider } from './providers/interface'
import type Redis from 'ioredis'

type AppEnv = {
  Variables: {
    db: DatabaseProvider
    redis: Redis
    realtime: RealtimeService
    analytics: AnalyticsService
    userId: string
    userEmail: string
  }
}

// Load config
const config = loadConfig()

// Initialize database provider
const db = await createDatabaseProvider(config)

// Initialize Redis
const redis = createRedisClient(config)
await redis.connect()

// Initialize GeoIP
await initGeo()

// Initialize services
const realtime = new RealtimeService(db, redis, config)
const analytics = new AnalyticsService(db, realtime)

// Create Hono app
const app = new Hono<AppEnv>()

// Global middleware
app.use('*', createCorsMiddleware())

// Inject dependencies
app.use('*', async (c, next) => {
  c.set('db', db)
  c.set('redis', redis)
  c.set('realtime', realtime)
  c.set('analytics', analytics)
  await next()
})

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/sites', siteRoutes)
app.route('/api', ingestRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/', trackerRoutes)

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    provider: config.database.provider,
    uptime: process.uptime(),
  })
})

// Setup WebSocket handlers
const wsHandlers = setupWebSocketHandlers(config, realtime)

// Start realtime broadcast
realtime.start()

// Start server with WebSocket support
const server = Bun.serve({
  port: config.server.port,
  hostname: config.server.host,
  fetch(req, server) {
    const url = new URL(req.url)

    // WebSocket upgrade
    if (url.pathname.startsWith('/ws/')) {
      const upgraded = server.upgrade(req, { data: { url, userId: null, siteId: null } } as any)
      if (upgraded) return undefined
      return new Response('WebSocket upgrade failed', { status: 400 })
    }

    return app.fetch(req)
  },
  websocket: {
    open: wsHandlers.open as any,
    message: wsHandlers.message as any,
    close: wsHandlers.close as any,
  },
})

console.log(`
  ╔══════════════════════════════════════════╗
  ║          ORBITRA Analytics Server        ║
  ╠══════════════════════════════════════════╣
  ║  Port:     ${String(config.server.port).padEnd(28)}║
  ║  Provider: ${config.database.provider.padEnd(28)}║
  ║  Redis:    ${config.redis.url.padEnd(28)}║
  ╚══════════════════════════════════════════╝
`)

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...')
  realtime.stop()
  await db.close()
  redis.disconnect()
  process.exit(0)
})

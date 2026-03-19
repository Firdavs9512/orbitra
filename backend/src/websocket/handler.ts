import { verify } from 'hono/jwt'
import type { OrbitraConfig } from '../config'
import type { DashboardData } from '../types'
import type { RealtimeService } from '../services/realtime'

interface WsData {
  url: URL
  userId: string | null
  siteId: string | null
}

// Track all connected WebSocket clients per site
const siteConnections = new Map<string, Set<any>>()

export function setupWebSocketHandlers(config: OrbitraConfig, realtime: RealtimeService) {
  // Register the dashboard update callback
  realtime.onUpdate((siteId: string, data: DashboardData) => {
    const connections = siteConnections.get(siteId)
    if (!connections || connections.size === 0) return

    const message = JSON.stringify({ type: 'dashboard:update', data })
    for (const ws of connections) {
      try {
        ws.send(message)
      } catch {
        connections.delete(ws)
      }
    }
  })

  return {
    async open(ws: any) {
      const url: URL = ws.data.url
      const pathParts = url.pathname.split('/')
      // Expected: /ws/dashboard/:siteId
      const siteId = pathParts[3]
      const token = url.searchParams.get('token')

      if (!token || !siteId) {
        ws.close()
        return
      }

      // Verify JWT
      try {
        const payload = await verify(token, config.auth.jwtSecret, 'HS256')
        ws.data.userId = payload.sub as string
        ws.data.siteId = siteId
      } catch {
        ws.close()
        return
      }

      // Add to site connections
      if (!siteConnections.has(siteId)) {
        siteConnections.set(siteId, new Set())
      }
      siteConnections.get(siteId)!.add(ws)

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        data: { siteId, connectedAt: new Date().toISOString() },
      }))

      // Send initial dashboard data
      try {
        const data = await realtime.buildDashboardData(siteId)
        ws.send(JSON.stringify({ type: 'dashboard:update', data }))
      } catch (err) {
        console.error('Error sending initial dashboard data:', err)
      }
    },

    message(ws: any, msg: string | Buffer) {
      try {
        const parsed = JSON.parse(typeof msg === 'string' ? msg : msg.toString())

        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
          return
        }

        if (parsed.type === 'subscribe' && parsed.siteId) {
          // Remove from old site
          if (ws.data.siteId) {
            siteConnections.get(ws.data.siteId)?.delete(ws)
          }
          // Add to new site
          ws.data.siteId = parsed.siteId
          if (!siteConnections.has(parsed.siteId)) {
            siteConnections.set(parsed.siteId, new Set())
          }
          siteConnections.get(parsed.siteId)!.add(ws)
        }
      } catch {
        // Ignore invalid messages
      }
    },

    close(ws: any) {
      if (ws.data.siteId) {
        siteConnections.get(ws.data.siteId)?.delete(ws)
        const conns = siteConnections.get(ws.data.siteId)
        if (conns && conns.size === 0) {
          siteConnections.delete(ws.data.siteId)
        }
      }
    },
  }
}

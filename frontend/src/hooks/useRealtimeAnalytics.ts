import { useState, useEffect, useRef, useCallback } from 'react'
import { getToken } from '../lib/api'
import type { DashboardData } from '../types/analytics'

const WS_BASE = 'ws://localhost:3000'
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]
const PING_INTERVAL = 25000

function emptyDashboard(): DashboardData {
  return {
    stats: {
      activeUsers: 0,
      pageViewsPerMinute: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      totalPageViews24h: 0,
      totalSessions24h: 0,
      peakConcurrent: 0,
    },
    activeUsers: [],
    recentActivity: [],
    topPages: [],
    topCountries: [],
    trafficSources: [],
    globePoints: [],
    serverLocation: { lat: 0, lng: 0, city: '', country: '' },
  }
}

export default function useRealtimeAnalytics(siteId: string) {
  const [data, setData] = useState<DashboardData>(emptyDashboard)
  const [isConnected, setIsConnected] = useState(false)
  const previousUsers = useRef(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempt = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const pingTimer = useRef<ReturnType<typeof setInterval>>()
  const mountedRef = useRef(true)

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return
    const delay = RECONNECT_DELAYS[
      Math.min(reconnectAttempt.current, RECONNECT_DELAYS.length - 1)
    ]
    reconnectAttempt.current++
    reconnectTimer.current = setTimeout(() => {
      if (mountedRef.current) connect()
    }, delay)
  }, [siteId])

  const connect = useCallback(() => {
    const token = getToken()
    if (!token || !siteId) return

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const url = `${WS_BASE}/ws/dashboard/${siteId}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return }
      setIsConnected(true)
      reconnectAttempt.current = 0

      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, PING_INTERVAL)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'dashboard:update') {
          setData((prev) => {
            previousUsers.current = prev.stats.activeUsers
            return msg.data as DashboardData
          })
        }
      } catch {
        // Ignore malformed messages
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      clearInterval(pingTimer.current)
      wsRef.current = null
      scheduleReconnect()
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [siteId, scheduleReconnect])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(reconnectTimer.current)
      clearInterval(pingTimer.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  return { data, isConnected, previousActiveUsers: previousUsers.current }
}

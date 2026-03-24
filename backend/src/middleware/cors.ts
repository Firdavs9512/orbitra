import { cors } from 'hono/cors'
import { getConfig } from '../config'

export function createCorsMiddleware() {
  const config = getConfig()
  return cors({
    origin: (origin) => config.cors.origins.includes(origin) ? origin : '',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  })
}

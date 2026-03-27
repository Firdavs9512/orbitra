import { cors } from 'hono/cors'
import { getConfig } from '../config'

export function createCorsMiddleware() {
  const config = getConfig()

  // Check if wildcard origin is set
  const isWildcard = config.cors.origins.includes('*')

  // When using wildcard (*), credentials must be false due to browser restrictions
  // When using specific origins, credentials can be true
  const credentials = isWildcard ? false : config.cors.credentials

  return cors({
    origin: isWildcard
      ? '*'
      : (origin) => config.cors.origins.includes(origin) ? origin : '',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials,
  })
}

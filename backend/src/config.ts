export interface OrbitraConfig {
  server: { port: number; host: string }
  database: {
    provider: 'sqlite' | 'clickhouse'
    sqlite: { path: string }
    clickhouse: { url: string; database: string; username: string; password: string }
  }
  redis: { url: string; prefix: string }
  auth: { jwtSecret: string; jwtExpiresIn: string }
  cors: { origins: string[]; credentials: boolean }
  tracker: { sessionTimeoutMinutes: number }
  realtime: { broadcastIntervalMs: number; activeUserTtlSeconds: number }
  geo: { defaultLat: number; defaultLng: number; defaultCity: string; defaultCountry: string; defaultCountryCode: string }
}

let _config: OrbitraConfig | null = null

export function loadConfig(): OrbitraConfig {
  if (_config) return _config

  const config: OrbitraConfig = {
    server: { port: 3000, host: '0.0.0.0' },
    database: {
      provider: 'sqlite',
      sqlite: { path: './data/orbitra.db' },
      clickhouse: { url: 'http://localhost:8123', database: 'orbitra', username: 'default', password: '' },
    },
    redis: { url: 'redis://localhost:6379', prefix: 'orb:' },
    auth: { jwtSecret: 'change-me-in-production', jwtExpiresIn: '7d' },
    cors: { origins: ['*'], credentials: true },
    tracker: { sessionTimeoutMinutes: 30 },
    realtime: { broadcastIntervalMs: 2000, activeUserTtlSeconds: 60 },
    geo: { defaultLat: 0, defaultLng: 0, defaultCity: 'Unknown', defaultCountry: 'Unknown', defaultCountryCode: 'XX' },
  }

  // Load from orbitra.config.ts if exists (runtime)
  try {
    const userConfig = require('../orbitra.config').default
    if (userConfig) {
      Object.assign(config.server, userConfig.server)
      Object.assign(config.database, userConfig.database)
      Object.assign(config.redis, userConfig.redis)
      Object.assign(config.auth, userConfig.auth)
      Object.assign(config.cors, userConfig.cors)
      Object.assign(config.tracker, userConfig.tracker)
      Object.assign(config.realtime, userConfig.realtime)
      if (userConfig.geo) Object.assign(config.geo, userConfig.geo)
    }
  } catch {}

  // Environment variable overrides
  if (process.env.DATABASE_PROVIDER) {
    config.database.provider = process.env.DATABASE_PROVIDER as 'sqlite' | 'clickhouse'
  }
  if (process.env.REDIS_URL) {
    config.redis.url = process.env.REDIS_URL
  }
  if (process.env.JWT_SECRET) {
    config.auth.jwtSecret = process.env.JWT_SECRET
  }
  if (process.env.PORT) {
    config.server.port = Number(process.env.PORT)
  }
  if (process.env.CORS_ORIGINS) {
    config.cors.origins = process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  }
  if (process.env.CORS_CREDENTIALS !== undefined) {
    config.cors.credentials = process.env.CORS_CREDENTIALS === 'true'
  }

  _config = config
  return _config
}

export function getConfig(): OrbitraConfig {
  if (!_config) throw new Error('Config not loaded. Call loadConfig() first.')
  return _config
}

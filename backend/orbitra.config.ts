export default {
  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  database: {
    provider: 'sqlite' as 'sqlite' | 'clickhouse',
    sqlite: {
      path: './data/orbitra.db',
    },
    clickhouse: {
      url: 'http://localhost:8123',
      database: 'orbitra',
      username: 'default',
      password: '',
    },
  },

  redis: {
    url: 'redis://localhost:6379',
    prefix: 'orb:',
  },

  auth: {
    jwtSecret: 'change-me-in-production',
    jwtExpiresIn: '7d',
  },

  cors: {
    origins: ['http://localhost:5173', 'http://localhost:5174'],
  },

  tracker: {
    sessionTimeoutMinutes: 30,
  },

  realtime: {
    broadcastIntervalMs: 2000,
    activeUserTtlSeconds: 60,
  },
}

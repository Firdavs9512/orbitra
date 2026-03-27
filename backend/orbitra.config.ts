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
    // Default: Allow all origins (*) for easy self-hosting
    // For production, specify exact origins: ['https://yourdomain.com']
    origins: ['*'],
    // Credentials: When origins is '*', credentials will be automatically set to false
    // When specific origins are set, credentials can be true for cookie/auth support
    credentials: true,
  },

  tracker: {
    sessionTimeoutMinutes: 30,
  },

  realtime: {
    broadcastIntervalMs: 2000,
    activeUserTtlSeconds: 60,
  },

  geo: {
    defaultLat: 41.2995,
    defaultLng: 69.2401,
    defaultCity: 'Tashkent',
    defaultCountry: 'Uzbekistan',
    defaultCountryCode: 'UZ',
  },
}

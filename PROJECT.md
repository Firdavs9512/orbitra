# Orbitra

Open-source, self-hosted real-time web analytics platform.

## Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build:** Vite 8
- **Styling:** Tailwind CSS 4
- **3D:** Globe.gl + Three.js
- **Routing:** React Router DOM 7

### Backend
- **Runtime:** Bun
- **Framework:** Hono
- **Real-time:** Bun native WebSocket + Redis (pub/sub)
- **Database:** Provider-based (user selects)
  - `sqlite` — lightweight, low resource requirements (small VPS, personal server)
  - `clickhouse` — for high volume (large sites, millions of events)

## Architecture

```
[Websites]                              [Dashboard]
    │                                       ▲
    │  track.js (beacon/fetch)              │ WebSocket (live data)
    ▼                                       │
┌───────────────────────────────────────────────┐
│              Hono API Server (Bun)            │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Ingest   │  │ Query    │  │ WebSocket  │  │
│  │ API      │  │ API      │  │ Server     │  │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │              │          │
│       ▼              ▼              │          │
│  ┌─────────────────────────┐        │          │
│  │  Database Provider      │        │          │
│  │  (SQLite / ClickHouse)  │        │          │
│  └─────────────────────────┘        │          │
│       │                             │          │
│       └────────► Redis ◄────────────┘          │
│              (pub/sub, sessions,               │
│               active users)                    │
└───────────────────────────────────────────────┘
```

## Database Provider System

Database provider is selected through `orbitra.config.ts`:

```ts
export default {
  database: {
    provider: 'sqlite', // 'sqlite' | 'clickhouse'
    sqlite: {
      path: './data/orbitra.db',
    },
    clickhouse: {
      host: 'http://localhost:8123',
      database: 'orbitra',
    },
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  server: {
    port: 3000,
  },
}
```

Each provider implements the same interface:

```ts
interface DatabaseProvider {
  init(): Promise<void>
  insertEvent(event: AnalyticsEvent): Promise<void>
  insertEvents(events: AnalyticsEvent[]): Promise<void>
  getPageViews(siteId: string, period: Period): Promise<PageView[]>
  getActiveUsers(siteId: string): Promise<number>
  getTopPages(siteId: string, period: Period): Promise<TopPage[]>
  getUsersByCountry(siteId: string, period: Period): Promise<CountryStats[]>
  getSessions(siteId: string, period: Period): Promise<Session[]>
  // ...
}
```

## Project Structure

```
orbitra/
├── frontend/          # React dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── data/
│   └── package.json
├── backend/           # Analytics API server
│   ├── src/
│   │   ├── server.ts        # Hono app entry
│   │   ├── config.ts        # Config loader
│   │   ├── routes/
│   │   │   ├── ingest.ts    # Event collection endpoint
│   │   │   ├── analytics.ts # Query endpoints
│   │   │   └── auth.ts      # Authentication
│   │   ├── providers/
│   │   │   ├── interface.ts  # DatabaseProvider interface
│   │   │   ├── sqlite.ts     # SQLite implementation
│   │   │   └── clickhouse.ts # ClickHouse implementation
│   │   ├── websocket/
│   │   │   └── handler.ts    # WebSocket connections
│   │   ├── redis/
│   │   │   └── client.ts     # Redis pub/sub, sessions
│   │   ├── tracker/
│   │   │   └── track.ts      # track.js generator
│   │   └── utils/
│   ├── orbitra.config.ts
│   └── package.json
├── Crucix/            # OSINT intelligence engine (separate)
└── PROJECT.md
```

## Deployment Requirements

### SQLite + Redis (minimal)
- **RAM:** 128MB+
- **CPU:** 1 core
- **Disk:** SQLite file (~100MB per 1M events)
- **Dependencies:** Bun, Redis

### ClickHouse + Redis (advanced)
- **RAM:** 512MB+
- **CPU:** 2+ cores
- **Disk:** ClickHouse optimized storage
- **Dependencies:** Bun, ClickHouse, Redis

## Core Features
- [ ] track.js — lightweight tracking script (~2KB)
- [ ] Event ingestion API (pageview, event, session)
- [ ] Real-time active users (WebSocket)
- [ ] Dashboard API (page views, top pages, countries, referrers)
- [ ] SQLite database provider
- [ ] ClickHouse database provider
- [ ] Redis pub/sub for real-time updates
- [ ] Site management (API keys, domains)
- [ ] Authentication (JWT)
- [ ] Docker Compose (self-host)

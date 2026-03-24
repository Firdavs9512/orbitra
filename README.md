<p align="center">
  <img src="https://orbitra.sh/logo.png" alt="Orbitra" width="80" height="80" />
</p>

<h1 align="center">Orbitra</h1>

<p align="center">
  <strong>Open-source, real-time web analytics with a 3D globe view</strong>
</p>

<p align="center">
  <a href="https://orbitra.sh">Website</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#self-hosting">Self-Hosting</a> ·
  <a href="https://github.com/Firdavs9512/orbitra/issues">Issues</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/Firdavs9512/orbitra?style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/stars/Firdavs9512/orbitra?style=flat-square" alt="Stars" />
  <img src="https://img.shields.io/github/v/release/Firdavs9512/orbitra?style=flat-square" alt="Release" />
</p>

---

## What is Orbitra?

Orbitra is a **self-hosted, privacy-friendly** alternative to Google Analytics. See your visitors in real-time on an interactive 3D globe, understand where your traffic comes from, and own 100% of your data.

- 🌍 **3D Globe** — Watch visitors arrive in real-time on an interactive globe
- ⚡ **Real-time** — Live dashboard powered by WebSocket
- 🔒 **Privacy-first** — No cookies, no personal data collection, GDPR-friendly
- 🪶 **Lightweight** — Tracking script under 2KB, won't slow down your site
- 🏠 **Self-hosted** — Your data stays on your server

## Demo

> 🚧 Live demo coming soon at [orbitra.sh](https://orbitra.sh)

<!--
<p align="center">
  <img src="https://orbitra.sh/screenshot.png" alt="Orbitra Dashboard" width="800" />
</p>
-->

## Features

- **Real-time analytics** — Active visitors, live pageviews via WebSocket
- **3D Globe visualization** — Globe.gl + Three.js powered interactive map
- **Page analytics** — Top pages, entry/exit pages, time on page
- **Visitor insights** — Countries, browsers, OS, devices, referrers
- **Session tracking** — Anonymous session reconstruction
- **Multiple database backends** — SQLite (lightweight) or ClickHouse (high-volume)
- **Lightweight tracker** — ~2KB script, non-blocking, no cookies
- **API-first** — Full REST API for custom integrations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **3D Globe** | Globe.gl, Three.js, D3-geo |
| **Backend** | Bun, Hono |
| **Real-time** | WebSocket (Bun native), Redis pub/sub |
| **Database** | SQLite (default) or ClickHouse |
| **GeoIP** | MaxMind GeoLite2 |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Redis](https://redis.io) 7+

### 1. Clone & Install

```bash
git clone https://github.com/Firdavs9512/orbitra.git
cd orbitra

# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install
```

### 2. Configure

```bash
cd backend
cp orbitra.config.example.ts orbitra.config.ts
```

Edit `orbitra.config.ts`:

```ts
export default {
  database: {
    provider: 'sqlite',  // 'sqlite' | 'clickhouse'
    sqlite: {
      path: './data/orbitra.db',
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

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
bun dev

# Terminal 2 — Frontend
cd frontend
bun dev
```

Dashboard will be available at `http://localhost:5173`

### 4. Add tracking to your site

```html
<script defer src="https://your-orbitra-instance.com/track.js" data-site="YOUR_SITE_ID"></script>
```

## Architecture

```
[Your websites]                        [Dashboard]
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

## Database Providers

Orbitra uses a **provider pattern** — swap databases without changing application code.

### SQLite (default)

Best for small to medium sites. Zero configuration, minimal resources.

- **RAM:** 128MB+
- **CPU:** 1 core
- **Storage:** ~100MB per 1M events

### ClickHouse

Best for high-traffic sites with millions of events.

- **RAM:** 512MB+
- **CPU:** 2+ cores
- **Storage:** Highly compressed columnar storage

## Project Structure

```
orbitra/
├── frontend/              # React dashboard
│   ├── src/
│   │   ├── pages/         # Dashboard pages
│   │   ├── components/    # UI components (Globe, Charts)
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript types
│   └── package.json
├── backend/               # Hono API server
│   ├── src/
│   │   ├── server.ts      # Entry point
│   │   ├── routes/        # API endpoints
│   │   ├── providers/     # Database providers
│   │   ├── websocket/     # Real-time handler
│   │   ├── redis/         # Pub/sub client
│   │   └── tracker/       # track.js generator
│   ├── orbitra.config.ts  # Configuration
│   └── package.json
└── README.md
```

## Roadmap

- [x] Real-time WebSocket dashboard
- [x] 3D Globe visualization
- [x] SQLite provider
- [x] ClickHouse provider
- [x] GeoIP detection (MaxMind)
- [ ] Lightweight tracking script (~2KB)
- [ ] Docker Compose setup
- [ ] Authentication & multi-user
- [ ] Site management & API keys
- [ ] Funnel & event tracking
- [ ] Email reports
- [ ] Public shared dashboards

## Self-Hosting

### Docker (coming soon)

```bash
docker compose up -d
```

### Manual

See [Quick Start](#quick-start) above.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a PR.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Apache 2.0 with Commons Clause](LICENSE)

> **Note:** This software is free to use for personal and non-commercial purposes. The Commons Clause restricts selling the software as a commercial product or service.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Firdavs9512">Firdavs</a>
</p>

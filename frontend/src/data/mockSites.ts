import type { Website } from '../types/analytics'

export const mockSites: Website[] = [
  {
    id: '1',
    name: 'Main Marketing Site',
    domain: 'orbitra.io',
    trackingId: 'ORB-7F3A9B2E',
    status: 'active',
    createdAt: '2025-11-15T10:30:00Z',
    lastDataAt: '2026-03-18T14:22:00Z',
    stats: {
      activeUsers: 342,
      pageViews24h: 28450,
      avgSessionDuration: 245,
    },
  },
  {
    id: '2',
    name: 'Developer Documentation',
    domain: 'docs.orbitra.io',
    trackingId: 'ORB-1D8E4C6A',
    status: 'active',
    createdAt: '2025-12-03T08:15:00Z',
    lastDataAt: '2026-03-18T14:20:00Z',
    stats: {
      activeUsers: 128,
      pageViews24h: 9320,
      avgSessionDuration: 412,
    },
  },
  {
    id: '3',
    name: 'E-commerce Store',
    domain: 'shop.orbitra.io',
    trackingId: 'ORB-5B2F8D1C',
    status: 'active',
    createdAt: '2026-01-20T16:45:00Z',
    lastDataAt: '2026-03-18T14:18:00Z',
    stats: {
      activeUsers: 89,
      pageViews24h: 5640,
      avgSessionDuration: 187,
    },
  },
  {
    id: '4',
    name: 'Blog & Content Hub',
    domain: 'blog.orbitra.io',
    trackingId: 'ORB-9A4C3E7F',
    status: 'pending',
    createdAt: '2026-03-15T12:00:00Z',
    lastDataAt: null,
    stats: {
      activeUsers: 0,
      pageViews24h: 0,
      avgSessionDuration: 0,
    },
  },
  {
    id: '5',
    name: 'Legacy Landing Page',
    domain: 'old.orbitra.io',
    trackingId: 'ORB-2E6B8A4D',
    status: 'inactive',
    createdAt: '2025-08-10T09:00:00Z',
    lastDataAt: '2026-01-05T23:45:00Z',
    stats: {
      activeUsers: 0,
      pageViews24h: 0,
      avgSessionDuration: 0,
    },
  },
]

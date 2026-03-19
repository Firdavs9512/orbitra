import { nanoid } from 'nanoid'

export function generateId(): string {
  return nanoid(16)
}

export function generateTrackingId(): string {
  const chars = '0123456789ABCDEF'
  let id = 'ORB-'
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

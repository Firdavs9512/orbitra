import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { getConfig } from '../config'
import { generateId } from '../utils/id'
import { authMiddleware } from '../middleware/auth'
import type { DatabaseProvider } from '../providers/interface'

const auth = new Hono<{ Variables: { db: DatabaseProvider; userId: string } }>()

// POST /api/auth/register
auth.post('/register', async (c) => {
  const db = c.get('db')
  const body = await c.req.json()
  const { fullName, email, password } = body

  // Validation
  if (!fullName || fullName.length < 2) {
    return c.json({ error: 'Full name must be at least 2 characters' }, 400)
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'Invalid email format' }, 400)
  }
  if (!password || password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }

  // Check if user exists
  const existing = await db.getUserByEmail(email)
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  // Create user
  const id = generateId()
  const passwordHash = await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 12 })
  await db.createUser({ id, email, fullName, passwordHash })

  // Sign JWT
  const config = getConfig()
  const token = await sign(
    { sub: id, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
    config.auth.jwtSecret
  )

  return c.json({ token, user: { id, email, fullName } }, 201)
})

// POST /api/auth/login
auth.post('/login', async (c) => {
  const db = c.get('db')
  const body = await c.req.json()
  const { email, password } = body

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  const user = await db.getUserByEmail(email)
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = await Bun.password.verify(password, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const config = getConfig()
  const token = await sign(
    { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
    config.auth.jwtSecret
  )

  return c.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName } })
})

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')

  const user = await db.getUserById(userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ id: user.id, email: user.email, fullName: user.fullName })
})

export default auth

import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { getConfig } from '../config'
import { generateId } from '../utils/id'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import type { DatabaseProvider } from '../providers/interface'

const auth = new Hono<{ Variables: { db: DatabaseProvider; userId: string; userRole: string } }>()

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

  // Check if this is the first user (becomes admin)
  const userCount = await db.getUserCount()
  const role = userCount === 0 ? 'admin' : 'viewer'

  // Create user
  const id = generateId()
  const passwordHash = await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 12 })
  await db.createUser({ id, email, fullName, passwordHash, role })

  // Sign JWT
  const config = getConfig()
  const token = await sign(
    { sub: id, email, role, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
    config.auth.jwtSecret
  )

  return c.json({ token, user: { id, email, fullName, role } }, 201)
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
    { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
    config.auth.jwtSecret
  )

  return c.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } })
})

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')

  const user = await db.getUserById(userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role })
})

// GET /api/auth/profile - Get current user profile
auth.get('/profile', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')

  const user = await db.getUserById(userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role })
})

// PATCH /api/auth/profile - Update user profile
auth.patch('/profile', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const body = await c.req.json()
  const { fullName, email } = body

  // Validation
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.length < 2)) {
    return c.json({ error: 'Full name must be at least 2 characters' }, 400)
  }
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'Invalid email format' }, 400)
  }

  // Check if email is already taken by another user
  if (email !== undefined) {
    const existing = await db.getUserByEmail(email)
    if (existing && existing.id !== userId) {
      return c.json({ error: 'Email already in use' }, 409)
    }
  }

  // Update user
  const updates: { email?: string; fullName?: string } = {}
  if (email !== undefined) updates.email = email
  if (fullName !== undefined) updates.fullName = fullName

  if (Object.keys(updates).length > 0) {
    await db.updateUser(userId, updates)
  }

  const updatedUser = await db.getUserById(userId)
  if (!updatedUser) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ id: updatedUser.id, email: updatedUser.email, fullName: updatedUser.fullName, role: updatedUser.role })
})

// POST /api/auth/change-password - Change password
auth.post('/change-password', authMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const body = await c.req.json()
  const { oldPassword, newPassword } = body

  // Validation
  if (!oldPassword || !newPassword) {
    return c.json({ error: 'Old password and new password are required' }, 400)
  }
  if (newPassword.length < 8) {
    return c.json({ error: 'New password must be at least 8 characters' }, 400)
  }

  // Get user and verify old password
  const user = await db.getUserById(userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const valid = await Bun.password.verify(oldPassword, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'Current password is incorrect' }, 401)
  }

  // Hash and update new password
  const passwordHash = await Bun.password.hash(newPassword, { algorithm: 'bcrypt', cost: 12 })
  await db.updateUserPassword(userId, passwordHash)

  return c.json({ success: true })
})

// GET /api/auth/users - List all users (admin only)
auth.get('/users', authMiddleware, adminMiddleware, async (c) => {
  const db = c.get('db')
  const users = await db.getAllUsers()

  // Don't return password hashes
  return c.json(users.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt
  })))
})

// POST /api/auth/users - Create new user (admin only)
auth.post('/users', authMiddleware, adminMiddleware, async (c) => {
  const db = c.get('db')
  const body = await c.req.json()
  const { fullName, email, password, role } = body

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
  if (!role || !['admin', 'viewer'].includes(role)) {
    return c.json({ error: 'Invalid role. Must be "admin" or "viewer"' }, 400)
  }

  // Check if user exists
  const existing = await db.getUserByEmail(email)
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  // Create user
  const id = generateId()
  const passwordHash = await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 12 })
  await db.createUser({ id, email, fullName, passwordHash, role })

  return c.json({ id, email, fullName, role }, 201)
})

// PATCH /api/auth/users/:id/role - Update user role (admin only)
auth.patch('/users/:id/role', authMiddleware, adminMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.req.param('id')
  const currentUserId = c.get('userId')
  const body = await c.req.json()
  const { role } = body

  if (!role || !['admin', 'viewer'].includes(role)) {
    return c.json({ error: 'Invalid role. Must be "admin" or "viewer"' }, 400)
  }

  // Prevent admin from demoting themselves
  if (userId === currentUserId) {
    return c.json({ error: 'Cannot change your own role' }, 400)
  }

  const user = await db.getUserById(userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  await db.updateUserRole(userId, role)
  return c.json({ success: true })
})

// DELETE /api/auth/users/:id - Delete user (admin only)
auth.delete('/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const db = c.get('db')
  const userId = c.req.param('id')
  const currentUserId = c.get('userId')

  // Prevent admin from deleting themselves
  if (userId === currentUserId) {
    return c.json({ error: 'Cannot delete your own account' }, 400)
  }

  const user = await db.getUserById(userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  await db.deleteUser(userId)
  return c.json({ success: true })
})

export default auth

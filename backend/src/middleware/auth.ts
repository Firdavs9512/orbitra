import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { getConfig } from '../config'

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, getConfig().auth.jwtSecret, 'HS256')
    c.set('userId', payload.sub as string)
    c.set('userEmail', payload.email as string)
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  await next()
})

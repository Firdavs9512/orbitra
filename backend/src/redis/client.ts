import Redis from 'ioredis'
import type { OrbitraConfig } from '../config'

let redis: Redis | null = null
let redisSub: Redis | null = null

export function createRedisClient(config: OrbitraConfig): Redis {
  redis = new Redis(config.redis.url, {
    keyPrefix: config.redis.prefix,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
  return redis
}

export function createRedisSubscriber(config: OrbitraConfig): Redis {
  redisSub = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
  return redisSub
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis not initialized')
  return redis
}

export function getRedisSubscriber(): Redis {
  if (!redisSub) throw new Error('Redis subscriber not initialized')
  return redisSub
}

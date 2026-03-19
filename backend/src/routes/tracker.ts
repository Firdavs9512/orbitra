import { Hono } from 'hono'
import { getTrackingScriptResponse } from '../tracker/script'

const tracker = new Hono()

tracker.get('/track.js', (c) => {
  return getTrackingScriptResponse()
})

tracker.get('/t.js', (c) => {
  return getTrackingScriptResponse()
})

export default tracker

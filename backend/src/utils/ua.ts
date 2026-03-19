import { UAParser } from 'ua-parser-js'

export function parseUserAgent(ua: string): { browser: string; device: 'desktop' | 'mobile' | 'tablet' } {
  const parser = new UAParser(ua)
  const result = parser.getResult()

  const browser: string = result.browser.name || 'Unknown'
  const deviceType: string | undefined = result.device.type

  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  if (deviceType === 'mobile') device = 'mobile'
  else if (deviceType === 'tablet') device = 'tablet'

  return { browser, device }
}

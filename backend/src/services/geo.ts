import maxmind, { type CityResponse, type Reader } from 'maxmind'
import * as geolite2 from 'geolite2-redist'

let lookup: Reader<CityResponse> | null = null

export async function initGeo(): Promise<void> {
  try {
    const reader = await (geolite2 as any).open('GeoLite2-City', (path: string) =>
      maxmind.open<CityResponse>(path)
    )
    lookup = reader as unknown as Reader<CityResponse>
  } catch (err) {
    console.warn('GeoIP database not available, geo lookups will return defaults:', (err as Error).message)
  }
}

export interface GeoResult {
  lat: number
  lng: number
  city: string
  country: string
  countryCode: string
}

export function geoLookup(ip: string): GeoResult {
  const fallback: GeoResult = { lat: 0, lng: 0, city: 'Unknown', country: 'Unknown', countryCode: 'XX' }

  if (!lookup) return fallback

  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return fallback
  }

  try {
    const result = lookup.get(ip)
    if (!result) return fallback

    return {
      lat: result.location?.latitude ?? 0,
      lng: result.location?.longitude ?? 0,
      city: result.city?.names?.en ?? 'Unknown',
      country: result.country?.names?.en ?? 'Unknown',
      countryCode: result.country?.iso_code ?? 'XX',
    }
  } catch {
    return fallback
  }
}

import maxmind, { type CityResponse, type Reader } from 'maxmind'
import * as geolite2 from 'geolite2-redist'
import { getConfig } from '../config'

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

function getDefaultGeo(): GeoResult {
  const config = getConfig()
  return {
    lat: config.geo.defaultLat,
    lng: config.geo.defaultLng,
    city: config.geo.defaultCity,
    country: config.geo.defaultCountry,
    countryCode: config.geo.defaultCountryCode,
  }
}

function isPrivateIp(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
}

export function geoLookup(ip: string): GeoResult {
  const fallback = getDefaultGeo()

  if (isPrivateIp(ip)) return fallback
  if (!lookup) return fallback

  try {
    const result = lookup.get(ip)
    if (!result) return fallback

    return {
      lat: result.location?.latitude ?? fallback.lat,
      lng: result.location?.longitude ?? fallback.lng,
      city: result.city?.names?.en ?? fallback.city,
      country: result.country?.names?.en ?? fallback.country,
      countryCode: result.country?.iso_code ?? fallback.countryCode,
    }
  } catch {
    return fallback
  }
}

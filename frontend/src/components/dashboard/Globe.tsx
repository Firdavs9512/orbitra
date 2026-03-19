import { useEffect, useRef, memo, useCallback, useState, useMemo } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import GlobeGL from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import * as THREE from 'three'
import { geoNaturalEarth1, geoPath, geoGraticule, geoInterpolate } from 'd3-geo'
import type { Topology } from 'topojson-specification'
import { feature, mesh } from 'topojson-client'
import type { GlobePoint, ServerLocation } from '../../types/analytics'

interface GlobeProps {
  points: GlobePoint[]
  serverLocation: ServerLocation
}

interface GlobeArc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: [string, string]
  stroke: number
  label: string
}

// SVG projected point for flat map
interface FlatPoint {
  x: number
  y: number
  size: number
  color: string
  strokeColor: string
  label: string
  users: number
}

// SVG path for flat map arc
interface FlatArc {
  d: string
  stroke: string
  width: number
  label: string
}

function buildFlightArcs(points: GlobePoint[], serverLocation: ServerLocation): GlobeArc[] {
  if (!serverLocation.lat && !serverLocation.lng) return []

  const arcs: GlobeArc[] = []
  const serverLabel = `${serverLocation.city}, ${serverLocation.country}`

  for (const point of points) {
    // Skip if point is at the same location as server
    if (point.lat === serverLocation.lat && point.lng === serverLocation.lng) continue

    arcs.push({
      startLat: point.lat,
      startLng: point.lng,
      endLat: serverLocation.lat,
      endLng: serverLocation.lng,
      color:
        point.users > 10
          ? ['rgba(68,204,255,0.65)', 'rgba(68,204,255,0.1)']
          : ['rgba(100,240,200,0.5)', 'rgba(100,240,200,0.08)'],
      stroke: Math.max(0.25, Math.min(1.2, point.users / 20)),
      label: `${point.label} → ${serverLabel}: ${point.users} active user${point.users > 1 ? 's' : ''}`,
    })
  }

  return arcs
}

function GlobeComponent({ points, serverLocation }: GlobeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const initRef = useRef(false)
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 })
  const [flightsVisible, setFlightsVisible] = useState(true)
  const [isFlat, setIsFlat] = useState(false)
  const [flatScale, setFlatScale] = useState(1)
  const [flatOffset, setFlatOffset] = useState({ x: 0, y: 0 })
  const [flatSize, setFlatSize] = useState({ width: 900, height: 500 })
  const [worldTopojson, setWorldTopojson] = useState<unknown>(null)

  const allArcs = useMemo(() => buildFlightArcs(points, serverLocation), [points, serverLocation])

  // D3 projection — Natural Earth 1 (same as Crucix)
  const projection = useMemo(() => {
    const { width, height } = flatSize
    return geoNaturalEarth1()
      .fitSize([width - 20, height - 20], { type: 'Sphere' } as never)
      .translate([width / 2, height / 2])
  }, [flatSize])

  const pathGen = useMemo(() => geoPath(projection), [projection])

  // Graticule paths
  const graticulePath = useMemo(() => {
    return pathGen(geoGraticule()()) || ''
  }, [pathGen])

  // Land paths from topojson
  const landPaths = useMemo(() => {
    if (!worldTopojson) return [] as { d: string; id: string }[]
    const topo = worldTopojson as Topology
    const countries = feature(topo, topo.objects.countries as never) as unknown as {
      features: { id: string; geometry: unknown }[]
    }
    return countries.features
      .map((f) => ({
        d: pathGen(f as never) || '',
        id: f.id || '',
      }))
      .filter((p) => p.d)
  }, [worldTopojson, pathGen])

  // Country borders mesh
  const borderPath = useMemo(() => {
    if (!worldTopojson) return ''
    const topo = worldTopojson as Topology
    const borderMesh = mesh(topo, topo.objects.countries as never, (a: unknown, b: unknown) => a !== b)
    return pathGen(borderMesh as never) || ''
  }, [worldTopojson, pathGen])

  // Flat map points
  const flatPoints = useMemo<FlatPoint[]>(() => {
    return points.map((p) => {
      const projected = projection([p.lng, p.lat])
      if (!projected) return null
      return {
        x: projected[0],
        y: projected[1],
        size: 3 + Math.min(p.users * 0.8, 8),
        color: p.color,
        strokeColor: p.color.replace(')', ',0.3)').replace('rgb(', 'rgba('),
        label: p.label,
        users: p.users,
      }
    }).filter((p): p is FlatPoint => p !== null)
  }, [points, projection])

  // Server marker on flat map
  const flatServerPoint = useMemo(() => {
    if (!serverLocation.lat && !serverLocation.lng) return null
    const projected = projection([serverLocation.lng, serverLocation.lat])
    if (!projected) return null
    return { x: projected[0], y: projected[1] }
  }, [serverLocation, projection])

  // Flat map arcs — great circle interpolation (same as Crucix)
  const flatArcs = useMemo<FlatArc[]>(() => {
    return allArcs.map((arc) => {
      const interpolator = geoInterpolate(
        [arc.startLng, arc.startLat],
        [arc.endLng, arc.endLat],
      )
      const coords: [number, number][] = []
      for (let k = 0; k <= 40; k++) {
        coords.push(interpolator(k / 40) as [number, number])
      }
      const feature = {
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: coords },
      }
      return {
        d: pathGen(feature as never) || '',
        stroke: arc.color[0],
        width: Math.max(0.8, arc.stroke * 2),
        label: arc.label,
      }
    }).filter((a) => a.d)
  }, [allArcs, pathGen])

  // Map legend items
  const legendItems = useMemo(
    () => [
      { color: '#64f0c8', label: 'Active Users' },
      { color: '#44ccff', label: 'High Traffic' },
      { color: '#ff6b6b', label: 'Server' },
      { color: 'rgba(100,240,200,0.5)', label: 'Routes' },
    ],
    [],
  )

  const mapZoom = useCallback(
    (factor: number) => {
      if (isFlat) {
        setFlatScale((prev) => Math.min(8, Math.max(1, prev * factor)))
        return
      }
      const globe = globeRef.current
      if (!globe) return
      const pov = globe.pointOfView()
      const altitude = typeof pov.altitude === 'number' ? pov.altitude : 2.3
      const nextAltitude = Math.min(4.5, Math.max(0.55, altitude / factor))
      globe.pointOfView({ ...pov, altitude: nextAltitude }, 600)
    },
    [isFlat],
  )

  // Initialize 3D globe
  useEffect(() => {
    if (!containerRef.current || initRef.current) return
    initRef.current = true

    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight || 560

    const globe = new GlobeGL(container)
      .width(w)
      .height(h)
      .globeImageUrl('//unpkg.com/three-globe@2.33.0/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe@2.33.0/example/img/earth-topology.png')
      .backgroundImageUrl('')
      .backgroundColor('rgba(0,0,0,0)')
      .atmosphereColor('#64f0c8')
      .atmosphereAltitude(0.18)
      .showGraticules(true)
      .pointAltitude(() => 0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointLabel((d: object) => {
        const p = d as GlobePoint
        return `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;background:rgba(6,14,22,0.92);border:1px solid rgba(100,240,200,0.3);padding:6px 10px;backdrop-filter:blur(12px)">
          <b style="color:#64f0c8">${p.label}</b><br/>
          <span style="color:#6a8a82">${p.users} active user${p.users > 1 ? 's' : ''}</span>
        </div>`
      })
      .onPointHover((pt: object | null) => {
        container.style.cursor = pt ? 'pointer' : 'grab'
      })
      .ringColor(() => (t: number) => `rgba(100,240,200,${1 - t})`)
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(2000)
      .arcColor((d: object) => (d as GlobeArc).color)
      .arcStroke((d: object) => (d as GlobeArc).stroke)
      .arcDashLength(0.4)
      .arcDashGap(0.25)
      .arcDashAnimateTime(2200)
      .arcAltitudeAutoScale(0.35)
      .arcLabel((d: object) => (d as GlobeArc).label)

    globeRef.current = globe

    const scene = globe.scene()
    const renderer = globe.renderer()
    renderer.setClearColor(0x000000, 0)

    // Stars
    const starGeom = new THREE.BufferGeometry()
    const starVerts: number[] = []
    for (let i = 0; i < 2000; i++) {
      const r = 800 + Math.random() * 200
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starVerts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      )
    }
    starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
    const starMat = new THREE.PointsMaterial({ color: 0x88bbaa, size: 0.8, transparent: true, opacity: 0.6 })
    scene.add(new THREE.Points(starGeom, starMat))

    // Graticule color
    scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Line).isLine) {
        const mat = (obj as THREE.Line).material as THREE.LineBasicMaterial
        if (mat.color) {
          mat.color.set(0x1a3a2a)
          mat.opacity = 0.3
          mat.transparent = true
        }
      }
    })

    // Controls
    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controls.enableDamping = true
    controls.dampingFactor = 0.1

    let rotateTimeout: ReturnType<typeof setTimeout>
    const handleMouseDown = () => {
      controls.autoRotate = false
      clearTimeout(rotateTimeout)
    }
    const handleMouseUp = () => {
      rotateTimeout = setTimeout(() => {
        controls.autoRotate = true
      }, 10000)
    }
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseup', handleMouseUp)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width && height) globe.width(width).height(height)
      }
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(rotateTimeout)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseup', handleMouseUp)
      if (globeRef.current) {
        const r = globeRef.current.renderer()
        r.dispose()
        const canvas = container.querySelector('canvas')
        if (canvas && canvas.parentNode === container) container.removeChild(canvas)
      }
      globeRef.current = null
      initRef.current = false
    }
  }, [])

  // Fetch world topojson (same source as Crucix)
  useEffect(() => {
    let cancelled = false
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setWorldTopojson(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Track wrapper size for flat map
  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width)
        const h = Math.max(1, entry.contentRect.height)
        setFlatSize({ width: w, height: h })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Update globe data
  useEffect(() => {
    if (!globeRef.current) return
    const serverPoint: GlobePoint | null = (serverLocation.lat || serverLocation.lng)
      ? { lat: serverLocation.lat, lng: serverLocation.lng, size: 0.35, color: '#ff6b6b', label: `${serverLocation.city}, ${serverLocation.country} (Server)`, users: 0 }
      : null
    const allPoints = serverPoint ? [...points, serverPoint] : points
    globeRef.current.pointsData(allPoints)
    const ringPoints = [
      ...points.filter((p) => p.users > 5).map((p) => ({ lat: p.lat, lng: p.lng })),
      ...(serverPoint ? [{ lat: serverPoint.lat, lng: serverPoint.lng }] : []),
    ]
    globeRef.current.ringsData(ringPoints)
    globeRef.current.arcsData(flightsVisible ? allArcs : [])
  }, [points, flightsVisible, allArcs, serverLocation])

  // Toggle auto-rotate in flat mode
  useEffect(() => {
    if (!globeRef.current) return
    globeRef.current.controls().autoRotate = !isFlat
  }, [isFlat])

  const resetFlatView = useCallback(() => {
    setFlatScale(1)
    setFlatOffset({ x: 0, y: 0 })
  }, [])

  const handleFlatPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isFlat) return
      dragRef.current = { active: true, x: event.clientX, y: event.clientY }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [isFlat],
  )

  const handleFlatPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isFlat || !dragRef.current.active) return
      const dx = event.clientX - dragRef.current.x
      const dy = event.clientY - dragRef.current.y
      dragRef.current = { active: true, x: event.clientX, y: event.clientY }
      setFlatOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    },
    [isFlat],
  )

  const handleFlatPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const handleFlatWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (!isFlat) return
      event.preventDefault()
      const factor = event.deltaY < 0 ? 1.12 : 0.9
      setFlatScale((prev) => Math.min(8, Math.max(1, prev * factor)))
    },
    [isFlat],
  )

  return (
    <div
      ref={wrapperRef}
      className="w-full min-h-[480px] flex-1 border border-border relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(4,12,20,1), rgba(2,4,8,1))',
      }}
    >
      {/* 3D Globe */}
      <div
        ref={containerRef}
        className={`absolute inset-0 cursor-grab active:cursor-grabbing ${isFlat ? 'hidden' : 'block'}`}
      />

      {/* Flat Map */}
      <div
        className={`absolute inset-0 ${isFlat ? 'block cursor-grab active:cursor-grabbing' : 'hidden'}`}
        onPointerDown={handleFlatPointerDown}
        onPointerMove={handleFlatPointerMove}
        onPointerUp={handleFlatPointerUp}
        onPointerLeave={handleFlatPointerUp}
        onWheel={handleFlatWheel}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${flatSize.width} ${flatSize.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${flatOffset.x}px, ${flatOffset.y}px) scale(${flatScale})`,
            transformOrigin: '50% 50%',
          }}
        >
          <defs>
            {/* Glow filter for markers */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Dash animation for corridors */}
            <style>{`
              .corridor-flow {
                stroke-dasharray: 8 4;
                animation: dash-flow 2s linear infinite;
              }
              @keyframes dash-flow { to { stroke-dashoffset: -24; } }
              .land-path:hover { fill: rgba(100,240,200,0.08); }
            `}</style>
          </defs>

          {/* Graticule */}
          <path
            d={graticulePath}
            fill="none"
            stroke="rgba(100,240,200,0.04)"
            strokeWidth={0.4}
          />

          {/* Land masses */}
          {landPaths.map((land, idx) => (
            <path
              key={`land-${idx}`}
              className="land-path"
              d={land.d}
              fill="rgba(180,200,210,0.08)"
              stroke="rgba(200,220,230,0.15)"
              strokeWidth={0.5}
              style={{ transition: 'fill 0.2s' }}
            />
          ))}

          {/* Country borders */}
          {borderPath && (
            <path
              d={borderPath}
              fill="none"
              stroke="rgba(200,220,230,0.08)"
              strokeWidth={0.3}
            />
          )}

          {/* Flight corridors — great circle paths with dash animation */}
          {flightsVisible &&
            flatArcs.map((arc, idx) => (
              <path
                key={`arc-${idx}`}
                className="corridor-flow"
                d={arc.d}
                fill="none"
                stroke={arc.stroke}
                strokeWidth={arc.width}
                opacity={0.6}
              >
                <title>{arc.label}</title>
              </path>
            ))}

          {/* User location markers with glow */}
          {flatPoints.map((p, idx) => (
            <g key={`pt-${idx}`} filter="url(#glow)">
              {/* Outer stroke circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill={p.color}
                stroke={p.strokeColor}
                strokeWidth={0.8}
                opacity={0.85}
              />
              {/* Inner bright core */}
              <circle cx={p.x} cy={p.y} r={p.size * 0.4} fill={p.color} opacity={1} />
              <title>{`${p.label}: ${p.users} active users`}</title>
            </g>
          ))}

          {/* Server location marker */}
          {flatServerPoint && (
            <g filter="url(#glow)">
              <circle
                cx={flatServerPoint.x}
                cy={flatServerPoint.y}
                r={6}
                fill="none"
                stroke="#ff6b6b"
                strokeWidth={1.5}
                opacity={0.8}
              />
              <circle
                cx={flatServerPoint.x}
                cy={flatServerPoint.y}
                r={3}
                fill="#ff6b6b"
                opacity={1}
              />
              <title>{`${serverLocation.city}, ${serverLocation.country} (Server)`}</title>
            </g>
          )}
        </svg>
      </div>

      {/* Map hint — top right */}
      <div className="absolute top-2 right-3 z-20 pointer-events-none font-mono text-[9px] tracking-[0.05em] text-dim opacity-60">
        {isFlat ? 'SCROLL TO ZOOM · DRAG TO PAN' : 'DRAG TO ROTATE · SCROLL TO ZOOM'}
      </div>

      {/* Map controls — top left */}
      <div className="absolute top-2 left-3 z-20 flex items-start gap-1.5">
        <div className="flex flex-col gap-1">
          {/* Zoom in */}
          <button
            type="button"
            onClick={() => mapZoom(1.5)}
            title="Zoom in"
            className="map-ctrl-btn"
            style={ctrlBtnStyle}
            onMouseEnter={ctrlBtnHoverIn}
            onMouseLeave={ctrlBtnHoverOut}
          >
            +
          </button>
          {/* Zoom out */}
          <button
            type="button"
            onClick={() => mapZoom(0.67)}
            title="Zoom out"
            className="map-ctrl-btn"
            style={ctrlBtnStyle}
            onMouseEnter={ctrlBtnHoverIn}
            onMouseLeave={ctrlBtnHoverOut}
          >
            &#8722;
          </button>
          {/* Flight toggle */}
          <button
            type="button"
            onClick={() => setFlightsVisible((v) => !v)}
            title="Toggle flight routes"
            className="map-ctrl-btn"
            style={{
              ...ctrlBtnStyle,
              fontSize: '14px',
              opacity: flightsVisible ? 1 : 0.4,
            }}
            onMouseEnter={ctrlBtnHoverIn}
            onMouseLeave={ctrlBtnHoverOut}
          >
            &#9992;
          </button>
        </div>
        {/* Mode toggle */}
        <button
          type="button"
          onClick={() => {
            setIsFlat((prev) => !prev)
            if (!isFlat) resetFlatView()
          }}
          className="map-ctrl-btn"
          style={{ ...ctrlBtnStyle, width: 'auto', padding: '0 10px', fontSize: '10px', letterSpacing: '0.1em' }}
          onMouseEnter={ctrlBtnHoverIn}
          onMouseLeave={ctrlBtnHoverOut}
        >
          {isFlat ? 'GLOBE MODE' : 'FLAT MODE'}
        </button>
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-2.5 left-3 z-20 flex gap-3.5 pointer-events-none font-mono text-[10px] text-dim tracking-[0.06em] uppercase flex-wrap">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-[5px]">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.color, boxShadow: `0 0 4px ${item.color}` }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// Shared button style (matches Crucix .map-ctrl-btn)
const ctrlBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: '1px solid var(--color-border)',
  background: 'rgba(0,0,0,0.6)',
  color: 'var(--color-dim)',
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
  fontFamily: 'var(--font-mono)',
  transition: 'all 0.2s',
}

function ctrlBtnHoverIn(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = '#64f0c8'
  e.currentTarget.style.borderColor = 'rgba(100,240,200,0.3)'
  e.currentTarget.style.background = 'rgba(100,240,200,0.06)'
}

function ctrlBtnHoverOut(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = 'var(--color-dim)'
  e.currentTarget.style.borderColor = 'var(--color-border)'
  e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
}

export default memo(GlobeComponent)

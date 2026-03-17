import { useEffect, useRef, memo, useCallback, useState } from 'react'
import GlobeGL from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import * as THREE from 'three'
import type { GlobePoint } from '../../types/analytics'

interface GlobeProps {
  points: GlobePoint[]
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

function buildFlightArcs(points: GlobePoint[]): GlobeArc[] {
  const hubs = [...points].sort((a, b) => b.users - a.users).slice(0, 8)
  const arcs: GlobeArc[] = []

  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const from = hubs[i]
      const to = hubs[j]
      const traffic = from.users + to.users
      if (traffic < 4) continue

      arcs.push({
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        color: traffic > 20
          ? ['rgba(68,204,255,0.65)', 'rgba(68,204,255,0.1)']
          : ['rgba(100,240,200,0.5)', 'rgba(100,240,200,0.08)'],
        stroke: Math.max(0.25, Math.min(1.2, traffic / 40)),
        label: `${from.label} ↔ ${to.label}: ${traffic} active users`,
      })
    }
  }

  return arcs
}

function GlobeComponent({ points }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const initRef = useRef(false)
  const [flightsVisible, setFlightsVisible] = useState(true)

  const mapZoom = useCallback((factor: number) => {
    const globe = globeRef.current
    if (!globe) return

    const pov = globe.pointOfView()
    const altitude = typeof pov.altitude === 'number' ? pov.altitude : 2.3
    const nextAltitude = Math.min(4.5, Math.max(0.55, altitude / factor))
    globe.pointOfView({ ...pov, altitude: nextAltitude }, 600)
  }, [])

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
      // Points layer
      .pointAltitude(() => 0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointLabel(
        (d: object) => {
          const p = d as GlobePoint
          return `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;background:rgba(6,14,22,0.92);border:1px solid rgba(100,240,200,0.3);padding:6px 10px;backdrop-filter:blur(12px)">
            <b style="color:#64f0c8">${p.label}</b><br/>
            <span style="color:#6a8a82">${p.users} active user${p.users > 1 ? 's' : ''}</span>
          </div>`
        },
      )
      .onPointHover((pt: object | null) => {
        container.style.cursor = pt ? 'pointer' : 'grab'
      })
      // Rings layer (pulse effect)
      .ringColor(() => (t: number) => `rgba(100,240,200,${1 - t})`)
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(2000)
      // Arcs layer (flight corridors)
      .arcColor((d: object) => (d as GlobeArc).color)
      .arcStroke((d: object) => (d as GlobeArc).stroke)
      .arcDashLength(0.4)
      .arcDashGap(0.25)
      .arcDashAnimateTime(2200)
      .arcAltitudeAutoScale(0.35)
      .arcLabel((d: object) => (d as GlobeArc).label)

    globeRef.current = globe

    // Scene customization
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
    const starMat = new THREE.PointsMaterial({
      color: 0x88bbaa,
      size: 0.8,
      transparent: true,
      opacity: 0.6,
    })
    scene.add(new THREE.Points(starGeom, starMat))

    // Graticule color
    scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Line).isLine) {
        const line = obj as THREE.Line
        const mat = line.material as THREE.LineBasicMaterial
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

    // Pause auto-rotate on interaction
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

    // Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width && height) {
          globe.width(width).height(height)
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(rotateTimeout)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseup', handleMouseUp)
      if (globeRef.current) {
        // Clean up Three.js renderer
        const r = globeRef.current.renderer()
        r.dispose()
        // Remove canvas safely
        const canvas = container.querySelector('canvas')
        if (canvas && canvas.parentNode === container) {
          container.removeChild(canvas)
        }
      }
      globeRef.current = null
      initRef.current = false
    }
  }, [])

  // Update globe layers when data or controls change
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointsData(points)

      // Add ring pulses for top locations
      const topPoints = points
        .filter((p) => p.users > 5)
        .map((p) => ({ lat: p.lat, lng: p.lng }))
      globeRef.current.ringsData(topPoints)

      globeRef.current.arcsData(flightsVisible ? buildFlightArcs(points) : [])
    }
  }, [points, flightsVisible])

  return (
    <div
      className="w-full min-h-[480px] flex-1 border border-border relative overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(4,12,20,1), rgba(2,4,8,1))',
      }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none border border-[#1a3a2a] bg-black/45 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-[#6a8a82]">
        SCROLL TO ZOOM · DRAG TO PAN
      </div>

      <div className="absolute top-2.5 left-2.5 z-20 flex items-start gap-1.5">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => mapZoom(1.5)}
            title="Zoom in"
            className="h-7 w-7 border border-[#1a3a2a] bg-black/60 font-mono text-base leading-none text-[#6a8a82] transition-all hover:border-[#2f6b52] hover:text-[#64f0c8]"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => mapZoom(0.67)}
            title="Zoom out"
            className="h-7 w-7 border border-[#1a3a2a] bg-black/60 font-mono text-base leading-none text-[#6a8a82] transition-all hover:border-[#2f6b52] hover:text-[#64f0c8]"
          >
            &minus;
          </button>
          <button
            type="button"
            onClick={() => setFlightsVisible((v) => !v)}
            title="Toggle flight routes"
            className={`h-7 w-7 border bg-black/60 font-mono text-[11px] transition-all hover:border-[#2f6b52] hover:text-[#64f0c8] ${
              flightsVisible
                ? 'border-[#1a3a2a] text-[#6a8a82]'
                : 'border-[#1a3a2a] text-[#6a8a82] opacity-40'
            }`}
          >
            &#9992;
          </button>
        </div>
        <button
          type="button"
          className="h-7 border border-[#1a3a2a] bg-black/60 px-2.5 font-mono text-[10px] tracking-[0.1em] text-[#6a8a82]"
        >
          GLOBE MODE
        </button>
      </div>

      <div className="absolute right-2.5 bottom-2.5 z-20 pointer-events-none border border-[#1a3a2a] bg-black/45 px-2 py-1 font-mono text-[10px] tracking-[0.07em] text-[#6a8a82]">
        ZOOM: + / &minus; · FLIGHTS: ✈ TOGGLE
      </div>
    </div>
  )
}

export default memo(GlobeComponent)

import { useEffect, useRef, memo } from 'react'
import GlobeGL from 'globe.gl'
import type { GlobeInstance } from 'globe.gl'
import * as THREE from 'three'
import type { GlobePoint } from '../../types/analytics'

interface GlobeProps {
  points: GlobePoint[]
}

function GlobeComponent({ points }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const initRef = useRef(false)

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
      // Rings layer (pulse effect)
      .ringColor(() => (t: number) => `rgba(100,240,200,${1 - t})`)
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(2000)

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
    container.addEventListener('mousedown', () => {
      controls.autoRotate = false
      clearTimeout(rotateTimeout)
    })
    container.addEventListener('mouseup', () => {
      rotateTimeout = setTimeout(() => {
        controls.autoRotate = true
      }, 10000)
    })

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

  // Update points data when props change
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointsData(points)

      // Add ring pulses for top locations
      const topPoints = points
        .filter((p) => p.users > 5)
        .map((p) => ({ lat: p.lat, lng: p.lng }))
      globeRef.current.ringsData(topPoints)
    }
  }, [points])

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[480px] flex-1 border border-border relative overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(4,12,20,1), rgba(2,4,8,1))',
      }}
    />
  )
}

export default memo(GlobeComponent)

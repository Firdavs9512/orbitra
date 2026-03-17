import { useEffect, useRef, useState } from 'react'

interface ActiveUsersCounterProps {
  count: number
  previousCount: number
}

export default function ActiveUsersCounter({ count, previousCount }: ActiveUsersCounterProps) {
  const [displayCount, setDisplayCount] = useState(count)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const start = displayCount
    const end = count
    if (start === end) return

    const duration = 500
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = Math.round(start + (end - start) * eased)

      setDisplayCount(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const delta = count - previousCount
  const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : ''
  const deltaColor = delta > 0 ? 'text-accent' : delta < 0 ? 'text-danger' : ''

  return (
    <div
      className="border border-border p-5 relative overflow-hidden"
      style={{
        background: 'rgba(10, 20, 32, 0.55)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(100,240,200,0.15), transparent)',
        }}
      />

      {/* LIVE badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full bg-accent"
          style={{
            boxShadow: '0 0 8px rgba(100, 240, 200, 0.6)',
            animation: 'pulse-blink 1.5s ease-in-out infinite',
          }}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
          Live
        </span>
      </div>

      {/* Counter */}
      <div className="flex items-baseline gap-3">
        <span
          className="font-mono text-4xl font-bold text-accent"
          style={{ textShadow: '0 0 20px rgba(100, 240, 200, 0.3)' }}
        >
          {displayCount.toLocaleString()}
        </span>
        {deltaText && (
          <span className={`font-mono text-sm font-semibold ${deltaColor}`}>{deltaText}</span>
        )}
      </div>

      {/* Label */}
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim mt-2">
        Active Users
      </div>
    </div>
  )
}

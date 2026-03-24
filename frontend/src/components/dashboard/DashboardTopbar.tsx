import { useState, useEffect, useCallback } from 'react'

interface DashboardTopbarProps {
  isConnected?: boolean
  activeUsers?: number
}

export default function DashboardTopbar({ isConnected = true, activeUsers }: DashboardTopbarProps) {
  const [time, setTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })

  return (
    <div
      className="flex items-center justify-between px-5 py-3 border border-border"
      style={{
        background: 'rgba(6, 14, 22, 0.82)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-[14px] font-bold tracking-[0.12em] uppercase text-accent">
          Orbitra
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 border border-border text-dim">
          Analytics
        </span>
      </div>

      {/* Center: Clock */}
      <div className="hidden md:flex items-center gap-3">
        <span className="font-mono text-[11px] text-dim tracking-[0.06em]">{formatDate(time)}</span>
        <span className="font-mono text-[13px] font-medium text-text tracking-[0.08em]">
          {formatTime(time)}
        </span>
        <span className="font-mono text-[10px] text-dim">UTC{time.getTimezoneOffset() <= 0 ? '+' : '-'}{Math.abs(Math.floor(time.getTimezoneOffset() / 60))}</span>
      </div>

      {/* Right: Status + Controls */}
      <div className="flex items-center gap-4">
        {activeUsers !== undefined && (
          <div className="font-mono text-[11px] text-dim px-2.5 py-1 border border-border">
            Users <span className="text-text font-medium">{activeUsers.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-danger'}`}
            style={{
              boxShadow: isConnected
                ? '0 0 8px rgba(100, 240, 200, 0.6)'
                : '0 0 8px rgba(255, 95, 99, 0.6)',
              animation: 'pulse-blink 1.5s ease-in-out infinite',
            }}
          />
          <span className={`font-mono text-[9px] uppercase tracking-[0.14em] ${isConnected ? 'text-accent' : 'text-danger'}`}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 flex items-center justify-center text-dim hover:text-accent border border-border hover:border-accent/40 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {isFullscreen ? (
              <>
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="3" y1="21" x2="10" y2="14" />
                <line x1="21" y1="3" x2="14" y2="10" />
              </>
            ) : (
              <>
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  )
}

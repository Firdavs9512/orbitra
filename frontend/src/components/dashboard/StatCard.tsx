interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ label, value, subtext, trend }: StatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-danger' : 'text-dim'
  const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''

  return (
    <div
      className="border border-border p-4 relative overflow-hidden"
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
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-dim mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-xl font-semibold text-text">{value}</span>
        {trendIcon && (
          <span className={`font-mono text-[10px] ${trendColor}`}>{trendIcon}</span>
        )}
      </div>
      {subtext && (
        <div className={`font-mono text-[9px] mt-1 ${trendColor}`}>{subtext}</div>
      )}
    </div>
  )
}

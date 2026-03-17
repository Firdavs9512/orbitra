import type { PageStats } from '../../types/analytics'

interface TopPagesProps {
  pages: PageStats[]
}

export default function TopPages({ pages }: TopPagesProps) {
  const maxUsers = Math.max(...pages.map((p) => p.activeUsers), 1)

  return (
    <div
      className="border border-border relative overflow-hidden"
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
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">
          Top Pages
        </h3>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent"
          style={{ animation: 'pulse-blink 1.5s ease-in-out infinite' }}
        >
          Live
        </span>
      </div>
      <div className="p-2">
        {pages.map((page) => (
          <div
            key={page.path}
            className="flex items-center justify-between py-2 px-2 border-b border-[rgba(255,255,255,0.04)] last:border-0"
          >
            <div className="flex-1 min-w-0 mr-3">
              <div className="text-[11px] font-medium text-text truncate">{page.path}</div>
              <div className="relative h-[3px] mt-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(page.activeUsers / maxUsers) * 100}%`,
                    background: 'linear-gradient(90deg, #64f0c8, #44ccff)',
                  }}
                />
              </div>
            </div>
            <span className="font-mono text-[12px] font-semibold text-accent flex-shrink-0">
              {page.activeUsers}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

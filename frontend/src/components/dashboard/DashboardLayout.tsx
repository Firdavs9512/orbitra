interface DashboardLayoutProps {
  topbar: React.ReactNode
  sidebar: React.ReactNode
  main: React.ReactNode
  rightRail?: React.ReactNode
}

export default function DashboardLayout({ topbar, sidebar, main, rightRail }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      {/* Background effects */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(40,120,100,0.08), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(40,100,180,0.05), transparent 40%)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(100,240,200,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(100,240,200,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
        }}
      />

      {/* Layout */}
      <div className="relative z-10 p-2.5 flex flex-col h-screen">
        {/* Topbar */}
        {topbar}

        {/* Body */}
        <div
          className="flex-1 mt-2.5 gap-2.5 min-h-0"
          style={{
            display: 'grid',
            gridTemplateColumns: rightRail ? '56px 1fr 340px' : '56px 1fr',
          }}
        >
          {/* Sidebar */}
          <div className="min-h-0">{sidebar}</div>

          {/* Main content */}
          <div className="flex flex-col gap-2.5 min-h-0">
            {main}
          </div>

          {/* Right rail */}
          {rightRail && (
            <div className="flex flex-col gap-2.5 min-h-0 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(100,240,200,0.15) transparent',
            }}>
              {rightRail}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

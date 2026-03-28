import ScrollReveal from './ScrollReveal'

export default function DashboardPreview() {
  return (
    <section id="preview" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Dashboard
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-text mt-3">
            See your data come <span className="text-accent">alive</span>
          </h2>
          <p className="text-dim mt-4 max-w-xl mx-auto">
            Real-time analytics with a stunning 3D globe and glass-morphism interface.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div
            className="mt-16 rounded-xl border border-border overflow-hidden"
            style={{
              background: 'rgba(6, 14, 22, 0.82)',
              boxShadow: '0 0 60px rgba(100, 240, 200, 0.06)',
            }}
          >
            {/* Topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-accent">
                  ORBITRA
                </span>
                <span className="font-mono text-[9px] tracking-wider text-dim uppercase">
                  Intelligence Dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-blink" />
                <span className="font-mono text-[10px] text-dim">LIVE</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Active Users', value: '1,247', trend: '+12%' },
                  { label: 'Pageviews / 24h', value: '48.3K', trend: '+8%' },
                  { label: 'Avg. Session', value: '3m 24s', trend: '+5%' },
                  { label: 'Bounce Rate', value: '32.1%', trend: '-3%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border p-3"
                    style={{ background: 'rgba(10, 20, 32, 0.55)' }}
                  >
                    <div className="font-mono text-[9px] uppercase tracking-wider text-dim">
                      {stat.label}
                    </div>
                    <div className="font-mono text-xl font-bold text-text mt-1">
                      {stat.value}
                    </div>
                    <div
                      className={`font-mono text-[10px] mt-1 ${
                        stat.trend.startsWith('+')
                          ? 'text-accent'
                          : 'text-danger'
                      }`}
                    >
                      {stat.trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Globe + Activity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Globe placeholder */}
                <div
                  className="md:col-span-2 rounded-lg border border-border p-6 flex items-center justify-center min-h-[240px] relative overflow-hidden"
                  style={{ background: 'rgba(10, 20, 32, 0.55)' }}
                >
                  <div
                    className="w-40 h-40 sm:w-52 sm:h-52 rounded-full relative"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 35%, rgba(100, 240, 200, 0.12), rgba(68, 204, 255, 0.06), transparent 70%)',
                      border: '1px solid rgba(100, 240, 200, 0.1)',
                      boxShadow: '0 0 40px rgba(100, 240, 200, 0.05)',
                    }}
                  >
                    {/* Grid lines on globe */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundImage: `
                          linear-gradient(0deg, transparent 48%, rgba(100,240,200,0.06) 49%, rgba(100,240,200,0.06) 51%, transparent 52%),
                          linear-gradient(90deg, transparent 48%, rgba(100,240,200,0.06) 49%, rgba(100,240,200,0.06) 51%, transparent 52%)
                        `,
                        backgroundSize: '33% 33%',
                      }}
                    />
                    {/* Dots */}
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-accent top-[25%] left-[40%] animate-float" />
                    <div className="absolute w-1 h-1 rounded-full bg-accent2 top-[55%] left-[65%] animate-float" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute w-1 h-1 rounded-full bg-accent top-[40%] left-[25%] animate-float" style={{ animationDelay: '1s' }} />
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-warn top-[70%] left-[45%] animate-float" style={{ animationDelay: '1.5s' }} />
                  </div>
                  <div className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-wider text-dim">
                    Real-time Globe View
                  </div>
                </div>

                {/* Activity */}
                <div
                  className="rounded-lg border border-border p-4"
                  style={{ background: 'rgba(10, 20, 32, 0.55)' }}
                >
                  <div className="font-mono text-[9px] uppercase tracking-wider text-dim mb-3">
                    Recent Activity
                  </div>
                  <div className="space-y-3">
                    {[
                      { path: '/pricing', country: 'US', time: '2s ago' },
                      { path: '/docs/api', country: 'DE', time: '5s ago' },
                      { path: '/blog/launch', country: 'JP', time: '8s ago' },
                      { path: '/', country: 'UK', time: '12s ago' },
                      { path: '/features', country: 'BR', time: '15s ago' },
                      { path: '/dashboard', country: 'FR', time: '21s ago' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-accent" />
                          <span className="font-mono text-text/80">
                            {item.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-dim text-[10px]">
                            {item.country}
                          </span>
                          <span className="font-mono text-dim/50 text-[10px]">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

import { Check, X } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const rows = [
  { feature: 'Privacy', orbitra: 'No cookies, GDPR compliant', ga: 'Requires consent banner' },
  { feature: 'Data Ownership', orbitra: 'Your server, your data', ga: "Google's servers" },
  { feature: 'Script Size', orbitra: '2 KB', ga: '45 KB+' },
  { feature: 'Cookies', orbitra: 'None', ga: 'Multiple tracking cookies' },
  { feature: 'Self-Hosted', orbitra: true, ga: false },
  { feature: 'Real-Time Globe', orbitra: true, ga: false },
  { feature: 'Open Source', orbitra: true, ga: false },
  { feature: 'Cost', orbitra: 'Free forever', ga: 'Free tier with limits' },
]

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={16} className="text-accent" />
    ) : (
      <X size={16} className="text-danger" />
    )
  }
  return <span>{value}</span>
}

export default function Comparison() {
  return (
    <section id="comparison" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Compare
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-text mt-3">
            Orbitra vs <span className="text-dim">Google Analytics</span>
          </h2>
          <p className="text-dim mt-4 max-w-xl mx-auto">
            See why developers are switching to privacy-first analytics.
          </p>
        </ScrollReveal>

        {/* Desktop Table */}
        <ScrollReveal delay={150}>
          <div
            className="hidden md:block mt-16 rounded-xl border border-border overflow-hidden"
            style={{
              background: 'rgba(10, 20, 32, 0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div className="grid grid-cols-3 border-b border-border">
              <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-wider text-dim">
                Feature
              </div>
              <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-wider text-accent text-center">
                Orbitra
              </div>
              <div className="px-6 py-4 font-mono text-[10px] uppercase tracking-wider text-dim text-center">
                Google Analytics
              </div>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="px-6 py-4 font-mono text-sm text-text">
                  {row.feature}
                </div>
                <div className="px-6 py-4 text-sm text-text flex items-center justify-center">
                  <CellValue value={row.orbitra} />
                </div>
                <div className="px-6 py-4 text-sm text-dim flex items-center justify-center">
                  <CellValue value={row.ga} />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Mobile Cards */}
        <div className="md:hidden mt-12 space-y-3">
          {rows.map((row, i) => (
            <ScrollReveal key={row.feature} delay={i * 50}>
              <div
                className="rounded-lg border border-border p-4"
                style={{ background: 'rgba(10, 20, 32, 0.55)' }}
              >
                <div className="font-mono text-xs font-semibold text-text mb-3">
                  {row.feature}
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase text-accent">
                      Orbitra
                    </span>
                    <span className="text-text">
                      <CellValue value={row.orbitra} />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase text-dim">
                      GA
                    </span>
                    <span className="text-dim">
                      <CellValue value={row.ga} />
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

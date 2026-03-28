import { Star } from 'lucide-react'
import { GitHubIcon } from './icons'
import ScrollReveal from './ScrollReveal'

export default function OpenSource() {
  return (
    <section id="open-source" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-border mb-6" style={{ background: 'rgba(10, 20, 32, 0.55)' }}>
            <GitHubIcon size={28} className="text-accent" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent block">
            Community
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-text mt-3">
            Built in the <span className="text-accent">open</span>
          </h2>
          <p className="text-dim mt-4 max-w-xl mx-auto">
            Orbitra is fully open source. Inspect the code, contribute features,
            or self-host with confidence.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-lg sm:max-w-2xl mx-auto">
            {[
              { value: '100%', label: 'Open Source' },
              { value: 'Apache 2.0', label: 'Licensed' },
              { value: 'Community', label: 'Driven' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border p-6"
                style={{ background: 'rgba(10, 20, 32, 0.55)' }}
              >
                <div className="font-mono text-2xl font-bold text-accent">
                  {stat.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-dim mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="https://github.com/Firdavs9512/orbitra"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(100,240,200,0.3)] transition-all"
            >
              <Star size={16} />
              Star on GitHub
            </a>
            <a
              href="https://github.com/Firdavs9512/orbitra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-lg border border-border text-dim hover:text-accent hover:border-border-bright transition-colors font-mono text-sm"
            >
              View Source
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

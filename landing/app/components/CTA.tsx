import { ArrowRight } from 'lucide-react'
import { GitHubIcon } from './icons'
import ScrollReveal from './ScrollReveal'

export default function CTA() {
  return (
    <section className="relative py-32 px-4 sm:px-6">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(100,240,200,0.04), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-sans text-3xl md:text-5xl font-bold text-text leading-tight">
            Ready to take control of{' '}
            <span className="text-accent">your analytics</span>?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="text-lg text-dim mt-6 max-w-xl mx-auto">
            Deploy Orbitra in minutes. Own your data. Respect your users.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="https://app.orbitra.sh"
              className="group flex items-center gap-2 px-10 py-5 rounded-lg bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(100,240,200,0.3)] transition-all"
            >
              Get Started Free
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="https://github.com/Firdavs9512/orbitra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-10 py-5 rounded-lg border border-border text-dim hover:text-accent hover:border-border-bright transition-colors font-mono text-sm"
            >
              <GitHubIcon size={16} />
              View on GitHub
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

import { ArrowRight } from 'lucide-react'
import { GitHubIcon } from './icons'
import AnimatedBackground from './AnimatedBackground'
import ScrollReveal from './ScrollReveal'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16"
    >
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border font-mono text-[10px] uppercase tracking-[0.15em] text-dim mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-blink" />
            Open Source Web Analytics
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-text leading-[1.1] tracking-tight">
            Analytics that respect{' '}
            <br className="hidden sm:block" />
            <span className="text-accent">your users</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-base sm:text-lg md:text-xl text-dim max-w-2xl mx-auto mt-6 leading-relaxed">
            Self-hosted, privacy-first web analytics with real-time 3D globe
            visualization. No cookies. No tracking. Just insights.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="https://app.orbitra.sh"
              className="group flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-bg font-mono text-sm font-semibold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(100,240,200,0.3)] transition-all"
            >
              Get Started
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="https://github.com/Firdavs9512/orbitra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-lg border border-border text-dim hover:text-accent hover:border-border-bright transition-colors font-mono text-sm"
            >
              <GitHubIcon size={16} />
              View on GitHub
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="mt-12 inline-block text-left">
            <div className="px-5 py-4 rounded-lg border border-border font-mono text-xs text-dim" style={{ background: 'rgba(6, 14, 22, 0.82)' }}>
              <span className="text-dim/60 select-none">&lt;</span>
              <span className="text-accent2">script</span>
              <span className="text-dim/60"> src</span>
              <span className="text-dim/60">=</span>
              <span className="text-accent">&quot;https://app.orbitra.sh/track.js&quot;</span>
              <span className="text-dim/60"> /&gt;</span>
              <span className="block mt-1 text-dim/40">{'// '}2KB &middot; No cookies &middot; GDPR ready</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

import { Code, BarChart3, Zap } from 'lucide-react'
import GlassCard from './GlassCard'
import ScrollReveal from './ScrollReveal'

const steps = [
  {
    num: '01',
    icon: <Code size={24} />,
    title: 'Add Script',
    description: 'Add a single script tag to your website. Just one line of code.',
    code: `<script\n  defer\n  src="https://app.orbitra.sh/track.js"\n  data-domain="yoursite.com"\n/>`,
  },
  {
    num: '02',
    icon: <Zap size={24} />,
    title: 'Track Events',
    description:
      'Automatic pageview tracking starts instantly. Add custom events via our REST API.',
    code: null,
  },
  {
    num: '03',
    icon: <BarChart3 size={24} />,
    title: 'Analyze Data',
    description:
      'Open your real-time dashboard. See visitors on a 3D globe, track top pages, and more.',
    code: null,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Integration
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-text mt-3">
            Up and running in{' '}
            <span className="text-accent">minutes</span>
          </h2>
          <p className="text-dim mt-4 max-w-xl mx-auto">
            Three simple steps to privacy-friendly analytics.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 120}>
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-2xl font-bold text-accent/30">
                    {step.num}
                  </span>
                  <div className="text-accent">{step.icon}</div>
                </div>
                <h3 className="font-sans text-xl font-semibold text-text">
                  {step.title}
                </h3>
                <p className="text-sm text-dim mt-2 leading-relaxed">
                  {step.description}
                </p>
                {step.code && (
                  <div
                    className="mt-4 rounded-lg border border-border p-3 font-mono text-[11px] text-accent2 leading-relaxed whitespace-pre"
                    style={{ background: 'rgba(2, 4, 8, 0.6)' }}
                  >
                    {step.code}
                  </div>
                )}
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import {
  Shield,
  Server,
  Globe,
  Feather,
  Code,
  Database,
  Palette,
  Terminal,
  Users,
} from 'lucide-react'
import FeatureCard from './FeatureCard'
import ScrollReveal from './ScrollReveal'

const features = [
  {
    icon: <Shield size={28} />,
    title: 'Privacy First',
    description:
      'No cookies, GDPR compliant, respects Do-Not-Track. Your users\' data stays private.',
  },
  {
    icon: <Server size={28} />,
    title: 'Self-Hosted',
    description:
      'Deploy on your own infrastructure. Full control over your data, no third-party access.',
  },
  {
    icon: <Globe size={28} />,
    title: 'Real-Time Globe',
    description:
      'Live 3D globe visualization with WebSocket-powered instant updates.',
  },
  {
    icon: <Feather size={28} />,
    title: 'Lightweight',
    description:
      '2KB tracking script. Zero impact on your site\'s performance and loading speed.',
  },
  {
    icon: <Code size={28} />,
    title: 'Open Source',
    description:
      'Fully transparent codebase. Audit, modify, and contribute to the project.',
  },
  {
    icon: <Database size={28} />,
    title: 'Flexible Storage',
    description:
      'SQLite for small sites, ClickHouse for millions of events. Choose what fits.',
  },
  {
    icon: <Palette size={28} />,
    title: 'Beautiful UX',
    description:
      'Interactive 3D globe, glass-morphism design. Analytics that look stunning.',
  },
  {
    icon: <Terminal size={28} />,
    title: 'Full REST API',
    description:
      'Programmatic access to all your analytics data for custom integrations.',
  },
  {
    icon: <Users size={28} />,
    title: 'Multi-User',
    description:
      'Team collaboration with role-based access control. Admin and viewer roles.',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Features
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-text mt-3">
            Everything you need,{' '}
            <span className="text-accent">nothing you don&apos;t</span>
          </h2>
          <p className="text-dim mt-4 max-w-xl mx-auto">
            Built for developers who care about privacy and performance.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 60}>
              <FeatureCard {...feature} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

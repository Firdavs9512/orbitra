import GlassCard from './GlassCard'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <GlassCard hover className="p-6 group">
      <div className="text-accent">{icon}</div>
      <h3 className="font-sans text-lg font-semibold text-text mt-4">
        {title}
      </h3>
      <p className="text-sm text-dim mt-2 leading-relaxed">{description}</p>
    </GlassCard>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-border ${hover ? "hover:border-border-bright transition-colors" : ""} ${className}`}
      style={{
        background: "rgba(10, 20, 32, 0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(100,240,200,0.15), transparent)",
        }}
      />
      {children}
    </div>
  )
}

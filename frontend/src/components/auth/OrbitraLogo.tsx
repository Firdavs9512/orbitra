export default function OrbitraLogo() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo ring */}
      <div className="relative w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center">
        {/* Outer spinning ring */}
        <div
          className="absolute inset-[-6px] rounded-full border border-border"
          style={{
            borderTopColor: 'var(--color-accent)',
            animation: 'spin 2s linear infinite',
          }}
        />
        {/* Inner reverse spinning ring */}
        <div
          className="absolute inset-[-12px] rounded-full"
          style={{
            border: '1px solid rgba(100,240,200,0.06)',
            borderBottomColor: 'rgba(100,240,200,0.15)',
            animation: 'spin 3s linear infinite reverse',
          }}
        />
        {/* Center circle */}
        <div
          className="w-full h-full rounded-full border border-border flex items-center justify-center"
          style={{ background: 'rgba(6,14,22,0.6)' }}
        >
          <span className="font-mono text-[9px] sm:text-[8px] font-bold tracking-[0.2em] text-accent">
            ORB
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1">
        <h1 className="font-mono text-lg font-bold tracking-[0.25em] text-accent">
          ORBITRA
        </h1>
        <p className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
          Intelligence Dashboard
        </p>
      </div>
    </div>
  )
}

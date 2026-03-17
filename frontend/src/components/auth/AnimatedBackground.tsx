export default function AnimatedBackground() {
  return (
    <>
      {/* Radial gradient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(40,120,100,0.15), transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(40,100,180,0.08), transparent 40%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,240,200,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,240,200,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
        }}
      />

      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 w-full h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(100,240,200,0.12), transparent)',
            animation: 'scanMove 4s linear infinite',
          }}
        />
      </div>
    </>
  )
}

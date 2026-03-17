interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  type?: 'submit' | 'button'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}: ButtonProps) {
  const base =
    'w-full font-mono text-[11px] uppercase tracking-[0.08em] px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer border'

  const variants = {
    primary: `
      bg-accent text-[#03140d] border-accent font-semibold
      hover:shadow-[0_0_20px_rgba(100,240,200,0.3)] hover:-translate-y-0.5
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0
    `,
    ghost: `
      bg-transparent border-border text-dim
      hover:text-accent hover:border-accent
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

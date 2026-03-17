import AnimatedBackground from './AnimatedBackground'
import OrbitraLogo from './OrbitraLogo'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <OrbitraLogo />
        {children}
      </div>
    </div>
  )
}

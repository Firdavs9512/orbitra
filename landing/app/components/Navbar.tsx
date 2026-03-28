import MobileNav from './MobileNav'
import { GitHubIcon } from './icons'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Preview', href: '#preview' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Compare', href: '#comparison' },
  { label: 'Open Source', href: '#open-source' },
]

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border"
      style={{
        background: 'rgba(2, 4, 8, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-mono text-lg font-bold tracking-[0.25em] text-accent uppercase">
          Orbitra
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-wider text-dim hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/Firdavs9512/orbitra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-dim hover:text-accent hover:border-border-bright transition-colors font-mono text-xs"
          >
            <GitHubIcon size={14} />
            GitHub
          </a>
          <a
            href="https://app.orbitra.sh"
            className="px-5 py-2 rounded-lg bg-accent text-bg font-mono text-xs font-semibold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(100,240,200,0.3)] transition-all"
          >
            Get Started
          </a>
        </div>

        <MobileNav links={navLinks} />
      </div>
    </nav>
  )
}

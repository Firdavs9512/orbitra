'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { GitHubIcon } from './icons'

interface MobileNavProps {
  links: { label: string; href: string }[]
}

export default function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-dim hover:text-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'rgba(2, 4, 8, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <span className="font-mono text-lg font-bold tracking-[0.25em] text-accent uppercase">
              Orbitra
            </span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-dim hover:text-accent transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-wider text-dim hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="flex flex-col gap-3 mt-4 w-48">
              <a
                href="https://github.com/Firdavs9512/orbitra"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-dim hover:text-accent hover:border-border-bright transition-colors font-mono text-xs"
              >
                <GitHubIcon size={14} />
                GitHub
              </a>
              <a
                href="https://app.orbitra.sh"
                onClick={() => setOpen(false)}
                className="text-center px-4 py-3 rounded-lg bg-accent text-bg font-mono text-xs font-semibold uppercase tracking-wider"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

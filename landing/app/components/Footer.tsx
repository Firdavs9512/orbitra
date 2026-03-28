export default function Footer() {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Dashboard', href: '#preview' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Compare', href: '#comparison' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'GitHub', href: 'https://github.com/Firdavs9512/orbitra' },
        { label: 'Contributing', href: 'https://github.com/Firdavs9512/orbitra/blob/master/CONTRIBUTING.md' },
        { label: 'Issues', href: 'https://github.com/Firdavs9512/orbitra/issues' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Apache 2.0 License', href: 'https://github.com/Firdavs9512/orbitra/blob/master/LICENSE' },
      ],
    },
  ]

  return (
    <footer className="border-t border-border py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="font-mono text-lg font-bold tracking-[0.25em] text-accent uppercase">
              Orbitra
            </span>
            <p className="text-sm text-dim mt-3 leading-relaxed">
              Open-source, self-hosted web analytics. Privacy-first, real-time, beautiful.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-text font-semibold mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="font-mono text-xs text-dim hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] text-dim">
            &copy; {new Date().getFullYear()} Orbitra. All rights reserved.
          </span>
          <span className="font-mono text-[10px] text-dim">
            Made with care for the open-source community
          </span>
        </div>
      </div>
    </footer>
  )
}

import type { CountryStats } from '../../types/analytics'

interface UsersByCountryProps {
  countries: CountryStats[]
}

function countryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

export default function UsersByCountry({ countries }: UsersByCountryProps) {
  const maxUsers = Math.max(...countries.map((c) => c.users), 1)

  return (
    <div
      className="border border-border relative overflow-hidden"
      style={{
        background: 'rgba(10, 20, 32, 0.55)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(100,240,200,0.15), transparent)',
        }}
      />
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">
          Users by Country
        </h3>
        <span className="font-mono text-[10px] px-2 py-0.5 border border-border text-dim">
          Top 10
        </span>
      </div>
      <div className="p-2">
        {countries.map((country) => (
          <div
            key={country.countryCode}
            className="flex items-center gap-2.5 py-2 px-2 border-b border-[rgba(255,255,255,0.04)] last:border-0"
          >
            <span className="text-sm flex-shrink-0">{countryFlag(country.countryCode)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-text truncate">{country.country}</span>
                <span className="font-mono text-[11px] text-accent flex-shrink-0 ml-2">
                  {country.users} <span className="text-dim text-[9px]">({country.percentage}%)</span>
                </span>
              </div>
              <div className="relative h-[2px] rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-accent"
                  style={{ width: `${(country.users / maxUsers) * 100}%`, opacity: 0.7 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

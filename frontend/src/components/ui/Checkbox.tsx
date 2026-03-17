interface CheckboxProps {
  label: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center
            ${checked
              ? 'bg-accent border-accent'
              : 'bg-transparent border-border group-hover:border-dim'
            }
          `}
        >
          {checked && (
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              className="text-[#03140d]"
            >
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-dim font-sans">{label}</span>
    </label>
  )
}

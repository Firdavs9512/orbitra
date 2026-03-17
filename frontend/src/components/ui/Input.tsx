interface InputProps {
  label: string
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  placeholder?: string
}

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'current-password' : 'on'}
        className={`
          w-full bg-transparent border rounded-lg px-3 py-2.5 text-sm text-text font-sans
          outline-none transition-all duration-200
          placeholder:text-dim/50
          ${error
            ? 'border-danger'
            : 'border-border focus:border-accent focus:shadow-[0_0_10px_rgba(100,240,200,0.15)]'
          }
        `}
      />
      {error && (
        <span className="font-mono text-[10px] text-danger tracking-wider">
          {error}
        </span>
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'

interface ValidationRules {
  required?: boolean
  minLength?: number
  pattern?: { value: RegExp; message: string }
  match?: { field: string; message: string }
}

type RulesMap<T> = Partial<Record<keyof T, ValidationRules>>
type ErrorsMap<T> = Partial<Record<keyof T, string>>

export default function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: RulesMap<T>,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ErrorsMap<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = useCallback(
    (name: keyof T, value: string, allValues: T): string | null => {
      const fieldRules = rules[name]
      if (!fieldRules) return null

      if (fieldRules.required && !value.trim()) {
        return 'This field is required'
      }
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        return `Minimum ${fieldRules.minLength} characters`
      }
      if (fieldRules.pattern && !fieldRules.pattern.value.test(value)) {
        return fieldRules.pattern.message
      }
      if (fieldRules.match && value !== allValues[fieldRules.match.field as keyof T]) {
        return fieldRules.match.message
      }
      return null
    },
    [rules],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      const newValues = { ...values, [name]: value }
      setValues(newValues as T)

      if (touched[name as keyof T]) {
        const error = validateField(name as keyof T, value, newValues as T)
        setErrors((prev) => ({ ...prev, [name]: error || undefined }))
      }
    },
    [values, touched, validateField],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name as keyof T, value, values)
      setErrors((prev) => ({ ...prev, [name]: error || undefined }))
    },
    [values, validateField],
  )

  const validate = useCallback((): boolean => {
    const newErrors: ErrorsMap<T> = {}
    let isValid = true

    for (const key of Object.keys(rules) as Array<keyof T>) {
      const error = validateField(key, values[key], values)
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    setTouched(
      Object.keys(rules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>,
      ),
    )
    return isValid
  }, [rules, values, validateField])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, handleChange, handleBlur, validate, resetForm }
}

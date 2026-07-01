'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'

interface SlugInputProps {
  value: string
  domain: string
  onChange: (value: string) => void
}

export function SlugInput({ value, domain, onChange }: SlugInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (!value) {
      setIsAvailable(null)
      return
    }

    const checkAvailability = async () => {
      setIsChecking(true)
      try {
        const res = await fetch(`/api/redirects/check/${value}?domain=${domain}`)
        const data = await res.json()
        setIsAvailable(data.available)
      } catch (error) {
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    const timer = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="relative">
      <div className="flex items-center border border-[var(--color-blue-surface)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-cyan-accent)] focus-within:border-transparent transition-all">
        <span className="bg-[var(--color-blue-main)] text-slate-500 px-4 py-3 border-r border-[var(--color-blue-surface)] font-mono text-sm whitespace-nowrap">
          {domain}/
        </span>
        <input
          suppressHydrationWarning
          type="text"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 focus:outline-none text-slate-900"
          placeholder="new-event"
        />
        <div className="pr-4 flex items-center justify-center w-8">
          {isChecking ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : value ? (
            isAvailable ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )
          ) : null}
        </div>
      </div>
      {value && isAvailable === false && (
        <p className="mt-2 text-sm text-red-500">This slug is already in use.</p>
      )}
    </div>
  )
}

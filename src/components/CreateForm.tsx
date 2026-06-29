'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { SlugInput } from './SlugInput'
import { Loader2, Plus, ChevronDown, Check } from 'lucide-react'

export function CreateForm({ domains, defaultDomain, onCreated }: { domains: string[], defaultDomain: string, onCreated?: () => void }) {
  const [domain, setDomain] = useState(defaultDomain)
  const [pendingDomain, setPendingDomain] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [destination, setDestination] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDomainChange = (newDomain: string) => {
    if (newDomain !== 'cecieee.org') {
      setPendingDomain(newDomain)
    } else {
      setDomain(newDomain)
    }
  }

  const confirmDomainChange = () => {
    if (pendingDomain) {
      setDomain(pendingDomain)
      setPendingDomain(null)
    }
  }

  const cancelDomainChange = () => {
    setPendingDomain(null)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!slug || !destination) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/redirects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          slug,
          destination,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create redirect')
      }

      setSlug('')
      setDestination('')
      if (onCreated) {
        onCreated()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-blue-surface)] p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Create New Redirect</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Domain
          </label>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-blue-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-accent)] focus:border-transparent transition-all bg-white text-slate-900 flex justify-between items-center text-left"
          >
            <span className="truncate">
              {(pendingDomain || domain) === 'cecieee.org' ? `${pendingDomain || domain} (Main)` : pendingDomain || domain}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
              <ul className="absolute z-50 w-full mt-2 bg-white border border-[var(--color-blue-surface)] rounded-xl shadow-lg max-h-60 overflow-auto py-1 ring-1 ring-black/5">
                {domains.map(d => (
                  <li
                    key={d}
                    onClick={() => {
                      handleDomainChange(d)
                      setIsDropdownOpen(false)
                    }}
                    className={`px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-[var(--color-blue-main)] transition-colors ${
                      (pendingDomain || domain) === d ? 'text-[var(--color-blue-primary)] bg-[var(--color-blue-main)] font-medium' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{d === 'cecieee.org' ? `${d} (Main)` : d}</span>
                    {(pendingDomain || domain) === d && <Check className="w-4 h-4" />}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Target URL (Destination)
          </label>
          <input
            suppressHydrationWarning
            type="url"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-blue-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-accent)] focus:border-transparent transition-all text-slate-900"
            placeholder="https://docs.google.com/forms/d/e/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Custom Path (Slug)
          </label>
          <SlugInput value={slug} domain={domain} onChange={setSlug} />
        </div>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={isLoading || !slug || !destination}
          className="w-full bg-[var(--color-blue-primary)] text-white py-3 rounded-xl font-medium hover:bg-[#007f92] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan-accent)] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#009eb5]/30"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Create Redirect
            </>
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      {pendingDomain && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Confirm Domain Change</h3>
            <p className="text-slate-600 mb-6">
              You are selecting <strong>{pendingDomain}</strong>. This is different from the main cecieee.org domain. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                suppressHydrationWarning
                onClick={cancelDomainChange}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                onClick={confirmDomainChange}
                className="flex-1 bg-[var(--color-blue-primary)] text-white py-2.5 rounded-xl font-medium hover:bg-[#007f92] transition-colors"
              >
                Yes, Change Domain
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

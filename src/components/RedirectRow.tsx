'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Trash2, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Redirect {
  domain: string
  path: string
  dest: string
  user_email?: string
}

export function RedirectRow({ redirect, currentUserEmail }: { redirect: Redirect, currentUserEmail?: string }) {
  const adminEmails = ['alwinsaji4.cgnr@gmail.com', 'webmastercecieee@gmail.com']
  const isAdmin = currentUserEmail ? adminEmails.includes(currentUserEmail) : false
  const isCreator = currentUserEmail && redirect.user_email ? currentUserEmail === redirect.user_email : false
  const canDelete = isAdmin || isCreator
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  
  const fullUrl = `https://${redirect.domain}${redirect.path}`
  // Clean up the path from regex to a normal slug
  const displaySlug = redirect.path.replace(/^\^?\/|\/\?\$|\/$/g, '')
  const cleanUrl = `https://${redirect.domain}/${displaySlug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/redirects/${displaySlug}?domain=${redirect.domain}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (error) {
      console.error(error)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--color-blue-surface)] hover:bg-[var(--color-blue-main)] transition-colors group">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-slate-900 truncate">{redirect.domain}/{displaySlug}</span>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-[var(--color-blue-primary)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <div className="text-sm text-slate-500 truncate flex items-center">
          <span className="mr-2 text-slate-400">→</span>
          <a href={redirect.dest} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
            {redirect.dest}
          </a>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopy}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-[var(--color-blue-surface)] rounded-lg transition-all"
          title="Copy URL"
          suppressHydrationWarning
        >
          {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        </button>

        {canDelete ? (
          showConfirm ? (
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-lg">
              <span className="text-sm text-red-600 font-medium mr-2">Confirm?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 font-medium"
                suppressHydrationWarning
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="text-slate-500 hover:text-slate-700 font-medium"
                suppressHydrationWarning
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete Redirect"
              suppressHydrationWarning
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )
        ) : (
          <div className="w-9 h-9" title="You don't have permission to delete this redirect" />
        )}
      </div>
    </div>
  )
}

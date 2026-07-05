import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Determine the correct origin
  let origin = requestUrl.origin
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const host = request.headers.get('host')

  if (forwardedHost) {
    origin = `${forwardedProto || 'https'}://${forwardedHost}`
  } else if (host) {
    const protocol = request.url.startsWith('https') || forwardedProto === 'https' ? 'https' : 'http'
    origin = `${protocol}://${host}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}

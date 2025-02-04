import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ログインページにいる場合は、既にログインしていればホームページにリダイレクト
  if (req.nextUrl.pathname === '/auth/login') {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return res
  }

  // ログインページ以外にいる場合は、ログインしていなければログインページにリダイレクト
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
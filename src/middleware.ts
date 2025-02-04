import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証不要のパス
  const publicPaths = ['/auth/login', '/auth/send-email', '/auth/reset-password']
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)

  // 認証不要のページにいる場合
  if (isPublicPath) {
    // ログイン済みの場合はホームページにリダイレクト（ログインページの場合のみ）
    if (session && req.nextUrl.pathname === '/auth/login') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return res
  }

  // 認証が必要なページで未ログインの場合はログインページにリダイレクト
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
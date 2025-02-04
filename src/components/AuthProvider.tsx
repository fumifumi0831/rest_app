'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/auth-helpers-nextjs'

export default function AuthProvider() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getSession()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // 認証ページでは何も表示しない
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">休養管理アプリ</h1>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span>{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <a
                href="/auth/login"
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                ログイン
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@/types'

export default function AuthProvider() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) setUser(session.user)
    }

    getSession()
  }, [supabase])

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">休養管理アプリ</h1>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span>{user.email}</span>
                <a
                  href="/auth/logout"
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  ログアウト
                </a>
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

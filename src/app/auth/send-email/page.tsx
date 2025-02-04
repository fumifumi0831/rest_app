'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SendEmail() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。')
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">パスワードをリセット</h1>
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? '送信中...' : 'リセットメールを送信'}
            </button>
            <Link
              href="/auth/login"
              className="text-center text-sm text-blue-600 hover:text-blue-800"
            >
              ログインページに戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

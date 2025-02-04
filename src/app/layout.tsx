import { Inter } from 'next/font/google'
import '@/app/globals.css'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '休養管理アプリ',
  description: '疲労と休養を記録・管理するアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider />
        {children}
      </body>
    </html>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { FatigueRecord, RestRecord } from '@/types'

export default function Home() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [fatigueLevel, setFatigueLevel] = useState<number>(3)
  const [mood, setMood] = useState<string>('')
  const [restType, setRestType] = useState<string>('')
  const [activity, setActivity] = useState<string>('')
  const [satisfactionLevel, setSatisfactionLevel] = useState<number>(3)
  const [feedback, setFeedback] = useState<string>('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
    }

    getUser()
  }, [supabase, router])

  const recordFatigue = async () => {
    if (!user) return

    const { error } = await supabase
      .from('fatigue_records')
      .insert([
        {
          user_id: user.id,
          fatigue_level: fatigueLevel,
          mood: mood,
        },
      ])

    if (error) {
      console.error('Error recording fatigue:', error)
      return
    }

    alert('疲労記録を保存しました')
    setMood('')
  }

  const recordRest = async () => {
    if (!user) return

    const { error } = await supabase
      .from('rest_records')
      .insert([
        {
          user_id: user.id,
          rest_type: restType,
          activity: activity,
          satisfaction_level: satisfactionLevel,
          feedback: feedback,
        },
      ])

    if (error) {
      console.error('Error recording rest:', error)
      return
    }

    alert('休養記録を保存しました')
    setActivity('')
    setFeedback('')
  }

  if (!user) {
    return null // ログインページにリダイレクトされるまで何も表示しない
  }

  return (
    <main className="min-h-screen p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">疲労記録</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">疲労レベル (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center">{fatigueLevel}</div>
            </div>
            <div>
              <label className="block mb-2">気分</label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              onClick={recordFatigue}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              記録する
            </button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">休養記録</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">休養タイプ</label>
              <select
                value={restType}
                onChange={(e) => setRestType(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">選択してください</option>
                <option value="運動">運動</option>
                <option value="栄養">栄養</option>
                <option value="造形">造形</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">活動内容</label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">満足度 (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={satisfactionLevel}
                onChange={(e) => setSatisfactionLevel(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center">{satisfactionLevel}</div>
            </div>
            <div>
              <label className="block mb-2">フィードバック</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border p-2 rounded"
                rows={3}
              />
            </div>
            <button
              onClick={recordRest}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              記録する
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

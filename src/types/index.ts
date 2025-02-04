export type User = {
  id: string
  username: string
  created_at: string
}

export type FatigueRecord = {
  id: string
  user_id: string
  fatigue_level: number
  mood: string
  recorded_at: string
}

export type RestRecord = {
  id: string
  user_id: string
  rest_type: string
  activity: string
  satisfaction_level?: number
  feedback?: string
  created_at: string
}

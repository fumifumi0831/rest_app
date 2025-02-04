export interface ApiLimit {
  id: string
  user_id: string
  requests_count: number
  last_reset: string
  daily_limit: number
  created_at: string
  updated_at: string
}

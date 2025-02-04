import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ApiLimit } from '@/types/api-limits'

export async function checkAndUpdateApiLimit(userId: string): Promise<{
  canMakeRequest: boolean
  remainingRequests: number
}> {
  const supabase = createClientComponentClient()

  try {
    // 現在の制限を取得
    const { data: limits, error: limitsError } = await supabase
      .from('api_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (limitsError) throw limitsError

    if (!limits) {
      throw new Error('API limits not found for user')
    }

    // 必要に応じてリセット
    await supabase.rpc('reset_api_requests_if_needed', {
      user_id: userId,
    })

    // 更新された制限を取得
    const { data: updatedLimits, error: updateError } = await supabase
      .from('api_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (updateError) throw updateError
    if (!updatedLimits) throw new Error('Failed to get updated limits')

    const limit = updatedLimits as ApiLimit
    const canMakeRequest = limit.requests_count < limit.daily_limit

    if (canMakeRequest) {
      // リクエストカウントを増やす
      await supabase
        .from('api_limits')
        .update({ requests_count: limit.requests_count + 1 })
        .eq('user_id', userId)
    }

    return {
      canMakeRequest,
      remainingRequests: Math.max(0, limit.daily_limit - limit.requests_count),
    }
  } catch (error) {
    console.error('Error checking API limits:', error)
    throw error
  }
}

export async function getRemainingRequests(userId: string): Promise<number> {
  const supabase = createClientComponentClient()

  try {
    const { data: limits, error } = await supabase
      .from('api_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!limits) return 0

    const limit = limits as ApiLimit
    return Math.max(0, limit.daily_limit - limit.requests_count)
  } catch (error) {
    console.error('Error getting remaining requests:', error)
    return 0
  }
}

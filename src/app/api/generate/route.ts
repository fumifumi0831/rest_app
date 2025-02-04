import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAndUpdateApiLimit } from '@/utils/api-limits'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // セッションの確認
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // APIリクエスト制限のチェック
    const { canMakeRequest, remainingRequests } = await checkAndUpdateApiLimit(
      session.user.id
    )

    if (!canMakeRequest) {
      return new NextResponse(
        JSON.stringify({
          error: '本日のAPIリクエスト制限に達しました。明日また試してください。',
          remainingRequests,
        }),
        { status: 429 }
      )
    }

    const body = await req.json()
    const { restType, duration, social } = body

    const prompt = `以下の条件に合う休養方法を提案してください：
- 休養の種類: ${restType}
- 所要時間: ${duration}分
- 社交性: ${social ? '他の人と一緒に' : '一人で'}

提案は以下の形式で返してください：
1. タイトル
2. 詳細な説明（200-300文字）
3. 期待される効果（箇条書き3つ）`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'あなたは休養とリラックスの専門家です。ユーザーの要望に合わせて、具体的で実行可能な休養方法を提案してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return NextResponse.json({
      content: completion.choices[0].message.content,
      remainingRequests,
    })
  } catch (error) {
    console.error('[GENERATE_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

'use client';

import { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { getRemainingRequests } from '@/utils/api-limits';

const REST_TYPES = [
  { id: 'sleep', name: '睡眠' },
  { id: 'nap', name: '昼寝' },
  { id: 'meditation', name: '瞑想' },
  { id: 'relaxation', name: 'リラックス' },
  { id: 'exercise', name: '軽い運動' },
  { id: 'reading', name: '読書' },
  { id: 'nature', name: '自然との触れ合い' }
];

const DURATIONS = [
  { id: '15', name: '15分' },
  { id: '30', name: '30分' },
  { id: '60', name: '60分' },
  { id: 'half_day', name: '半日' },
  { id: 'full_day', name: '1日' }
];

const SOCIAL_PREFERENCES = [
  { id: 'alone', name: '一人で過ごす' },
  { id: 'with_others', name: '誰かと過ごす' }
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedSocial, setSelectedSocial] = useState<string>('');
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);

  useEffect(() => {
    const loadRemainingRequests = async () => {
      const remaining = await getRemainingRequests();
      setRemainingRequests(remaining);
    }
    loadRemainingRequests()
  }, [])

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const getSuggestions = async () => {
    if (selectedTypes.length === 0) {
      alert('休養の種類を1つ以上選択してください');
      return;
    }

    if (!selectedDuration) {
      alert('所要時間を選択してください');
      return;
    }

    if (!selectedSocial) {
      alert('過ごし方を選択してください');
      return;
    }

    setLoading(true);
    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const selectedTypeNames = selectedTypes
        .map(id => REST_TYPES.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join('、');

      const durationName = DURATIONS.find(d => d.id === selectedDuration)?.name;
      const socialPreference = SOCIAL_PREFERENCES.find(s => s.id === selectedSocial)?.name;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "あなたは休養アドバイザーです。選択された条件に基づいて、具体的で実践的な休養プランを提案してください。"
          },
          {
            role: "user",
            content: `以下の条件で休養プランを提案してください：
            
            休養の種類：${selectedTypeNames}
            所要時間：${durationName}
            過ごし方：${socialPreference}
            
            提案には以下を含めてください：
            1. 選択された時間内での具体的な時間配分
            2. アクティビティの実施順序
            3. 期待される効果
            4. 実践する際のポイント
            
            箇条書きで読みやすく提案してください。また、選択された過ごし方（${socialPreference}）に適した提案内容にしてください。`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      setSuggestions(completion.choices[0].message.content || '');
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions('申し訳ありません。提案の取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">組み合わせたい休養を選択してください</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {REST_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeToggle(type.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedTypes.includes(type.id)
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm'
                      : 'border-gray-300 hover:border-indigo-500 hover:shadow-sm'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">所要時間を選択してください</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {DURATIONS.map(duration => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedDuration === duration.id
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm'
                      : 'border-gray-300 hover:border-indigo-500 hover:shadow-sm'
                  }`}
                >
                  {duration.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">過ごし方を選択してください</h2>
            <div className="grid grid-cols-2 gap-4">
              {SOCIAL_PREFERENCES.map(pref => (
                <button
                  key={pref.id}
                  onClick={() => setSelectedSocial(pref.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedSocial === pref.id
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm'
                      : 'border-gray-300 hover:border-indigo-500 hover:shadow-sm'
                  }`}
                >
                  {pref.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={getSuggestions}
            disabled={loading || remainingRequests === 0}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
              loading || remainingRequests === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? '提案を生成中...' : '休養プランを提案する'}
          </button>
        </div>
        {remainingRequests !== null && (
          <p className="mt-2 text-sm text-gray-600">
            本日の残りリクエスト回数: {remainingRequests}回
          </p>
        )}
      </div>

      {suggestions && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6">あなたへのおすすめ休養プラン</h2>
          <div className="prose prose-indigo max-w-none">
            {suggestions.split('\n').map((line, index) => {
              // 見出し（###）の処理
              if (line.startsWith('###')) {
                return (
                  <h3 key={index} className="text-lg font-semibold mt-6 mb-4">
                    {line.replace('###', '').trim()}
                  </h3>
                );
              }
              // 小見出し（**）の処理
              if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                return (
                  <h4 key={index} className="font-medium text-gray-900 mt-4 mb-2">
                    {line.replace(/\*\*/g, '').trim()}
                  </h4>
                );
              }
              // リスト項目の処理
              if (line.trim().startsWith('-')) {
                return (
                  <li key={index} className="ml-6 mb-1 text-gray-600">
                    {line.substring(1).trim()}
                  </li>
                );
              }
              // 数字付きリスト項目の処理
              if (/^\d+\./.test(line.trim())) {
                return (
                  <div key={index} className="ml-6 mb-4">
                    <strong className="text-gray-900">{line.trim()}</strong>
                  </div>
                );
              }
              // 空行の処理
              if (line.trim() === '') {
                return <div key={index} className="h-4" />;
              }
              // その他の通常のテキスト
              return (
                <p key={index} className="mb-2 text-gray-600">
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

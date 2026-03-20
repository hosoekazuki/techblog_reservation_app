// app/items/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState<any>(null)
  // 【追加】メモの内容を管理する状態
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      const { data } = await supabase
        .from('techblog_bookmark')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setItem(data)
        setMemo(data.memo || '') // DBに保存されているメモがあればセットする
      }
    }
    fetchItem()
  }, [id])

  // 【追加】保存ボタンを押した時の関数
  const handleSaveMemo = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('techblog_bookmark')
      .update({ memo: memo }) // memoカラムを、現在のmemo状態で更新
      .eq('id', id)          // このIDのデータだけを狙い撃ち

    if (error) {
      alert('保存に失敗しました')
    } else {
      alert('メモを保存しました！')
    }
    setSaving(false)
  }

  if (!item) return <p className="p-10">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 font-sans text-gray-900">
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">← 戻る</Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
        <p className="text-gray-600 leading-relaxed">{item.description}</p>
      </div>
      
      {/* メモ機能 */}
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>📝</span> 学習メモ
        </h2>
        <textarea 
          value={memo}
          onChange={(e) => setMemo(e.target.value)} // 入力するたびにmemo状態を更新
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-black min-h-[150px]"
          placeholder="この記事から学んだこと、後で読み返したいポイントをメモ..."
        />
        <button 
          onClick={handleSaveMemo}
          disabled={saving}
          className={`mt-4 w-full py-3 rounded-lg text-white font-bold transition ${
            saving ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {saving ? '保存中...' : 'メモを保存する'}
        </button>
      </div>
    </main>
  )
}
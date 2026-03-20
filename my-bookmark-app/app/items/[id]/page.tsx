// ============================================
// app/items/[id]/page.tsx
// ============================================
// 【ファイルの役割】
// 保存したブックマークの詳細ページ
// URL の [id] パラメータから、特定のブックマーク情報を取得して表示
// さらにメモ機能を提供し、その記事について学んだことを記録できる
//
// 【動的ルーティングについて】
// ファイル名の [id] は「動的なパラメータ」を意味する
// /items/1、/items/2、/items/3 のように、どの ID でアクセスしても
// 同じコンポーネントが使われ、id の値に応じてデータを切り替える

'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DetailPage() {
  // ===== URL パラメータ取得 =====
  // useParams: Next.js の hook で、URL から動的パラメータ（[id]）を取得
  // この場合、/items/123 なら id = "123" となる
  const { id } = useParams()
  
  // ===== 状態管理（State定義） =====
  // ブックマークの詳細データを保持
  const [item, setItem] = useState<any>(null)
  
  // 【追加】メモの内容を管理する状態
  // ユーザーがテキストエリアに入力したメモ内容をリアルタイムで保持
  const [memo, setMemo] = useState('')
  
  // メモ保存中かどうかのフラグ（ボタンの無効化に使用）
  const [saving, setSaving] = useState(false)

  // ===== データ取得処理 =====
  // useEffect: ページが初めて表示された時にブックマーク情報を取得
  // 依存配列 [id] により、id が変わった時も再実行される
  useEffect(() => {
    const fetchItem = async () => {
      // Supabase から、このページの ID に該当するブックマークを取得
      const { data } = await supabase
        .from('techblog_bookmark')
        .select('*')
        .eq('id', id)  // このページの ID と同じレコードを検索
        .single()      // 1件だけ取得（複数件返ってこないようにする）
      
      if (data) {
        setItem(data)  // 取得したデータを状態に保存（画面に表示される）
        setMemo(data.memo || '') // DBに保存されているメモがあればセットする
      }
    }
    fetchItem()
  }, [id])

  // ===== メモ保存処理 =====
  // 【追加】保存ボタンを押した時の関数
  // ユーザーが入力したメモ内容をSupabaseに保存する
  const handleSaveMemo = async () => {
    // UI 更新: 保存中フラグ ON（ボタンを無効化）
    setSaving(true)
    
    // Supabase の update メソッドを使用
    const { error } = await supabase
      .from('techblog_bookmark')
      .update({ memo: memo })  // memoカラムを、現在のmemo状態で更新
      .eq('id', id)            // このIDのデータだけを狙い撃ち

    // エラーハンドリング
    if (error) {
      alert('保存に失敗しました')
    } else {
      alert('メモを保存しました！')
    }
    
    // UI 更新: 保存中フラグ OFF（ボタンを有効化）
    setSaving(false)
  }

  // ===== ローディング状態の処理 =====
  // item が null（まだデータが取得されていない）の場合、読み込み中メッセージを表示
  if (!item) return <p className="p-10">読み込み中...</p>

  return (
    <main className="max-w-2xl mx-auto p-6 font-sans text-gray-900">
      {/* ===== 戻るリンク ===== */}
      {/* Link コンポーネント: トップページに戻るナビゲーション */}
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">← 戻る</Link>
      
      {/* ===== ブックマーク詳細情報表示 ===== */}
      <div className="mb-8">
        {/* 記事のタイトル: Supabase から取得したデータを表示 */}
        <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
        {/* 記事の説明文: Supabase から取得したデータを表示 */}
        <p className="text-gray-600 leading-relaxed">{item.description}</p>
      </div>
      
      {/* ===== メモ機能セクション ===== */}
      {/* このセクションがこのページの重要な機能！ */}
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
        {/* セクションタイトル */}
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>📝</span> 学習メモ
        </h2>
        
        {/* ===== メモ入力フィールド ===== */}
        {/* テキストエリア: ユーザーがメモを入力する場所 */}
        <textarea 
          value={memo}  // 現在のメモ状態を表示
          // ユーザーが入力するたびに setMemo で memo 状態を更新
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-black min-h-[150px]"
          placeholder="この記事から学んだこと、後で読み返したいポイントをメモ..."
        />
        
        {/* ===== メモ保存ボタン ===== */}
        <button 
          onClick={handleSaveMemo}  // クリックで handleSaveMemo 関数を実行して保存
          disabled={saving}  // saving が true の時、ボタンを無効化して複数回クリックを防ぐ
          className={`mt-4 w-full py-3 rounded-lg text-white font-bold transition ${
            saving ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {/* saving 状態で表示内容を切り替え */}
          {saving ? '保存中...' : 'メモを保存する'}
        </button>
      </div>
    </main>
  )
}
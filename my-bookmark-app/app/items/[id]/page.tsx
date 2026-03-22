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
import TagEditor from '@/components/TagEditor'
import DescriptionEditor from '@/components/DescriptionEditor'

export default function DetailPage() {
  // ===== URL パラメータ取得 =====
  // useParams: Next.js の hook で、URL から動的パラメータ（[id]）を取得
  // この場合、/items/123 なら id = "123" となる
  const { id } = useParams()
  
  // ===== 状態管理（State定義） =====
  // ブックマークの詳細データを保持
  const [item, setItem] = useState<any>(null)
  
  // メモの内容を管理する状態
  // ユーザーがテキストエリアに入力したメモ内容をリアルタイムで保持
  const [memo, setMemo] = useState('')

  // 説明文を編集するための状態
  const [description, setDescription] = useState('')
  
  // メモ保存中かどうかのフラグ（ボタンの無効化に使用）
  const [saving, setSaving] = useState(false)

  // 説明文保存中かどうかのフラグ
  const [savingDescription, setSavingDescription] = useState(false)
  
  // 【新規追加】評価（星）を管理する状態（1～5）
  // ユーザーが選択した星の数を保持
  const [rating, setRating] = useState(0)
  
  // 【新規追加】評価保存中かどうかのフラグ
  const [savingRating, setSavingRating] = useState(false)

  // 【新規追加】タグ管理
  // 現在のブックマークのタグを保持
  const [tag, setTag] = useState('その他')
  
  // タグ保存中かどうかのフラグ
  const [savingTag, setSavingTag] = useState(false)
  
  // 過去に使用したタグ一覧（ドロップダウン候補用）
  const [allTags, setAllTags] = useState<string[]>([])

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
        setDescription(data.description || '') // DBに保存されている説明文をセットする
        setRating(data.rating || 0) // DBに保存されている評価があればセットする
        setTag(data.tag || 'その他') // 【新規追加】DBに保存されているタグがあればセットする
      }

      // 【新規追加】すべてのブックマークを取得して、ユニークなタグを抽出
      // ドロップダウンで過去に使用したタグを候補として表示するため
      const { data: allBookmarks } = await supabase
        .from('techblog_bookmark')
        .select('tag')

      if (allBookmarks) {
        // null や空文字列を除外し、重複を削除してソート
        const uniqueTags = Array.from(
          new Set(allBookmarks.map(b => b.tag).filter(Boolean))
        ).sort()
        setAllTags(uniqueTags)
      }
    }
    fetchItem()
  }, [id])

  // ===== メモ保存処理 =====
  // 保存ボタンを押した時の関数
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

  // ===== 説明文保存処理 =====
  // ユーザーが編集した説明文を Supabase に保存する
  const handleSaveDescription = async () => {
    setSavingDescription(true)

    const { error } = await supabase
      .from('techblog_bookmark')
      .update({ description: description })
      .eq('id', id)

    if (error) {
      alert('説明文の保存に失敗しました')
    } else {
      // 一覧や画面の表示と状態がずれないように item も更新
      setItem({ ...item, description })
      alert('説明文を保存しました！')
    }

    setSavingDescription(false)
  }

  // ===== 【新規追加】評価保存処理 =====
  // 星をクリックして評価を変更し、すぐに Supabase に保存
  const handleSaveRating = async (newRating: number) => {
    setRating(newRating)  // まず UI を即座に更新
    setSavingRating(true)
    
    // Supabase に評価を保存
    const { error } = await supabase
      .from('techblog_bookmark')
      .update({ rating: newRating })  // ratingカラムを更新
      .eq('id', id)

    if (error) {
      alert('評価の保存に失敗しました')
      setRating(rating)  // エラー時は前の評価に戻す
    }
    
    setSavingRating(false)
  }

  // 【新規追加】タグ保存処理
  // タグが変更された時にローカル状態を更新
  const handleTagInput = (newTag: string) => {
    setTag(newTag)  // UI に即座に反映
  }

  // タグ入力フィールドからフォーカスが失われた時に、Supabase に保存
  const handleTagBlur = async () => {
    const tagValue = tag || 'その他'  // 空の場合はデフォルト値
    setSavingTag(true)

    // Supabase にタグを保存
    const { error } = await supabase
      .from('techblog_bookmark')
      .update({ tag: tagValue })  // tagカラムを更新
      .eq('id', id)

    if (error) {
      alert('タグの保存に失敗しました')
    }

    setSavingTag(false)
  }

  // ===== ローディング状態の処理 =====
  // item が null（まだデータが取得されていない）の場合、読み込み中メッセージを表示
  if (!item) return <p className="p-10">読み込み中...</p>

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ===== ヘッダー：戻るボタン ===== */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition">
            ← トップに戻る
          </Link>
        </div>
        
        {/* ===== 記事情報カード ===== */}
        <article className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* 記事のタイトル */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
            {item.title}
          </h1>
          
          <DescriptionEditor
            description={description}
            onDescriptionChange={setDescription}
            onSave={handleSaveDescription}
            saving={savingDescription}
          />
          
          {/* ===== 【新規追加】評価セクション ===== */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <span className="text-gray-600 font-semibold">この記事の評価:</span>
            <div className="flex gap-1">
              {/* 1～5つの星をクリック可能にしたボタンで表示 */}
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleSaveRating(star)}  // クリックで評価を保存
                  disabled={savingRating}
                  className="text-3xl transition transform hover:scale-110 disabled:opacity-50"
                >
                  {/* 現在の rating より小さい番号の星は黄色（塗りつぶし）、大きい番号の星はグレー（塗りなし） */}
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* 【新規追加】タグ編集セクション */}
          <TagEditor
            currentTag={tag}
            onTagInput={handleTagInput}
            onTagBlur={handleTagBlur}
            availableTags={allTags}
            saving={savingTag}
          />
        </article>

        {/* ===== メモ機能セクション ===== */}
        <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-8 mb-8 border border-amber-200">
          {/* セクションタイトル */}
          <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📝</span> 学習メモ
          </h2>
          
          {/* メモ入力フィールド */}
          <textarea 
            value={memo}  // 現在のメモ状態を表示
            onChange={(e) => setMemo(e.target.value)}  // 入力するたび memo 状態を更新
            className="w-full p-4 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-gray-800 bg-white min-h-[200px] resize-none"
            placeholder="この記事から学んだこと、後で読み返したいポイント、実装方法など自由にメモしましょう..."
          />
          
          {/* メモ保存ボタン */}
          <button 
            onClick={handleSaveMemo}  // クリックで handleSaveMemo 関数を実行
            disabled={saving}  // saving が true の時、ボタンを無効化
            className={`mt-4 w-full py-3 rounded-lg text-white font-bold transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
              saving ? 'bg-gray-400' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {saving ? '💾 保存中...' : '💾 メモを保存する'}
          </button>
        </section>

        {/* ===== 記事を開くボタン ===== */}
        <div className="text-center">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
          >
            🔗 元の記事を開く
          </a>
        </div>
      </div>
    </main>
  )
}
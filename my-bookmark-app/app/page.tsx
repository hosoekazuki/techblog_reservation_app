'use client';

// ============================================
// app/page.tsx
// ============================================
// 【ファイルの役割】
// このアプリのメインページ兼コントローラー
// 全ての状態管理（state）と処理ロジックはここに集中しており、
// 子コンポーネント（BookmarkForm, SearchBar, BookmarkItem）に UI の描画を指示します
// このアーキテクチャを「コンテナ・プレゼンテーショナル」パターンと呼びます

// ===== インポート =====
import { useState, useEffect } from 'react';  // React の基本機能
import { supabase } from '@/lib/supabase';  // Supabase データベースとの通信

// ===== 子コンポーネント（UI部品）のインポート =====
// これらのコンポーネントは、親（このファイル）から Props を受け取って UI を描画するだけ
import BookmarkForm from '@/components/BookmarkForm';  // URL 入力フォーム
import SearchBar from '@/components/SearchBar';  // 検索フィールド
import BookmarkItem from '@/components/BookmarkItem';  // 各ブックマーク表示カード

export default function Home() {
  // ===== 状態管理（State定義） =====
  // 以下の5つの状態で、このアプリの「今の状態」が決まる
  
  const [url, setUrl] = useState('');  // ユーザーが入力したURL
  const [loading, setLoading] = useState(false);  // データベース保存中かどうか（ボタン無効化に使用）
  const [bookmarks, setBookmarks] = useState<any[]>([]);  // Supabase から取得したブックマーク全体のリスト
  const [searchTerm, setSearchTerm] = useState('');  // 検索バーに入力された検索キーワード
  
  // 【新規追加】選択されているタグを管理する状態
  // ユーザーがタブボタンをクリックした時、ここに選択されたタグが保存される
  // null = 「すべて表示」、それ以外 = 選択タグのみ表示
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  
  // 【新規追加】存在するタグ一覧を管理する状態
  // ブックマークから重複なしでタグを抽出して保存
  const [allTags, setAllTags] = useState<string[]>([])
  
  // 【新規追加】保存時に入力されるタグを管理する状態
  // ユーザーが入力フォームで入力したタグ
  const [tag, setTag] = useState('その他')

  // ===== Supabase との通信処理 =====
  // 【関数】fetchBookmarks: データベースから全ブックマークを取得
  // 使用場所: ページ初期読み込み、保存後、削除後
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('techblog_bookmark')  // tech blog_bookmark テーブルから取得
      .select('*')  // 全カラムを取得
      .order('created_at', { ascending: false });  // 新しい順に並べる（降順）
    
    if (data) {
      setBookmarks(data);  // 取得したデータを state に保存
      
      // 【新規追加】タグ一覧を抽出
      // データの中から tag カラムの値を取り出して、重複を削除し、ソート
      const uniqueTags = Array.from(new Set(data.map(item => item.tag).filter(Boolean)))
        .sort();  // アルファベット順にソート
      setAllTags(uniqueTags);
    }
  };

  // 【関数】handleDelete: ブックマークを削除する
  // 削除前に確認ダイアログを表示、ユーザーが「OK」を押した時のみ削除
  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;  // キャンセル時は処理中断
    
    // Supabase で指定ID のレコードを削除
    await supabase.from('techblog_bookmark').delete().eq('id', id);
    
    // 削除後、最新のリストを再取得して画面を更新
    fetchBookmarks();
  };

  // 【関数】handleSave: ブックマークを新規保存する
  // ステップ: URL 入力 → API で情報抽出 → DB に保存 → 画面更新
  const handleSave = async () => {
    // バリデーション: URL が入力されているか確認
    if (!url) return alert('URLを入力してください');
    
    // UI 更新: 保存中フラグ ON（ボタンを無効化）
    setLoading(true);
    try {
      // ===== ステップ1: 自分たちの API (/api/extract) を呼ぶ =====
      // URL からタイトル・説明文を抽出してもらう
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();  // APIからの戻り値を JSON で取得
      
      // ===== ステップ2: Supabase にデータを保存 =====
      await supabase.from('techblog_bookmark').insert([{
        url,  // ユーザーが入力したURL
        title: data.title,  // API で抽出したタイトル
        description: data.description || '',  // API で抽出した説明文（なければ空文字）
        tag: tag  // 【新規追加】ユーザーが選択/入力したタグ
      }]);
      
      // ===== ステップ3: UI をリセット =====
      setUrl('');  // 入力フィールドをクリア
      setTag('その他');  // タグをデフォルトにリセット
      
      // ===== ステップ4: 画面を更新 =====
      fetchBookmarks();  // 最新のブックマーク一覧を再取得
    } finally {
      // UI 更新: 保存中フラグ OFF（ボタンを有効化）
      // finally は try でエラーが起きても実行される（必ず実行される）
      setLoading(false);
    }
  };

  // ===== 初期化処理 =====
  // useEffect: ページが初めてマウント（表示）された時だけ実行
  // 空の依存配列 [] により、マウント時の1回のみ実行
  useEffect(() => { 
    fetchBookmarks();  // ページ初期表示時にブックマーク一覧を読み込む
  }, []);

  // ===== フィルタリング処理 =====
  // 【関数】filteredBookmarks: 検索条件とタグに合わせてブックマーク一覧をフィルタリング
  // bookmarks 全体から、searchTerm と selectedTag に該当するものだけを抽出
  const filteredBookmarks = bookmarks.filter((item) => {
    // 検索を除外条件として使用
    const search = searchTerm.toLowerCase();  // 検索キーワードを小文字に統一（大文字小文字を区別しない）
    const matchesSearch = (
      item.title?.toLowerCase().includes(search)  // タイトルに一致
      || item.description?.toLowerCase().includes(search)  // または説明文に一致
    );
    
    // タグでフィルタリング
    // selectedTag が null の場合は「すべて表示」、それ以外は該当タグだけ表示
    const matchesTag = selectedTag === null || item.tag === selectedTag;
    
    // 検索とタグの両方に一致する場合のみ表示
    return matchesSearch && matchesTag;
  });

  return (
    // ===== UI（見た目）の描画部分 =====
    // 親の状態と関数を、子コンポーネント（子部品）に Props で渡す
    // 子コンポーネントは受け取った Props を使って UI を表示するだけ
    <div className="min-h-screen bg-gray-100 py-12 px-4 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto">
        
        {/* ===== 1. URL 入力フォーム部分 =====*/}
        {/* BookmarkForm に必要な Props を渡す */}
        <BookmarkForm 
          url={url}  // 現在入力されているURL
          setUrl={setUrl}  // URL を更新する関数
          onSave={handleSave}  // 保存ボタン押下時の関数
          loading={loading}  // 保存中かどうか
          // 【新規追加】タグ入力機能を追加
          tag={tag}  // 現在のタグ状態
          setTag={setTag}  // タグを更新する関数
          availableTags={allTags}  // 過去に使用したタグの一覧（ドロップダウン用）
        />

        {/* ===== 1.5 タグフィルター（新規追加）===== */}
        {/* タグボタンで表示内容を切り替える */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-600 mb-3">分類で絞り込み:</p>
          <div className="flex flex-wrap gap-2">
            {/* 「すべて表示」ボタン */}
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                selectedTag === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              すべて表示 ({bookmarks.length})
            </button>
            
            {/* 各タグのボタン */}
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  selectedTag === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t} ({bookmarks.filter(item => item.tag === t).length})
              </button>
            ))}
          </div>
        </div>

        {/* ===== 2. 検索バー部分 ===== */}
        {/* SearchBar に必要な Props を渡す */}
        <SearchBar 
          value={searchTerm}  // 現在の検索キーワード
          onChange={setSearchTerm}  // 検索キーワード更新関数
        />

        {/* ===== 3. ブックマーク一覧表示部分 ===== */}
        <div className="space-y-4">
          {/* filteredBookmarks の各アイテムに対して BookmarkItem をレンダリング */}
          {filteredBookmarks.map((item) => (
            <BookmarkItem 
              key={item.id}  // React の list レンダリング用（各要素を一意に識別）
              item={item}  // このブックマークデータ
              onDelete={handleDelete}  // 削除関数
            />
          ))}

          {/* ===== 検索結果が空の場合のメッセージ ===== */}
          {filteredBookmarks.length === 0 && (
            <p className="text-center text-gray-400 py-12">該当する記事はありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
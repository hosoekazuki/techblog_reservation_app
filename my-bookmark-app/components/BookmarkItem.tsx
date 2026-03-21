// ============================================
// components/BookmarkItem.tsx
// ============================================
// 【ファイルの役割】
// 保存済みの1つ1つのブックマークを表示するコンポーネント
// タイトル、説明、保存日、削除ボタンなどを表示します
// page.tsx から bookmarks の配列内の各アイテムに対して、このコンポーネントが何度も使われます

import Link from 'next/link';  // Next.js の Link コンポーネント（ページ遷移用）
// 【Props とは】
// 親からこのコンポーネントへ渡される情報
interface BookmarkItemProps {
  item: any;  // ブックマークの1つのデータ（title, description, created_at, url, id を含む）
              // 本来なら「any」ではなく細かい型定義をするべき（初心者向けなので「any」で簡略）
  onDelete: (id: number) => void;  // 削除ボタンをクリックした時に実行される関数
                                    // id（削除するアイテムのID）を親の handleDelete に渡す
}

// 【関数の説明】
// BookmarkItem コンポーネント: 1つのブックマークカードを描画する関数
export default function BookmarkItem({ item, onDelete }: BookmarkItemProps) {
  return (
    // ブックマークカード全体: 白い背景でカード風にデザイン
    <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition border-l-4 border-blue-500 flex justify-between items-start">
      {/* 左側: テキスト情報（タイトル、説明、日付） */}
      <div className="flex-1 pr-4">
        {/* 記事タイトル: リンクとしてURL 先に開く */}
        <Link href={`/items/${item.id}`} className="text-blue-600 hover:underline font-bold">
            {item.title}
        </Link>
        
        {/* 記事の説明文: 最大2行までで表示（line-clamp-2） */}
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
        
        {/* 保存日時を表示 */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-gray-400 text-xs">
            {/* 【改善】created_at を適切にフォーマットして表示 */}
            {/* item.created_at がISO形式（例："2024-03-21T10:30:00"）で返ってくるため、 */}
            {/* new Date() でJavaScriptの日付オブジェクトに変換してから表示形式を指定 */}
            📅 {item.created_at 
              ? new Date(item.created_at).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '日付不明'
            }
          </span>
        </div>
      </div>
      
      {/* 右側: 削除ボタン */}
      <button
        onClick={() => onDelete(item.id)}  // クリックで親の handleDelete を呼び出し、このアイテムのIDを渡す
        className="text-red-400 hover:text-red-600 p-1 transition"
      >
        {/* ゴミ箱アイコンを SVG（スケーラブルな画像形式）で表示 */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
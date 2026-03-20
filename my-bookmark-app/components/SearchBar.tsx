// ============================================
// components/SearchBar.tsx
// ============================================
// 【ファイルの役割】
// ユーザーがブックマークを検索するための入力フィールド
// ここに入力したテキストに応じて、page.tsx の filteredBookmarks が更新され、
// 該当するブックマークのみが画面に表示されます

// 【Props とは】
interface SearchBarProps {
  value: string;           // 現在の検索テキスト
  onChange: (value: string) => void;  // 検索テキストが変わった時に実行される関数
}

// 【関数の説明】
// SearchBar コンポーネント: 検索用の入力フィールドを描画する関数
export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    // 検索フィールドのコンテナ
    <div className="mb-6">
      {/* 検索用の入力フィールド */}
      <input 
        type="text"  // テキスト入力
        placeholder="タイトルや内容で検索..."  // ユーザーへのヒント
        value={value}  // 現在の検索テキスト
        // ユーザーが入力を変えた時、親の onChange 関数に新しいテキストを渡す
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none text-lg transition text-black"
      />
    </div>
  );
}
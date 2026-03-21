// ============================================
// components/TagEditor.tsx
// ============================================
// 【ファイルの役割】
// ブックマークのタグを編集・保存するコンポーネント
// 詳細ページから呼び出され、ユーザーがタグを追加・変更できる

'use client'

interface TagEditorProps {
  currentTag: string;                    // 現在設定されているタグ
  onTagInput: (newTag: string) => void;  // 入力が変わった時の処理（リアルタイム状態更新用）
  onTagBlur: () => void;                 // タグ入力からフォーカスが失われた時（保存処理用）
  availableTags: string[];               // 過去に使用したタグの一覧
  saving?: boolean;                      // 保存中かどうかのフラグ
}

export default function TagEditor({
  currentTag,
  onTagInput,
  onTagBlur,
  availableTags,
  saving = false,
}: TagEditorProps) {
  return (
    <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
      {/* ラベル */}
      <span className="text-gray-600 font-semibold whitespace-nowrap">分類タグ:</span>

      {/* タグ入力フィールド */}
      <input
        type="text"
        value={currentTag}
        onChange={(e) => onTagInput(e.target.value)}  // 入力するたびにローカル状態更新
        onBlur={onTagBlur}  // フォーカスを失ったら保存
        disabled={saving}
        placeholder="例: python, react, frontend..."
        list="availableTagsList"
        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 disabled:bg-gray-100"
      />

      {/* datalist: 過去に使用したタグを候補として表示 */}
      <datalist id="availableTagsList">
        {availableTags.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>

      {/* 保存状態の表示 */}
      {saving && (
        <span className="text-indigo-600 text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
          💾 保存中...
        </span>
      )}
    </div>
  );
}

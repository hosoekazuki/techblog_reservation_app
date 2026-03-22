// ============================================
// components/DescriptionEditor.tsx
// ============================================
// 【ファイルの役割】
// 記事の description（説明文）を編集・保存するコンポーネント

'use client'

interface DescriptionEditorProps {
  description: string
  onDescriptionChange: (value: string) => void
  onSave: () => void
  saving?: boolean
}

export default function DescriptionEditor({
  description,
  onDescriptionChange,
  onSave,
  saving = false,
}: DescriptionEditorProps) {
  return (
    <section className="bg-indigo-50 rounded-xl p-5 border border-indigo-200 mb-6">
      <h2 className="text-lg font-bold text-indigo-900 mb-3">記事の説明文</h2>

      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="w-full p-4 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-gray-800 bg-white min-h-[140px] resize-none"
        placeholder="記事の説明文を入力してください"
      />

      <button
        onClick={onSave}
        disabled={saving}
        className={`mt-3 w-full py-3 rounded-lg text-white font-bold transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
          saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {saving ? '💾 保存中...' : '💾 説明文を保存する'}
      </button>
    </section>
  )
}
// ============================================
// components/BookmarkForm.tsx
// ============================================
// 【ファイルの役割】
// ユーザーがブログのURLを入力し、「保存」ボタンをクリックするためのフォーム部分
// このコンポーネントは UI 部分に特化しており、実際の保存処理は親コンポーネント（page.tsx）で行われる

// 【Props とは】
// React で親コンポーネントからデータを受け取るための仕組み
// 以下の情報を親（page.tsx）から受け取ります
interface BookmarkFormProps {
  url: string;              // 現在入力されているURL
  setUrl: (url: string) => void;  // URL を更新する関数（親コンポーネントの setUrl）
  onSave: () => void;       // 「保存」ボタンを押した時に実行する関数（親コンポーネントの handleSave）
  loading: boolean;         // データベースに保存中かどうかを示すフラグ
  tag: string;              // 【新規】現在選択されているタグ
  setTag: (tag: string) => void;  // 【新規】タグを更新する関数
  availableTags: string[];  // 【新規】過去に使用したタグの一覧（ドロップダウン用）
}

// 【関数の説明】
// BookmarkFormコンポーネント: URL入力フォームを描画する関数
// Props から url, setUrl, onSave, loading, tag, setTag, availableTags を取り出す（分割代入）
export default function BookmarkForm({ url, setUrl, onSave, loading, tag, setTag, availableTags }: BookmarkFormProps) {
  return (
    // フォーム全体のコンテナ: 白い背景で目立つように見せる
    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
      {/* タイトル表示 */}
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        技術ブログ保存くん <span className="text-sm font-normal text-gray-400">v1.1</span>
      </h1>
      
      {/* URL入力エリア: input と button を並べる */}
      <div className="flex gap-2 mb-4">
        {/* 入力フィールド: ユーザーがURL を入力する場所 */}
        <input 
          type="text"  // テキスト入力用
          value={url}  // 現在入力されている URL を表示
          // ユーザーがテキストを変更した時、変更後のテキストを親の setUrl に渡す
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://zenn.dev/..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        {/* 保存ボタン */}
        <button 
          onClick={onSave}  // クリックで親の handleSave 関数を実行
          disabled={loading}  // loading が true の時、ボタンを無効化して複数回押下を防ぐ
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {/* loading の状態で表示内容を切り替え */}
          {loading ? '中...' : '保存'}  {/* 保存中なら「中...」、そうでなければ「保存」と表示 */}
        </button>
      </div>

      {/* 【新規追加】タグ入力フィールド */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-semibold text-gray-600">分類タグ:</label>
        <input 
          type="text"  // テキスト入力用
          value={tag}  // 現在のタグ値を表示
          onChange={(e) => setTag(e.target.value)}  // タグを更新
          placeholder="例: python, react, frontend..."
          list="tagslist" // datalist と紐付ける
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black text-sm"
        />
        {/* datalist: 過去に使用したタグを候補として表示 */}
        <datalist id="tagslist">
          {availableTags.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <span className="text-xs text-gray-400 whitespace-nowrap">デフォルト: その他</span>
      </div>
    </div>
  );
}
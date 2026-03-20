// components/BookmarkForm.tsx
interface BookmarkFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSave: () => void;
  loading: boolean;
}

export default function BookmarkForm({ url, setUrl, onSave, loading }: BookmarkFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        技術ブログ保存くん <span className="text-sm font-normal text-gray-400">v1.1</span>
      </h1>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://zenn.dev/..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button 
          onClick={onSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
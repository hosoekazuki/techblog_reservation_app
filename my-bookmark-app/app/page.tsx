'use client';

import { useState } from 'react'; // これを忘れると url が使えません
import { supabase } from '@/lib/supabase';

export default function Home() {
  // 1. 入力されたURLを保存する「箱」を作ります
  const [url, setUrl] = useState('');
  // 2. 保存中かどうかを管理する（連打防止用）
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!url) return alert('URLを入力してください');
    
    setLoading(true);
    try {
      // A. 自作API（extract）を叩いてタイトルを取得する
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // B. 取得したデータを Supabase に保存する
      const { error } = await supabase
        .from('techblog_bookmark') 
        .insert([
          {
            url: url, 
            title: data.title,
            description: data.description || '',
          }
        ]);

      if (error) throw error;
      
      alert(`保存成功！: ${data.title}`);
      setUrl(''); // 保存できたら入力欄を空にする

    } catch (error) {
      console.error('Error details:', error);
      alert('保存に失敗しました。URLが正しいか、テーブル名が合っているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          技術ブログ・ストッカー
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              保存したい記事のURL
            </label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://zenn.dev/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? '保存中...' : 'ブックマークを保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
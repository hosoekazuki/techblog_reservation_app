'use client';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const handleTestSave = async () => {
    const { error } = await supabase
      .from('techblog_bookmark')
      .insert([{ url: 'https://google.com', title: 'テスト保存' }]);

    if (error) {
      console.error(error);
      alert('エラーが発生しました');
    } else {
      alert('保存成功！Supabaseのテーブルを確認してね');
    }
  };

  return (
    <div className="p-20">
      <button 
        onClick={handleTestSave}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        テスト保存を実行
      </button>
    </div>
  );
}
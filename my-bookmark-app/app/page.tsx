'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// パーツを読み込む
import BookmarkForm from '@/components/BookmarkForm';
import SearchBar from '@/components/SearchBar';
import BookmarkItem from '@/components/BookmarkItem';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('techblog_bookmark')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBookmarks(data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    await supabase.from('techblog_bookmark').delete().eq('id', id);
    fetchBookmarks();
  };

  const handleSave = async () => {
    if (!url) return alert('URLを入力してください');
    setLoading(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      await supabase.from('techblog_bookmark').insert([{ url, title: data.title, description: data.description || '' }]);
      setUrl('');
      fetchBookmarks();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const filteredBookmarks = bookmarks.filter((item) => {
    const search = searchTerm.toLowerCase();
    return item.title?.toLowerCase().includes(search) || item.description?.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto">
        
        {/* 1. フォーム */}
        <BookmarkForm url={url} setUrl={setUrl} onSave={handleSave} loading={loading} />

        {/* 2. 検索バー */}
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {/* 3. リスト表示 */}
        <div className="space-y-4">
          {filteredBookmarks.map((item) => (
            <BookmarkItem key={item.id} item={item} onDelete={handleDelete} />
          ))}

          {filteredBookmarks.length === 0 && (
            <p className="text-center text-gray-400 py-12">該当する記事はありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
// ============================================
// app/api/extract/route.ts
// ============================================
// 【ファイルの役割】
// フロントエンド（page.tsx）から呼ばれるバックエンドAPI
// ユーザーが入力したURLから、ブログのタイトルと説明文を自動的に抽出します
// このAPIがないと、ユーザーが手動でタイトルや説明を入力する必要があります

// 【ライブラリのインポート】
import { NextResponse } from 'next/server';  // Next.js の API レスポンス用ツール
import * as cheerio from 'cheerio';  // HTML を解析するライブラリ（jQuery のようなシンタックス）

// 【関数の説明】
// POST メソッド: フロントエンドから POST リクエストを受け取る処理
// export = 他のファイルから使える公開関数として定義
// async = 非同期処理（時間がかかるなら await する）
export async function POST(request: Request) {
  try {  // エラーが起きた時のために try-catch で囲む
    // ===== ステップ1: リクエストボディから URL を取得 =====
    const { url } = await request.json();  // JSON形式のデータから url を取り出す
    
    // ===== ステップ2: 指定されたURLにアクセスして HTML コンテンツを取得 =====
    const response = await fetch(url, {
        // User-Agent ヘッダー: 「私はブラウザです」とサーバーに見せる
        // (User-Agent がないと、一部のサイトからブロックされる可能性がある)
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    // ===== ステップ3: レスポンスを HTML テキストに変換 =====
    const html = await response.text();  // HTML全体をテキストとして取得
    
    // ===== ステップ4: Cheerio で HTMLを解析可能にする =====
    // cheerio.load(html) = jQuery のようなセレクタでHTMLを検索できるようにする
    const $ = cheerio.load(html);

    // ===== ステップ5: HTML から タイトルを抽出 =====
    // 優先順：og:title -> title タグ -> 空文字
    // og:title = Facebook/Twitter 用のメタタグ（最も確実なタイトル）
    const title = 
      $('meta[property="og:title"]').attr('content')  // og:title があれば使用
      || $('title').text()  // なければ <title> タグから
      || '';  // それでもなければ空文字
    
    // ===== ステップ6: HTML から 説明文を抽出 =====
    // 優先順：og:description -> description メタタグ -> 空文字
    const description = 
      $('meta[property="og:description"]').attr('content')  // og:description があれば使用
      || $('meta[name="description"]').attr('content')  // なければ description メタタグから
      || '';  // それでもなければ空文字

    // ===== ステップ7: 抽出したデータをクライアント（フロントエンド）に返す =====
    return NextResponse.json({ title, description });
    } catch (error) {  // エラーが発生した場合の処理
        console.error('Error fetching URL:', error);  // エラーをコンソールに表示（サーバーログ）
        // エラー時でも空のデータを返す（フロントエンドでの処理を続行）
        return NextResponse.json({ title: '', description: '' });
    }
}
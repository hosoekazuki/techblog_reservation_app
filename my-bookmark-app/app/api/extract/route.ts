// ============================================
// app/api/extract/route.ts
// ============================================

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 要約方針を変更したい場合は、このテンプレートを編集してください。
const SUMMARY_PROMPT_TEMPLATE = `あなたは技術記事の要約エキスパートです。

以下の情報から、記事の全体像が伝わる要約を日本語で作成してください。

【必須条件】
1. 記事の主題を最初に示す
2. この記事で学べることを含める
3. 読後に「何ができるようになるか」を含める
4. 主要技術名（例: Next.js, Supabase, React など）を可能な範囲で含める
5. 実装の細かい手順の羅列ではなく、全体像と価値を要約する
6. 120〜170字程度で簡潔に書く
7. 出力は1段落のみ。見出し・箇条書き・前置きは禁止

【記事情報】
{{ARTICLE_SOURCE}}

【出力】`;

export async function POST(request: Request) {
  try {
    // ===== ステップ1: URLを取得 =====
    const { url } = await request.json();

    // ===== ステップ2: URLにアクセスしてHTMLを取得 =====
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await response.text();

    // ===== ステップ3: Cheerioで解析 =====
    const $ = cheerio.load(html);

    // ===== ステップ4: タイトルを抽出 =====
    const title =
      $('meta[property="og:title"]').attr('content')
      || $('title').text()
      || '';

    // ===== ステップ5: メタ説明文を抽出（フォールバック用） =====
    const metaDescription =
      $('meta[property="og:description"]').attr('content')
      || $('meta[name="description"]').attr('content')
      || '';

    // ===== 【修正】ステップ6: 要約用の入力情報を抽出 =====
    // 本文だけでなくタイトル・見出し・導入段落をまとめて渡すことで、
    // 記事の全体像を要約しやすくする
    const articleSource = buildSummarySource($, title, metaDescription);

    // ===== ステップ7: Gemini APIで要約 =====
    let summarizedDescription = metaDescription; // デフォルトはメタ説明文

    // サーバーサイドAPIルートでは NEXT_PUBLIC_ なしの変数名を使用
    // .env に GOOGLE_GEMINI_API_KEY を設定してください
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

    console.log('🔍 [要約処理開始]');
    console.log('- APIキー設定:', apiKey ? '✓ あり' : '✗ なし');
    console.log('- 要約入力長:', articleSource.length);

    // 要約用テキストが十分に取得できた場合にGeminiで要約
    if (apiKey && articleSource.length > 120) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // 長すぎる入力を抑制
        const clippedSource = articleSource.slice(0, 5000);
        const prompt = SUMMARY_PROMPT_TEMPLATE.replace('{{ARTICLE_SOURCE}}', clippedSource);

        console.log('🚀 Gemini API 呼び出し中...');
        const result = await model.generateContent(prompt);
        const geminiResponse = await result.response;
        const summaryText = geminiResponse.text().trim();

        if (summaryText) {
          summarizedDescription = summaryText;
          console.log('✅ 要約完了:', summarizedDescription.substring(0, 100) + '...');
        } else {
          console.log('⚠️ 要約結果が空のためメタ説明文を使用');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ 要約処理でエラー:', errorMessage);
        // エラー時はメタ説明文を使用
        summarizedDescription = metaDescription;
      }
    } else {
      console.log('⏭️ 要約処理スキップ', {
        hasApiKey: !!apiKey,
          sourceLength: articleSource.length,
      });
    }

    // ===== ステップ8: レスポンスを返す =====
    return NextResponse.json({
      title,
      description: summarizedDescription,
    });

  } catch (error) {
    console.error('Error fetching URL:', error);
    return NextResponse.json({ title: '', description: '' });
  }
}

// ============================================
// 【新規追加】記事本文テキストを抽出するヘルパー関数
// メタタグではなく実際の記事コンテンツを取得する
// ============================================
function extractArticleText($: cheerio.CheerioAPI): string {
  // ナビゲーション・フッター・サイドバーなど不要な要素を除去
  $('nav, footer, header, aside, script, style, [class*="nav"], [class*="sidebar"], [class*="footer"], [class*="menu"], [class*="ad"], [class*="banner"]').remove();

  // 記事本文を含みやすいセレクタを優先順に試みる
  const selectors = [
    'article',
    '[class*="article-body"]',
    '[class*="article_body"]',
    '[class*="post-body"]',
    '[class*="post_body"]',
    '[class*="entry-content"]',
    '[class*="entry_content"]',
    'main',
    '.content',
    '#content',
  ];

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      const text = el.text().replace(/\s+/g, ' ').trim();
      if (text.length > 200) {
        return text;
      }
    }
  }

  // どれにも該当しない場合は body 全体のテキストを使用
  return $('body').text().replace(/\s+/g, ' ').trim();
}

function buildSummarySource(
  $: cheerio.CheerioAPI,
  title: string,
  metaDescription: string,
): string {
  const articleText = extractArticleText($);

  const headings = $('h1, h2, h3')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
    .slice(0, 12)
    .join(' | ');

  const paragraphs = $('article p, main p, .content p, #content p, p')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter((t) => t.length > 30)
    .slice(0, 10)
    .join('\n');

  return [
    `タイトル: ${title || '不明'}`,
    `メタ説明: ${metaDescription || 'なし'}`,
    `見出し: ${headings || 'なし'}`,
    `本文抜粋: ${(paragraphs || articleText || '').slice(0, 4000)}`,
  ].join('\n\n');
}
# 📚 技術ブログ保存アプリ（My Bookmark App）

技術ブログ記事を簡単に保存・管理・検索できるWebアプリケーションです。URLを入力するだけで、記事のタイトルと説明文を自動抽出して保存します。

## 🎯 アプリの特徴

- **簡単保存**: URLを入力して「保存」ボタンをクリックするだけで記事を保存
- **自動抽出**: 記事のタイトルと説明文を自動的にWebサイトから抽出
- **高速検索**: 保存した記事をタイトルや説明文から即座に検索
- **ワンクリック削除**: 不要な記事も簡単に削除可能
- **クラウド保存**: Supabase でデータを管理し、デバイス間で同期
- **レスポンシブデザイン**: PC・タブレット・スマートフォン対応

## 🛠 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|----------|------|
| **フレームワーク** | Next.js | 16.2.0 | React フレームワーク、ハイブリッドレンダリング |
| **UI ライブラリ** | React | 19.2.4 | UIコンポーネント |
| **言語** | TypeScript | 5 | 型安全な開発 |
| **スタイリング** | Tailwind CSS | 4 | ユーティリティファースト CSS |
| **データベース** | Supabase | 2.99.3 | クラウドPostgreSQL、リアルタイムAPI |
| **HTML 解析** | Cheerio | 1.2.0 | サーバーサイドでURLからメタ情報を抽出 |
| **開発ツール** | ESLint | 9 | コード品質管理 |

## 📁 ディレクトリ構成

```
my-bookmark-app/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts              # URL からタイトル・説明文を抽出する API
│   ├── page.tsx                      # メインページ（状態管理・ビジネスロジック）
│   ├── layout.tsx                    # ページレイアウト
│   └── globals.css                   # グローバルスタイル
│
├── components/
│   ├── BookmarkForm.tsx              # URL 入力フォーム部品
│   ├── BookmarkItem.tsx              # ブックマークカード表示部品
│   └── SearchBar.tsx                 # 検索フィールド部品
│
├── lib/
│   └── supabase.ts                   # Supabase クライアント設定
│
├── public/                           # 静的アセット
│
├── package.json                      # 依存パッケージ定義
├── tsconfig.json                     # TypeScript 設定
├── next.config.ts                    # Next.js 設定
├── tailwind.config.js                # Tailwind CSS 設定
├── postcss.config.mjs                # PostCSS 設定
└── eslint.config.mjs                 # ESLint 設定
```

### 📂 ファイル説明

**app/page.tsx**
- アプリのメインコンポーネント
- 全ての状態管理（State）とビジネスロジック（API呼び出し、DB操作）を担当
- コンテナ・プレゼンテーショナルパターンを実装

**components/**
- 再利用可能な UI コンポーネント
- 親から Props を受け取り、UI の描画のみを行う
- ロジックは含まない（親に委任）

**app/api/extract/route.ts**
- Next.js の API Route（バックエンド）
- 受け取ったURL から Cheerio でメタ情報を抽出
- og:title, og:description をサポート

**lib/supabase.ts**
- Supabase クライアントの初期化
- 環境変数から接続情報を読み込み

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0 以上
- npm または yarn
- Supabase アカウント

### インストール手順

#### 1. リポジトリをクローン

```bash
git clone <リポジトリURL>
cd my-bookmark-app
```

#### 2. 依存パッケージをインストール

```bash
npm install
# または
yarn install
```

#### 3. 環境変数を設定

`.env.local` ファイルをプロジェクトroot に作成し、以下を記入：

```env
# Supabase の設定
NEXT_PUBLIC_SUPABASE_URL=<あなたのSupabaseプロジェクトURL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<あなたのSupabaseアノニマスキー>
```

**Supabase の設定方法：**
1. [Supabase](https://supabase.com) にサインアップ
2. 新しいプロジェクトを作成
3. Project Settings → API から URL と Key を取得
4. 上記の `.env.local` に貼り付け

#### 4. Supabase にテーブルを作成

Supabase の SQL Editor で以下を実行：

```sql
CREATE TABLE techblog_bookmark (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. 開発サーバーを起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリが起動します

## 📋 使用方法

1. **URLを入力**: ブログ記事のURLを入力フォームに貼り付け
2. **保存ボタンをクリック**: 自動的にタイトルと説明文が抽出され、DB に保存
3. **検索**: 検索フィールドにキーワードを入力してブックマークをフィルタリング
4. **削除**: 不要な記事の削除ボタンをクリック

## 🔄 データフロー

```
ユーザー入力 (URL)
    ↓
API /api/extract （cheerio で HTML 解析）
    ↓
タイトル・説明文を抽出
    ↓
Supabase に保存
    ↓
画面に一覧表示
    ↓
検索フィルタリング
```

## 🏗 アーキテクチャ

このアプリは **コンテナ・プレゼンテーショナルパターン** を採用しています：

- **コンテナ (page.tsx)**: ロジック、状態管理、API 通信を担当
- **プレゼンテーション (components)**: UI 表示のみを担当

このパターンにより、コンポーネントの再利用性とテスト可能性が向上します。

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# ESLint チェック
npm run lint
```

## 📦 ビルド・デプロイ

### ローカルビルド

```bash
npm run build
npm start
```

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にサインアップ
2. GitHub リポジトリを接続
3. 環境変数を設定（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY）
4. デプロイボタンをクリック

詳細は [Next.js デプロイメントドキュメント](https://nextjs.org/docs/app/deploying) を参照

## 📝 環境変数（詳細）

| 変数 | 説明 | 取得元 |
|------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトのURL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase のアノニマスキー | Supabase Dashboard |

## 🐛 トラブルシューティング

### "Cannot find module Supabase" エラー

```bash
npm install @supabase/supabase-js
```

### "環境変数が見つからない" エラー

`.env.local` ファイルが正しく設定されているか確認してください

### ブックマークが保存されない

1. Supabase の接続を確認
2. テーブル `techblog_bookmark` が存在するか確認
3. ブラウザの開発者ツール（F12） → Network タブでエラーを確認

## 👨‍💻 開発ガイドライン

### コンポーネント追加時

1. `components/` フォルダに新ファイルを作成
2. Props の型定義を interface で定義
3. JSDoc コメントで機能を説明

### 新しい API ルート追加時

1. `app/api/` 内に新しいフォルダを作成
2. `route.ts` で GET / POST メソッドを実装
3. エラーハンドリングを含める

## 📚 参考リンク

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [React 公式ドキュメント](https://react.dev)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています

## 🤝 貢献

改善案やバグ報告は Issue で受け付けています。
プルリクエストも大歓迎です。

---

**最終更新**: 2026 年 3 月 20 日

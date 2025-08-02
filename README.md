# Learnly - AI-Powered Learning Platform

Learnlyは、AIを活用した学習プラットフォームです。ニュース記事を基にした学習機能や、チャット形式での学習支援を提供します。

## 機能

- **ニュース学習**: 最新ニュースを基にした学習
- **AIチャット**: 学習内容についての質問応答
- **ニュース管理**: 自動取得、手動取得、アーカイブ機能
- **学習進捗管理**: 学習記録と進捗の追跡

## 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Supabase Edge Functions
- **AI**: Perplexity API
- **状態管理**: Zustand

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Perplexity API Configuration (for Supabase Edge Functions)
PERPLEXITY_API_KEY=your_perplexity_api_key
PERPLEXITY_MODEL=sonar
```

### 3. Supabaseのセットアップ

#### Supabase CLIのインストール

```bash
npm install -g supabase
```

#### Supabaseプロジェクトの初期化

```bash
supabase init
```

#### ローカル開発環境の開始

```bash
npm run supabase:start
```

#### エッジファンクションのデプロイ

```bash
npm run supabase:functions:deploy
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## プロジェクト構造

```
learnly/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── chat/              # チャット機能
│   ├── dashboard/         # ダッシュボード
│   ├── news-dashboard/    # ニュースダッシュボード
│   ├── news-settings/     # ニュース設定
│   ├── news-archive/      # ニュースアーカイブ
│   └── ...
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ
├── store/                 # Zustandストア
├── supabase/              # Supabase設定
│   └── functions/         # Edge Functions
└── ...
```

## ニュース機能

### 自動取得設定
- 取得時間の設定
- 取得頻度（毎日/週間/手動）
- 取得曜日の選択

### 手動取得
- いつでもニュースを取得可能
- 選択したトピックに基づく取得

### アーカイブ機能
- 取得したニュースの一覧表示
- 検索・フィルタリング機能
- CSVエクスポート機能

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# Supabase関連
npm run supabase:start      # ローカルSupabase開始
npm run supabase:stop       # ローカルSupabase停止
npm run supabase:status     # Supabase状態確認
npm run supabase:functions:deploy  # エッジファンクションデプロイ
npm run supabase:functions:serve   # エッジファンクションローカル実行
```

## デプロイ

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Supabase

Supabaseのエッジファンクションは、Supabaseダッシュボードからデプロイできます。

## ライセンス

This project is licensed under the MIT License.

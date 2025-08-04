-- RSSソース管理テーブルを作成
CREATE TABLE IF NOT EXISTS rss_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,         -- 表示名（例：ITmedia）
  rss_url text NOT NULL,            -- RSSのURL
  category text NOT NULL,            -- カテゴリ（例："technology"）
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_rss_sources_category ON rss_sources(category);
CREATE INDEX IF NOT EXISTS idx_rss_sources_active ON rss_sources(active); 
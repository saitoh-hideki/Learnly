-- Create latest_news table for news learning feature
CREATE TABLE IF NOT EXISTS latest_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_latest_news_category ON latest_news(category);
CREATE INDEX IF NOT EXISTS idx_latest_news_created_at ON latest_news(created_at);
CREATE INDEX IF NOT EXISTS idx_latest_news_url ON latest_news(url);
CREATE INDEX IF NOT EXISTS idx_latest_news_published_at ON latest_news(published_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_latest_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_latest_news_updated_at
  BEFORE UPDATE ON latest_news
  FOR EACH ROW
  EXECUTE FUNCTION update_latest_news_updated_at();

-- Insert sample data for testing (optional)
INSERT INTO latest_news (title, summary, url, source, category, published_at, topics) VALUES
(
  'AI技術の最新動向：2024年の展望',
  '人工知能技術の最新動向と2024年の展望について、業界の専門家が分析します。機械学習、自然言語処理、コンピュータビジョンなどの分野での進歩と今後の課題を詳しく解説します。',
  'https://example.com/ai-trends-2024',
  'TechNews',
  'technology',
  NOW() - INTERVAL '2 hours',
  ARRAY['technology', 'ai', 'machine-learning']
),
(
  '持続可能なビジネスモデルの重要性',
  '環境問題への対応が企業の競争力に直結する時代において、持続可能なビジネスモデルの構築が重要になっています。成功事例と実践方法を紹介します。',
  'https://example.com/sustainable-business',
  'BusinessDaily',
  'business',
  NOW() - INTERVAL '4 hours',
  ARRAY['business', 'sustainability', 'environment']
),
(
  '教育におけるデジタル技術の活用',
  'オンライン学習プラットフォームやAIを活用した個別指導など、教育分野でのデジタル技術の活用が進んでいます。効果的な学習方法と今後の展望を探ります。',
  'https://example.com/digital-education',
  'EducationToday',
  'education',
  NOW() - INTERVAL '6 hours',
  ARRAY['education', 'technology', 'online-learning']
),
(
  '気候変動対策の最新研究',
  '地球温暖化対策のための最新の科学研究成果と、各国の取り組みについて報告します。再生可能エネルギー技術の進歩と政策動向を詳しく解説します。',
  'https://example.com/climate-research',
  'ScienceWeekly',
  'environment',
  NOW() - INTERVAL '8 hours',
  ARRAY['environment', 'climate-change', 'science']
),
(
  '健康とウェルネスの最新トレンド',
  'メンタルヘルスケアからフィジカルフィットネスまで、現代人の健康とウェルネスに関する最新トレンドを紹介します。科学的根拠に基づく実践方法を解説します。',
  'https://example.com/health-wellness-trends',
  'HealthMagazine',
  'health',
  NOW() - INTERVAL '10 hours',
  ARRAY['health', 'wellness', 'mental-health']
); 
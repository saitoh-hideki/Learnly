-- 経済金融カテゴリ専用のRSSソースを追加
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- economicsカテゴリ（経済・金融関連）専用ソース
('大和総研 経済分析', 'https://www.dir.co.jp/rss/economy.rdf', 'economics', true),
('大和総研 金融資本市場', 'https://www.dir.co.jp/rss/financial.rdf', 'economics', true),
('Investing.com 日本', 'https://jp.investing.com/rss/news_1.rss', 'economics', true); 
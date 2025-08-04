-- politicsカテゴリーに記事が取得できるように、より信頼性の高いRSSソースを追加
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- politicsカテゴリ（政治・国際関連）専用ソース（より信頼性の高いもの）
('Reuters Japan', 'https://jp.reuters.com/rssFeed/japanNews', 'politics', true),
('BBC News Japan', 'https://www.bbc.com/japanese/index.xml', 'politics', true),
('CNN Japan', 'https://www.cnn.co.jp/rss/index.xml', 'politics', true),
('AFP BB News', 'https://www.afpbb.com/rss/index.xml', 'politics', true),
('Bloomberg Japan', 'https://www.bloomberg.co.jp/feed.xml', 'politics', true); 
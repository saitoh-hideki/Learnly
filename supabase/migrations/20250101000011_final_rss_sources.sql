-- 既存のRSSソースを無効化
UPDATE rss_sources SET active = false;

-- 確実に動作するRSSソースのみを追加
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- businessカテゴリ（ビジネス関連）
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'business', true),
('日経ビジネス', 'https://business.nikkei.com/rss/index.rdf', 'business', true),

-- technologyカテゴリ（技術関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'technology', true),
('CNET Japan', 'https://japan.cnet.com/rss/index.rdf', 'technology', true),
('GIGAZINE', 'https://gigazine.net/news/rss_2.0/', 'technology', true),

-- healthカテゴリ（健康・医療関連）
('朝日新聞 健康', 'https://rss.asahi.com/rss/asahi/health.rdf', 'health', true),

-- scienceカテゴリ（科学関連）
('朝日新聞 科学', 'https://rss.asahi.com/rss/asahi/science.rdf', 'science', true),

-- educationカテゴリ（教育関連）
('リセマム', 'https://resemom.jp/rss/index.rdf', 'education', true),
('ベネッセ教育情報サイト', 'https://benesse.jp/rss/index.rdf', 'education', true),

-- lifestyleカテゴリ（ライフスタイル関連）- 代替ソース
('朝日新聞 社会', 'https://rss.asahi.com/rss/asahi/society.rdf', 'lifestyle', true),

-- environmentカテゴリ（環境関連）- 代替ソース
('朝日新聞 科学', 'https://rss.asahi.com/rss/asahi/science.rdf', 'environment', true),

-- politicsカテゴリ（政治関連）
('朝日新聞 政治', 'https://rss.asahi.com/rss/asahi/politics.rdf', 'politics', true),
('読売新聞 政治', 'https://www.yomiuri.co.jp/politics/rss.xml', 'politics', true),

-- economicsカテゴリ（経済関連）
('朝日新聞 経済', 'https://rss.asahi.com/rss/asahi/economy.rdf', 'economics', true),
('読売新聞 経済', 'https://www.yomiuri.co.jp/economy/rss.xml', 'economics', true),

-- societyカテゴリ（社会関連）
('朝日新聞 社会', 'https://rss.asahi.com/rss/asahi/society.rdf', 'society', true),
('読売新聞 社会', 'https://www.yomiuri.co.jp/society/rss.xml', 'society', true); 
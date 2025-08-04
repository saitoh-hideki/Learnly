-- 既存のRSSソースを無効化
UPDATE rss_sources SET active = false;

-- 確実に動作するRSSソースのみを追加（2025年8月時点で動作確認済み）
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- businessカテゴリ（ビジネス関連）
('日経ビジネス', 'https://business.nikkei.com/rss/sns/nb.rdf', 'business', true),
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'business', true),

-- economicsカテゴリ（経済・金融関連）
('日経ビジネス', 'https://business.nikkei.com/rss/sns/nb.rdf', 'economics', true),
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'economics', true),

-- technologyカテゴリ（技術関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'technology', true),
('CNET Japan', 'https://japan.cnet.com/rss/index.rdf', 'technology', true),
('GIGAZINE', 'https://gigazine.net/news/rss_2.0/', 'technology', true),

-- healthカテゴリ（健康・医療関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'health', true),

-- scienceカテゴリ（科学関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'science', true),

-- educationカテゴリ（教育関連）
('リセマム', 'https://resemom.jp/rss/index.rdf', 'education', true),

-- lifestyleカテゴリ（ライフスタイル関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'lifestyle', true),
('CNET Japan', 'https://japan.cnet.com/rss/index.rdf', 'lifestyle', true),

-- environmentカテゴリ（環境関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'environment', true),

-- politicsカテゴリ（政治関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'politics', true),

-- societyカテゴリ（社会関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'society', true); 
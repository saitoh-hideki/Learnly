-- 既存のRSSソースを無効化
UPDATE rss_sources SET active = false;

-- より適切なRSSソースを追加
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- businessカテゴリ（ビジネス関連）
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'business', true),
('日経ビジネス', 'https://business.nikkei.com/rss/index.rdf', 'business', true),
('ダイヤモンド・オンライン', 'https://diamond.jp/rss/diamond.xml', 'business', true),

-- technologyカテゴリ（技術関連）
('ITmedia NEWS', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'technology', true),
('CNET Japan', 'https://japan.cnet.com/rss/index.rdf', 'technology', true),
('GIGAZINE', 'https://gigazine.net/news/rss_2.0/', 'technology', true),
('Engadget 日本版', 'https://japanese.engadget.com/rss.xml', 'technology', true),

-- healthカテゴリ（健康・医療関連）
('日経メディカル', 'https://medical.nikkeibp.co.jp/rss/index.rdf', 'health', true),
('M3.com', 'https://www.m3.com/rss/news.xml', 'health', true),
('ケアネット', 'https://www.carenet.com/rss/news.xml', 'health', true),
('日経ヘルス', 'https://health.nikkei.co.jp/rss/index.rdf', 'health', true),

-- scienceカテゴリ（科学関連）
('Nature Japan', 'https://www.natureasia.com/ja-jp/nature/current-issue/rss', 'science', true),
('Science Japan', 'https://www.science.org/rss/news_current.xml', 'science', true),
('Scientific American Japan', 'https://www.scientificamerican.com/japanese/rss.xml', 'science', true),
('ナショナルジオグラフィック日本版', 'https://natgeo.nikkeibp.co.jp/rss/index.rdf', 'science', true),

-- educationカテゴリ（教育関連）
('リセマム', 'https://resemom.jp/rss/index.rdf', 'education', true),
('ベネッセ教育情報サイト', 'https://benesse.jp/rss/index.rdf', 'education', true),
('教育新聞', 'https://www.kyobun.co.jp/rss/index.rdf', 'education', true),
('朝日新聞 教育', 'https://rss.asahi.com/rss/asahi/education.rdf', 'education', true),

-- lifestyleカテゴリ（ライフスタイル関連）
('FASHION PRESS', 'https://www.fashion-press.net/rss/index.rdf', 'lifestyle', true),
('VOGUE JAPAN', 'https://www.vogue.co.jp/rss/index.rdf', 'lifestyle', true),
('ELLE JAPAN', 'https://www.elle.com/jp/rss/index.rdf', 'lifestyle', true),
('朝日新聞 ライフ', 'https://rss.asahi.com/rss/asahi/life.rdf', 'lifestyle', true),

-- environmentカテゴリ（環境関連）
('環境ビジネス', 'https://www.kankyo-business.jp/rss/index.rdf', 'environment', true),
('EICネット', 'https://www.eic.or.jp/rss/index.rdf', 'environment', true),
('朝日新聞 環境', 'https://rss.asahi.com/rss/asahi/environment.rdf', 'environment', true),
('日経エコロジー', 'https://eco.nikkeibp.co.jp/rss/index.rdf', 'environment', true),

-- politicsカテゴリ（政治関連）
('朝日新聞 政治', 'https://rss.asahi.com/rss/asahi/politics.rdf', 'politics', true),
('読売新聞 政治', 'https://www.yomiuri.co.jp/politics/rss.xml', 'politics', true),
('毎日新聞 政治', 'https://mainichi.jp/rss/etc/mainichi-politics.rss', 'politics', true),

-- economicsカテゴリ（経済関連）
('朝日新聞 経済', 'https://rss.asahi.com/rss/asahi/economy.rdf', 'economics', true),
('読売新聞 経済', 'https://www.yomiuri.co.jp/economy/rss.xml', 'economics', true),
('毎日新聞 経済', 'https://mainichi.jp/rss/etc/mainichi-economy.rss', 'economics', true),

-- societyカテゴリ（社会関連）
('朝日新聞 社会', 'https://rss.asahi.com/rss/asahi/society.rdf', 'society', true),
('読売新聞 社会', 'https://www.yomiuri.co.jp/society/rss.xml', 'society', true),
('毎日新聞 社会', 'https://mainichi.jp/rss/etc/mainichi-society.rss', 'society', true); 
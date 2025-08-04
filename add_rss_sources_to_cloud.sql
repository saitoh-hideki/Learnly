-- クラウドのSupabaseに直接実行するためのRSSソース追加SQL

-- 空のカテゴリーに記事が取得できるように、より信頼性の高いRSSソースを追加
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- scienceカテゴリ（科学・研究関連）専用ソース
('Nature Japan', 'https://www.natureasia.com/ja-jp/nature/current-issue/rss', 'science', true),
('Science Japan', 'https://science-japan.jp/rss.xml', 'science', true),
('ナショナルジオグラフィック日本版', 'https://natgeo.nikkeibp.co.jp/rss/index.rdf', 'science', true),
('WIRED Japan', 'https://wired.jp/rss/index.xml', 'science', true),

-- societyカテゴリ（社会・政治関連）専用ソース
('NHKニュース', 'https://www3.nhk.or.jp/rss/news/cat0.xml', 'society', true),
('TBS NEWS', 'https://news.tbs.co.jp/rss/tbs_newsi.rdf', 'society', true),
('テレ朝news', 'https://news.tv-asahi.co.jp/rss/index.xml', 'society', true),

-- healthカテゴリ（健康・医療関連）専用ソース
('日経メディカル', 'https://medical.nikkeibp.co.jp/rss/index.rdf', 'health', true),
('m3.com', 'https://www.m3.com/rss/news.xml', 'health', true),
('ケアネット', 'https://www.carenet.com/rss/news.xml', 'health', true),

-- environmentカテゴリ（環境・気候関連）専用ソース
('環境ビジネスオンライン', 'https://www.kankyo-business.jp/rss/index.xml', 'environment', true),
('EICネット', 'https://www.eic.or.jp/rss/news.xml', 'environment', true),
('グリーンズ', 'https://greenz.jp/feed/', 'environment', true),

-- lifestyleカテゴリ（ライフスタイル関連）専用ソース
('マイナビニュース', 'https://news.mynavi.jp/rss/index.xml', 'lifestyle', true),
('ライフハッカー', 'https://www.lifehacker.jp/feed/index.xml', 'lifestyle', true),
('ELLE Japan', 'https://www.elle.com/jp/feed/', 'lifestyle', true),

-- politicsカテゴリ（政治・国際関連）専用ソース
('Reuters Japan', 'https://jp.reuters.com/rssFeed/japanNews', 'politics', true),
('BBC News Japan', 'https://www.bbc.com/japanese/index.xml', 'politics', true),
('CNN Japan', 'https://www.cnn.co.jp/rss/index.xml', 'politics', true),
('AFP BB News', 'https://www.afpbb.com/rss/index.xml', 'politics', true),
('Bloomberg Japan', 'https://www.bloomberg.co.jp/feed.xml', 'politics', true); 
-- 無効なRSSソースを削除
DELETE FROM rss_sources WHERE rss_url IN (
  'https://business.nikkei.com/rss/index.rdf',
  'https://diamond.jp/rss/diamond.xml',
  'https://medical.nikkeibp.co.jp/rss/index.rdf',
  'https://www.m3.com/rss/news.xml',
  'https://www.natureasia.com/ja-jp/nature/current-issue/rss',
  'https://www.science.org/rss/news_current.xml',
  'https://www.scientificamerican.com/japanese/rss.xml',
  'https://www.carenet.com/rss/news.xml',
  'https://www.kyobun.co.jp/rss/index.rdf',
  'https://benesse.jp/rss/index.rdf',
  'https://www.fashion-press.net/rss/index.rdf',
  'https://www.vogue.co.jp/rss/index.rdf',
  'https://www.elle.com/jp/rss/index.rdf',
  'https://www.kankyo-business.jp/rss/index.rdf',
  'https://www.eic.or.jp/rss/index.rdf'
);

-- 有効なRSSソースを追加
INSERT INTO rss_sources (source_name, rss_url, category) VALUES
-- businessカテゴリ（更新）
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'business'),
('NHK 経済', 'https://www3.nhk.or.jp/rss/news/cat3.xml', 'business'),

-- healthカテゴリ（更新）
('NHK 健康', 'https://www3.nhk.or.jp/rss/news/cat6.xml', 'health'),
('朝日新聞 健康', 'https://rss.asahi.com/rss/asahi/health.rdf', 'health'),

-- scienceカテゴリ（更新）
('NHK 科学', 'https://www3.nhk.or.jp/rss/news/cat7.xml', 'science'),
('朝日新聞 科学', 'https://rss.asahi.com/rss/asahi/science.rdf', 'science'),

-- educationカテゴリ（更新）
('リセマム', 'https://resemom.jp/rss/index.rdf', 'education'),
('NHK 教育', 'https://www3.nhk.or.jp/rss/news/cat8.xml', 'education'),

-- lifestyleカテゴリ（更新）
('NHK ライフ', 'https://www3.nhk.or.jp/rss/news/cat9.xml', 'lifestyle'),

-- environmentカテゴリ（更新）
('NHK 環境', 'https://www3.nhk.or.jp/rss/news/cat5.xml', 'environment'); 
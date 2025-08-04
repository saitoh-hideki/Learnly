-- RSSソースの初期データを挿入
INSERT INTO rss_sources (source_name, rss_url, category) VALUES
-- technologyカテゴリ
('ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/topstory.xml', 'technology'),
('CNET Japan', 'https://japan.cnet.com/rss/index.rdf', 'technology'),
('GIGAZINE', 'https://gigazine.net/news/rss_2.0/', 'technology'),
('ZDNet Japan', 'https://japan.zdnet.com/rss/index.rdf', 'technology'),
('Engadget Japan', 'https://japanese.engadget.com/rss.xml', 'technology'),

-- scienceカテゴリ
('Nature Japan', 'https://www.natureasia.com/ja-jp/nature/current-issue/rss', 'science'),
('Science Japan', 'https://www.science.org/rss/news_current.xml', 'science'),
('Scientific American Japan', 'https://www.scientificamerican.com/japanese/rss.xml', 'science'),

-- businessカテゴリ
('日経ビジネス', 'https://business.nikkei.com/rss/index.rdf', 'business'),
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'business'),
('ダイヤモンドオンライン', 'https://diamond.jp/rss/diamond.xml', 'business'),

-- healthカテゴリ
('日経メディカル', 'https://medical.nikkeibp.co.jp/rss/index.rdf', 'health'),
('m3.com', 'https://www.m3.com/rss/news.xml', 'health'),
('ケアネット', 'https://www.carenet.com/rss/news.xml', 'health'),

-- societyカテゴリ
('NHKニュース', 'https://www3.nhk.or.jp/rss/news/cat0.xml', 'society'),
('朝日新聞', 'https://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'society'),
('読売新聞', 'https://www.yomiuri.co.jp/rss/index.xml', 'society'),

-- politicsカテゴリ
('時事ドットコム', 'https://www.jiji.com/rss/index.rdf', 'politics'),
('産経ニュース', 'https://www.sankei.com/rss/index.rdf', 'politics'),

-- economicsカテゴリ
('日経電子版', 'https://www.nikkei.com/rss/index.rdf', 'economics'),
('ロイター', 'https://jp.reuters.com/rss/index.rdf', 'economics'),
('ブルームバーグ', 'https://www.bloomberg.co.jp/rss/index.rdf', 'economics'),

-- environmentカテゴリ
('環境ビジネスオンライン', 'https://www.kankyo-business.jp/rss/index.rdf', 'environment'),
('EICネット', 'https://www.eic.or.jp/rss/index.rdf', 'environment'),

-- educationカテゴリ
('リセマム', 'https://resemom.jp/rss/index.rdf', 'education'),
('教育新聞', 'https://www.kyobun.co.jp/rss/index.rdf', 'education'),
('ベネッセ教育情報サイト', 'https://benesse.jp/rss/index.rdf', 'education'),

-- lifestyleカテゴリ
('FASHION PRESS', 'https://www.fashion-press.net/rss/index.rdf', 'lifestyle'),
('VOGUE JAPAN', 'https://www.vogue.co.jp/rss/index.rdf', 'lifestyle'),
('ELLE JAPAN', 'https://www.elle.com/jp/rss/index.rdf', 'lifestyle'); 
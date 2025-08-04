-- RSSソース管理テーブル
create table rss_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,         -- 表示名（例：ITmedia）
  rss_url text not null,            -- RSSのURL
  category text not null,            -- カテゴリ（例："technology"）
  active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- インデックスを作成
create index idx_rss_sources_category on rss_sources(category);
create index idx_rss_sources_active on rss_sources(active);

-- 初期データを挿入（technologyカテゴリ）
insert into rss_sources (source_name, rss_url, category) values
('ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/topstory.xml', 'technology'),
('CNET Japan', 'https://japan.cnet.com/rss/index.rdf', 'technology'),
('GIGAZINE', 'https://gigazine.net/news/rss_2.0/', 'technology'),
('ZDNet Japan', 'https://japan.zdnet.com/rss/index.rdf', 'technology'),
('Engadget Japan', 'https://japanese.engadget.com/rss.xml', 'technology');

-- scienceカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('Nature Japan', 'https://www.natureasia.com/ja-jp/nature/current-issue/rss', 'science'),
('Science Japan', 'https://www.science.org/rss/news_current.xml', 'science'),
('Scientific American Japan', 'https://www.scientificamerican.com/japanese/rss.xml', 'science');

-- businessカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('日経ビジネス', 'https://business.nikkei.com/rss/index.rdf', 'business'),
('東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'business'),
('ダイヤモンドオンライン', 'https://diamond.jp/rss/diamond.xml', 'business');

-- healthカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('日経メディカル', 'https://medical.nikkeibp.co.jp/rss/index.rdf', 'health'),
('m3.com', 'https://www.m3.com/rss/news.xml', 'health'),
('ケアネット', 'https://www.carenet.com/rss/news.xml', 'health');

-- societyカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('NHKニュース', 'https://www3.nhk.or.jp/rss/news/cat0.xml', 'society'),
('朝日新聞', 'https://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'society'),
('読売新聞', 'https://www.yomiuri.co.jp/rss/index.xml', 'society');

-- politicsカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('時事ドットコム', 'https://www.jiji.com/rss/index.rdf', 'politics'),
('産経ニュース', 'https://www.sankei.com/rss/index.rdf', 'politics');

-- economicsカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('日経電子版', 'https://www.nikkei.com/rss/index.rdf', 'economics'),
('ロイター', 'https://jp.reuters.com/rss/index.rdf', 'economics'),
('ブルームバーグ', 'https://www.bloomberg.co.jp/rss/index.rdf', 'economics');

-- environmentカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('環境ビジネスオンライン', 'https://www.kankyo-business.jp/rss/index.rdf', 'environment'),
('EICネット', 'https://www.eic.or.jp/rss/index.rdf', 'environment');

-- educationカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('リセマム', 'https://resemom.jp/rss/index.rdf', 'education'),
('教育新聞', 'https://www.kyobun.co.jp/rss/index.rdf', 'education'),
('ベネッセ教育情報サイト', 'https://benesse.jp/rss/index.rdf', 'education');

-- lifestyleカテゴリ
insert into rss_sources (source_name, rss_url, category) values
('FASHION PRESS', 'https://www.fashion-press.net/rss/index.rdf', 'lifestyle'),
('VOGUE JAPAN', 'https://www.vogue.co.jp/rss/index.rdf', 'lifestyle'),
('ELLE JAPAN', 'https://www.elle.com/jp/rss/index.rdf', 'lifestyle'); 
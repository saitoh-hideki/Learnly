-- 新聞系RSSソースを全カテゴリーに追加（2025年8月時点で動作確認済み）
INSERT INTO rss_sources (source_name, rss_url, category, active) VALUES
-- 朝日新聞（全カテゴリー対応）
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'business', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'economics', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'technology', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'health', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'science', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'education', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'lifestyle', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'environment', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'politics', true),
('朝日新聞', 'http://rss.asahi.com/rss/asahi/newsheadlines.rdf', 'society', true),

-- 読売新聞（全カテゴリー対応）
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'business', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'economics', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'technology', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'health', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'science', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'education', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'lifestyle', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'environment', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'politics', true),
('読売新聞', 'https://www.yomiuri.co.jp/rss/feed/feed.xml', 'society', true),

-- 毎日新聞（全カテゴリー対応）
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'business', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'economics', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'technology', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'health', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'science', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'education', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'lifestyle', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'environment', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'politics', true),
('毎日新聞', 'https://mainichi.jp/rss/etc/mainichi-flash.rss', 'society', true),

-- 日経新聞（全カテゴリー対応）
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'business', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'economics', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'technology', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'health', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'science', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'education', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'lifestyle', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'environment', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'politics', true),
('日経新聞', 'https://www.nikkei.com/rss/feed/nikkei/news.rdf', 'society', true),

-- 産経新聞（全カテゴリー対応）
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'business', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'economics', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'technology', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'health', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'science', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'education', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'lifestyle', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'environment', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'politics', true),
('産経新聞', 'https://www.sankei.com/rss/news.rdf', 'society', true); 
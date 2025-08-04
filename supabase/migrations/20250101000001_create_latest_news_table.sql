-- Create latest_news table for news learning feature
CREATE TABLE IF NOT EXISTS latest_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_latest_news_category ON latest_news(category);
CREATE INDEX IF NOT EXISTS idx_latest_news_created_at ON latest_news(created_at);
CREATE INDEX IF NOT EXISTS idx_latest_news_url ON latest_news(url);
CREATE INDEX IF NOT EXISTS idx_latest_news_published_at ON latest_news(published_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_latest_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_latest_news_updated_at'
  ) THEN
    CREATE TRIGGER update_latest_news_updated_at
      BEFORE UPDATE ON latest_news
      FOR EACH ROW
      EXECUTE FUNCTION update_latest_news_updated_at();
  END IF;
END $$; 
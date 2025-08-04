-- Create saved_news table
CREATE TABLE IF NOT EXISTS saved_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_news_user_id ON saved_news(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_news_category ON saved_news(category);
CREATE INDEX IF NOT EXISTS idx_saved_news_created_at ON saved_news(created_at);

-- Enable Row Level Security
ALTER TABLE saved_news ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved news" ON saved_news
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved news" ON saved_news
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved news" ON saved_news
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved news" ON saved_news
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
    WHERE tgname = 'update_saved_news_updated_at'
  ) THEN
    CREATE TRIGGER update_saved_news_updated_at
      BEFORE UPDATE ON saved_news
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 
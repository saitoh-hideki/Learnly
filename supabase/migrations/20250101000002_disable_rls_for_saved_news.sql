-- Disable RLS for saved_news table to allow anonymous access
ALTER TABLE saved_news DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own saved news" ON saved_news;
DROP POLICY IF EXISTS "Users can insert their own saved news" ON saved_news;
DROP POLICY IF EXISTS "Users can update their own saved news" ON saved_news;
DROP POLICY IF EXISTS "Users can delete their own saved news" ON saved_news; 
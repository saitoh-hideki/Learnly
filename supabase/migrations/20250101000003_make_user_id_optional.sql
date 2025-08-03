-- Make user_id optional in saved_news table
ALTER TABLE saved_news ALTER COLUMN user_id DROP NOT NULL; 
-- Remove sample data from latest_news table
DELETE FROM latest_news WHERE source IN ('TechNews', 'BusinessDaily', 'EducationToday', 'ScienceWeekly', 'HealthMagazine', 'システム');

-- Also remove any entries with empty URLs (placeholder data)
DELETE FROM latest_news WHERE url = '' OR url IS NULL; 
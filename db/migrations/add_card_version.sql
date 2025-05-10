-- Add version column to cards table
ALTER TABLE cards
ADD COLUMN version text;

-- Update existing cards with their version if needed
-- Example for Lorcana cards:
-- UPDATE cards
-- SET version = '...'
-- WHERE game = 'Lorcana' AND name = '...';

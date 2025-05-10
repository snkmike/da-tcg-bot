-- Add version column to card_printings table for Lorcana variant support
ALTER TABLE card_printings ADD COLUMN version text;

-- Optionally, backfill version from cards if needed (example, adjust as needed):
-- UPDATE card_printings cp
-- SET version = c.version
-- FROM cards c
-- WHERE cp.card_id = c.id AND c.version IS NOT NULL;

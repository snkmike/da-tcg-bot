-- Add set_code column to card_printings table
ALTER TABLE card_printings
ADD COLUMN set_code text;

-- Update existing set_code values from sets table if possible
UPDATE card_printings cp
SET set_code = s.code
FROM sets s
WHERE cp.set_id = s.id;

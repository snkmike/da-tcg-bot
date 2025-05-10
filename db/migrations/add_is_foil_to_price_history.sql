-- Add is_foil column to price_history table with a default value of false
ALTER TABLE price_history
ADD COLUMN is_foil boolean DEFAULT false;

-- Update existing records to set is_foil based on related card_printings if possible
UPDATE price_history ph
SET is_foil = uc.is_foil
FROM user_collections uc
WHERE ph.card_printing_id = uc.card_printing_id;

ALTER TABLE sets 
ADD COLUMN code text,
ADD COLUMN version text;

-- Mise à jour des sets existants pour Lorcana
UPDATE sets 
SET code = CASE 
    WHEN name = 'The First Chapter' THEN 'TFC'
    WHEN name = 'Rise of the Floodborn' THEN 'ROF'
    WHEN name = 'Into the Inklands' THEN 'ITI'
    ELSE null
END;

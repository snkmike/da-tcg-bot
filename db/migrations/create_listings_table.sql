-- Création de la table listings
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_printing_id UUID REFERENCES card_printings(id),
    user_id UUID REFERENCES auth.users(id),
    platform VARCHAR(50) NOT NULL,
    platform_listing_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    condition VARCHAR(50) NOT NULL,
    shipping JSONB NOT NULL DEFAULT '{"domestic": 0, "international": 0}',
    views INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index sur les colonnes fréquemment utilisées
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);
CREATE INDEX IF NOT EXISTS listings_platform_idx ON listings(platform);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);

-- RLS Policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own listings"
    ON listings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listings"
    ON listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
    ON listings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
    ON listings FOR DELETE
    USING (auth.uid() = user_id);

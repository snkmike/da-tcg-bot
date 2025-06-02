# 🗄️ Base de Données et Schéma

## Vue d'Ensemble de la Base de Données

**Da TCG Bot** utilise **Supabase** (PostgreSQL) comme backend principal avec une architecture optimisée pour les collections de cartes et le marketplace.

## 📊 Schéma de Base de Données

### 🃏 Tables Cartes et Référentiels

#### `cards` - Données Cartes Principales
```sql
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    lorcana_id VARCHAR UNIQUE,        -- ID Lorcast
    cost INTEGER,                     -- Coût d'encre
    inkable BOOLEAN DEFAULT FALSE,    -- Peut être transformée en encre
    rarity VARCHAR,                   -- Common, Uncommon, Rare, etc.
    card_type VARCHAR,                -- Character, Action, Item, Location
    subtypes VARCHAR[],               -- Sous-types (ex: Hero, Villain)
    abilities TEXT[],                 -- Capacités de la carte
    flavor_text TEXT,                 -- Texte d'ambiance
    artist VARCHAR,                   -- Artiste
    franchise VARCHAR DEFAULT 'Lorcana', -- Franchise (extensibilité)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_lorcana_id ON cards(lorcana_id);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_type ON cards(card_type);
```

#### `sets` - Extensions et Sets
```sql
CREATE TABLE sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    code VARCHAR UNIQUE NOT NULL,     -- Ex: TFC, ROF, ITI
    release_date DATE,
    total_cards INTEGER,
    franchise VARCHAR DEFAULT 'Lorcana',
    set_type VARCHAR DEFAULT 'expansion', -- expansion, promo, etc.
    symbol_url VARCHAR,               -- URL du symbole du set
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sets_code ON sets(code);
CREATE INDEX idx_sets_release_date ON sets(release_date);
```

#### `card_printings` - Versions/Impressions de Cartes
```sql
CREATE TABLE card_printings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    set_id UUID REFERENCES sets(id) ON DELETE CASCADE,
    collector_number VARCHAR NOT NULL, -- Numéro dans l'extension
    version VARCHAR,                   -- Normal, Foil, Promo, etc.
    set_code VARCHAR,                  -- Code du set (dénormalisé pour perf)
    image_url VARCHAR,                 -- URL image haute résolution
    image_thumbnail_url VARCHAR,       -- URL miniature
    tcgplayer_id VARCHAR,             -- ID TCGPlayer si applicable
    cardtrader_blueprint_id INTEGER,   -- ID Blueprint CardTrader
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(card_id, set_id, collector_number, version)
);

CREATE INDEX idx_card_printings_card_id ON card_printings(card_id);
CREATE INDEX idx_card_printings_set_id ON card_printings(set_id);
CREATE INDEX idx_card_printings_collector_number ON card_printings(collector_number);
CREATE INDEX idx_card_printings_blueprint_id ON card_printings(cardtrader_blueprint_id);
```

### 👤 Tables Utilisateur et Collections

#### `collections` - Collections Utilisateur
```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,   -- Collection publique/privée
    tags VARCHAR[],                    -- Tags personnalisés
    total_value DECIMAL(10,2) DEFAULT 0, -- Valeur totale calculée
    total_cards INTEGER DEFAULT 0,     -- Nombre total de cartes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_public ON collections(is_public);
```

#### `user_collections` - Cartes dans Collections
```sql
CREATE TABLE user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    card_printing_id UUID REFERENCES card_printings(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    condition VARCHAR DEFAULT 'Near Mint', -- Near Mint, Lightly Played, etc.
    language VARCHAR DEFAULT 'English',    -- Langue de la carte
    foil BOOLEAN DEFAULT FALSE,            -- Version foil
    signed BOOLEAN DEFAULT FALSE,          -- Carte signée
    altered BOOLEAN DEFAULT FALSE,         -- Carte altérée
    tags VARCHAR[],                        -- Tags personnalisés
    notes TEXT,                           -- Notes utilisateur
    acquired_date DATE,                   -- Date d'acquisition
    acquired_price DECIMAL(10,2),        -- Prix d'achat
    current_price DECIMAL(10,2),         -- Prix actuel estimé
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(collection_id, card_printing_id, condition, language, foil)
);

CREATE INDEX idx_user_collections_collection_id ON user_collections(collection_id);
CREATE INDEX idx_user_collections_card_printing_id ON user_collections(card_printing_id);
CREATE INDEX idx_user_collections_foil ON user_collections(foil);
CREATE INDEX idx_user_collections_condition ON user_collections(condition);
```

### 💰 Tables Prix et Marketplace

#### `price_history` - Historique des Prix
```sql
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_printing_id UUID REFERENCES card_printings(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    condition VARCHAR DEFAULT 'Near Mint',
    is_foil BOOLEAN DEFAULT FALSE,
    source VARCHAR NOT NULL,           -- JustTCG, CardTrader, TCGPlayer
    currency VARCHAR DEFAULT 'EUR',    -- Devise
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_price_history_card_printing_id ON price_history(card_printing_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX idx_price_history_source ON price_history(source);
CREATE INDEX idx_price_history_foil ON price_history(is_foil);
```

#### `listings` - Listings CardTrader
```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_printing_id UUID REFERENCES card_printings(id) ON DELETE CASCADE,
    cardtrader_listing_id VARCHAR UNIQUE, -- ID listing sur CardTrader
    blueprint_id INTEGER NOT NULL,        -- Blueprint ID CardTrader
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    condition VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    foil BOOLEAN DEFAULT FALSE,
    signed BOOLEAN DEFAULT FALSE,
    altered BOOLEAN DEFAULT FALSE,
    user_data_field TEXT,              -- Champ données utilisateur
    status VARCHAR DEFAULT 'active',    -- active, sold, expired, cancelled
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_cardtrader_id ON listings(cardtrader_listing_id);
CREATE INDEX idx_listings_blueprint_id ON listings(blueprint_id);
CREATE INDEX idx_listings_status ON listings(status);
```

## 🔐 Sécurité Row Level Security (RLS)

### Politiques de Sécurité

#### Collections et Cartes Utilisateur
```sql
-- Les utilisateurs ne peuvent voir que leurs propres collections
CREATE POLICY "Users can view own collections" ON collections
    FOR ALL USING (auth.uid() = user_id);

-- Les utilisateurs peuvent voir les collections publiques
CREATE POLICY "Users can view public collections" ON collections
    FOR SELECT USING (is_public = true);

-- Les utilisateurs ne peuvent modifier que leurs cartes
CREATE POLICY "Users can manage own collection cards" ON user_collections
    FOR ALL USING (
        collection_id IN (
            SELECT id FROM collections WHERE user_id = auth.uid()
        )
    );
```

#### Listings et Prix
```sql
-- Les utilisateurs ne gèrent que leurs propres listings
CREATE POLICY "Users can manage own listings" ON listings
    FOR ALL USING (auth.uid() = user_id);

-- L'historique des prix est en lecture seule pour tous
CREATE POLICY "Price history is read-only" ON price_history
    FOR SELECT USING (true);
```

## 📊 Vues et Fonctions Utiles

### Vue Collection Enrichie
```sql
CREATE VIEW collection_cards_view AS
SELECT 
    uc.id,
    uc.collection_id,
    uc.quantity,
    uc.condition,
    uc.language,
    uc.foil,
    uc.current_price,
    c.name as card_name,
    c.rarity,
    c.card_type,
    s.name as set_name,
    s.code as set_code,
    cp.collector_number,
    cp.image_url,
    (uc.quantity * uc.current_price) as total_value
FROM user_collections uc
JOIN card_printings cp ON uc.card_printing_id = cp.id
JOIN cards c ON cp.card_id = c.id
JOIN sets s ON cp.set_id = s.id;
```

### Fonction Calcul Valeur Collection
```sql
CREATE OR REPLACE FUNCTION calculate_collection_value(collection_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(quantity * current_price), 0)
        FROM user_collections 
        WHERE collection_id = collection_uuid
    );
END;
$$ LANGUAGE plpgsql;
```

### Fonction Mise à Jour Statistiques
```sql
CREATE OR REPLACE FUNCTION update_collection_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE collections SET 
        total_cards = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM user_collections 
            WHERE collection_id = NEW.collection_id
        ),
        total_value = calculate_collection_value(NEW.collection_id),
        updated_at = NOW()
    WHERE id = NEW.collection_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger automatique sur modifications
CREATE TRIGGER trigger_update_collection_stats
    AFTER INSERT OR UPDATE OR DELETE ON user_collections
    FOR EACH ROW EXECUTE FUNCTION update_collection_stats();
```

## 🔄 Migrations et Évolutions

### Script de Migration Type
```sql
-- Migration: Ajouter support multi-langue
ALTER TABLE cards ADD COLUMN name_translations JSONB;

-- Index pour recherche multi-langue
CREATE INDEX idx_cards_name_translations ON cards USING GIN(name_translations);

-- Mise à jour des données existantes
UPDATE cards SET name_translations = jsonb_build_object('en', name);
```

### Sauvegarde et Restauration
```bash
# Sauvegarde complète
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup.sql

# Sauvegarde données uniquement
pg_dump -h db.project.supabase.co -U postgres -d postgres --data-only > data_backup.sql

# Restauration
psql -h db.project.supabase.co -U postgres -d postgres < backup.sql
```

## 📈 Optimisation et Performance

### Index Recommandés
```sql
-- Index composites pour requêtes fréquentes
CREATE INDEX idx_user_collections_search ON user_collections(collection_id, foil, condition);
CREATE INDEX idx_price_history_latest ON price_history(card_printing_id, recorded_at DESC);
CREATE INDEX idx_listings_active ON listings(status, blueprint_id) WHERE status = 'active';
```

### Requêtes Optimisées
```sql
-- Recherche rapide dans collection avec pagination
SELECT * FROM collection_cards_view 
WHERE collection_id = $1 
    AND (card_name ILIKE $2 OR set_name ILIKE $2)
ORDER BY set_code, collector_number
LIMIT 50 OFFSET $3;

-- Top cartes par valeur
SELECT card_name, set_name, total_value, quantity
FROM collection_cards_view 
WHERE collection_id = $1
ORDER BY total_value DESC
LIMIT 10;
```

## 🚀 Scripts d'Administration

### Nettoyage des Données
```sql
-- Supprimer anciens historiques de prix (> 1 an)
DELETE FROM price_history 
WHERE recorded_at < NOW() - INTERVAL '1 year';

-- Nettoyer listings expirés
UPDATE listings SET status = 'expired' 
WHERE expires_at < NOW() AND status = 'active';
```

### Statistiques Base
```sql
-- Statistiques générales
SELECT 
    (SELECT COUNT(*) FROM cards) as total_cards,
    (SELECT COUNT(*) FROM collections) as total_collections,
    (SELECT COUNT(*) FROM user_collections) as total_collection_items,
    (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings;
```

---

## 📚 Documentation Connexe

### Configuration et Déploiement
- [🚀 Installation](./02-INSTALLATION-GUIDE.md) - Configuration Supabase et migrations
- [🌐 Déploiement](./deployment/DEPLOYMENT.md) - Base de données en production
- [💻 Développement](./05-DEVELOPMENT.md) - Scripts et outils de base de données

### Architecture et APIs
- [🏗️ Architecture](./03-ARCHITECTURE.md) - Flux de données et intégrations
- [🔌 APIs](./06-APIS.md) - Interactions avec les APIs externes
- [🐛 Troubleshooting](./troubleshooting/TROUBLESHOOTING.md) - Problèmes de base de données

### Fonctionnalités
- [🛒 Listings CardTrader](./features/CARDTRADER-LISTINGS.md) - Utilisation des tables listings
- [📊 Vue d'ensemble](./01-PROJECT-OVERVIEW.md) - Contexte fonctionnel des données

---

**Base de données robuste supportant toutes les fonctionnalités actuelles et futures de Da TCG Bot avec des performances optimisées.**

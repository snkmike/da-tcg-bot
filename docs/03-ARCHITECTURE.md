# 🏗️ Architecture Technique

## Vue d'Ensemble de l'Architecture

**Da TCG Bot** utilise une architecture moderne en 3 couches avec des proxies API dédiés pour optimiser les performances et la sécurité.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Proxies API    │────▶│  APIs Externes  │
│   React + Vite  │     │   Node.js        │     │  (CardTrader,   │
│                 │     │   Ports 8010,    │     │   Lorcast,      │
│                 │     │   8020, 8021     │     │   JustTCG)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │
│   Supabase      │
│   (PostgreSQL + │
│    Auth + API)  │
└─────────────────┘
```

## 🎨 Couche Frontend

### Technologies Principales
- **React 18** : Interface utilisateur avec hooks modernes
- **Vite 4** : Build tool et dev server ultra-rapide
- **Tailwind CSS** : Styling utility-first
- **React Router** : Navigation SPA

### Structure des Composants

```
📂 src/components/
├── 🔐 auth/          # Authentification Supabase
├── 📚 collection/    # Gestion collections
├── 🛒 listings/      # Interface CardTrader
├── 🔍 search/        # Recherche unifiée
├── 🃏 cards/         # Affichage cartes
├── 💰 price/         # Suivi prix
├── 🎛️ ui/           # Composants réutilisables
└── 🌐 common/        # Composants partagés
```

### Gestion d'État
- **React Hooks** : `useState`, `useEffect`, `useContext`
- **Custom Hooks** : Logique métier réutilisable
- **Supabase Real-time** : Synchronisation temps réel

### Routing et Navigation
```javascript
// src/app/routes.jsx
const routes = [
  { path: '/', component: DashboardTab },
  { path: '/collection', component: MyCollectionTab },
  { path: '/search', component: SearchTab },
  { path: '/listings', component: ListingsTab },
  { path: '/price', component: PriceTab }
]
```

## 🔄 Couche Proxies API

### Architecture des Proxies

Les proxies API servent d'intermédiaires sécurisés entre le frontend et les APIs externes, permettant :
- **Gestion des CORS** : Résolution des restrictions cross-origin
- **Authentification centralisée** : Tokens API gérés côté serveur
- **Cache intelligent** : Réduction des appels API redondants
- **Rate limiting** : Protection contre les limites d'API
- **Transformation des données** : Normalisation des réponses

### Proxy CardTrader (Port 8021)
```javascript
// server/cardtrader-proxy.mjs
const express = require('express');
const app = express();

// Endpoints principaux
app.get('/games', handleGames);           // Liste des jeux
app.get('/expansions/:gameId', handleExpansions);  // Extensions
app.get('/blueprints/:expansionId', handleBlueprints);  // Cartes vendables
app.post('/listings', handleCreateListing);  // Création listings
app.get('/listings', handleGetListings);     // Listings utilisateur

// Cache intelligent
const cache = new Map();
const CACHE_TTL = 3600000; // 1 heure
```

### Proxy Lorcast (Port 8020)
```javascript
// server/lorcast-proxy.mjs
// API Lorcana pour données cartes et sets
app.get('/cards', handleCardSearch);     // Recherche cartes
app.get('/sets', handleSets);           // Liste des sets
app.get('/cards/:id', handleCardDetail); // Détail carte
```

### Proxy JustTCG (Port 8010)
```javascript
// justtcg-proxy.mjs
// API prix du marché
app.get('/prices/:cardName', handlePrices);  // Prix par nom
app.post('/prices/batch', handleBatchPrices); // Prix en lot
```

## 🗄️ Couche Backend (Supabase)

### Base de Données PostgreSQL

#### Tables Principales
```sql
-- Cartes et données de référence
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  lorcana_id VARCHAR UNIQUE,
  cost INTEGER,
  inkable BOOLEAN,
  rarity VARCHAR,
  card_type VARCHAR,
  abilities TEXT[]
);

-- Sets et extensions
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE,
  release_date DATE,
  total_cards INTEGER
);

-- Impressions de cartes (versions)
CREATE TABLE card_printings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id),
  set_id UUID REFERENCES sets(id),
  collector_number VARCHAR,
  version VARCHAR,
  image_url VARCHAR
);

-- Collections utilisateur
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cartes dans collections
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id),
  card_printing_id UUID REFERENCES card_printings(id),
  quantity INTEGER DEFAULT 1,
  condition VARCHAR DEFAULT 'Near Mint',
  language VARCHAR DEFAULT 'English',
  foil BOOLEAN DEFAULT FALSE,
  tags TEXT[]
);

-- Historique des prix
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_printing_id UUID REFERENCES card_printings(id),
  price DECIMAL(10,2),
  source VARCHAR,
  is_foil BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings CardTrader
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  card_printing_id UUID REFERENCES card_printings(id),
  cardtrader_listing_id VARCHAR,
  blueprint_id INTEGER,
  price DECIMAL(10,2),
  quantity INTEGER,
  condition VARCHAR,
  language VARCHAR,
  foil BOOLEAN,
  status VARCHAR DEFAULT 'active'
);
```

### Authentification et Sécurité
- **Supabase Auth** : Gestion complète des utilisateurs
- **Row Level Security (RLS)** : Sécurité au niveau des lignes
- **JWT Tokens** : Authentification stateless
- **Politiques d'accès** : Contrôle granulaire des permissions

### APIs Auto-générées
Supabase génère automatiquement des APIs REST et GraphQL basées sur le schéma de base de données.

## 🔌 Intégrations Externes

### CardTrader API
- **Blueprints** : Cartes vendables avec métadonnées
- **Listings** : Création et gestion d'annonces
- **Orders** : Gestion des commandes
- **Rate Limits** : 1000 requêtes/heure

### Lorcast API
- **Cards Endpoint** : Base de données cartes Lorcana
- **Sets Endpoint** : Informations sur les extensions
- **High-res Images** : Images cartes haute qualité

### JustTCG API  
- **Price Data** : Prix du marché en temps réel
- **Historical Data** : Historique des prix
- **Foil Detection** : Différenciation foil/non-foil

## 🚀 Déploiement et DevOps

### Environnement de Développement
```bash
# Frontend Vite Dev Server
npm run dev                    # Port 3000 (HTTPS)

# Proxies API
node server/cardtrader-proxy.mjs  # Port 8021
node server/lorcast-proxy.mjs     # Port 8020  
node justtcg-proxy.mjs            # Port 8010
```

### Configuration HTTPS Locale
- **Certificats SSL** : Générés pour `dev.tcgbot.local`
- **Hosts File** : Redirection `127.0.0.1 dev.tcgbot.local`
- **Script Start** : `scripts/start-https.js`

### Build et Production
```bash
npm run build      # Build optimisé
npm run preview    # Preview du build
```

## 📊 Performance et Optimisation

### Frontend
- **Code Splitting** : Chargement paresseux des composants
- **Tree Shaking** : Élimination du code mort
- **Asset Optimization** : Compression images et CSS
- **Service Worker** : Cache intelligent

### Backend
- **Indexation DB** : Index optimisés pour les requêtes fréquentes
- **Connection Pooling** : Gestion efficace des connexions
- **Query Optimization** : Requêtes SQL optimisées

### APIs
- **Cache Stratégique** : Cache des données statiques
- **Batch Requests** : Regroupement des requêtes
- **Compression** : GZIP sur toutes les réponses

## 🔍 Monitoring et Debugging

### Logs
- **Frontend** : Console développeur + Sentry
- **Proxies** : Logs structurés avec timestamps
- **Database** : Logs Supabase intégrés

### Métriques
- **Performance** : Web Vitals + Lighthouse
- **Erreurs** : Tracking automatique des erreurs
- **Usage** : Analytics d'utilisation des features

## 🛡️ Sécurité

### Authentification
- **Multi-factor Auth** : Support 2FA via Supabase
- **Session Management** : Gestion sécurisée des sessions
- **Password Policies** : Politiques de mots de passe

### Données
- **Encryption at Rest** : Chiffrement base de données
- **HTTPS Everywhere** : Chiffrement en transit
- **API Keys Management** : Stockage sécurisé des clés

### Infrastructure
- **CORS Policies** : Configuration stricte des CORS
- **Rate Limiting** : Protection contre les abus
- **Input Validation** : Validation côté client et serveur

---

## 📚 Documentation Connexe

### Approfondissement Technique
- [💾 Base de Données](./04-DATABASE.md) - Schéma Supabase et migrations détaillées
- [🔌 APIs et Intégrations](./06-APIS.md) - Documentation détaillée des proxies
- [💻 Configuration de Développement](./05-DEVELOPMENT.md) - Scripts et workflow

### Fonctionnalités Spécialisées
- [🛒 Listings CardTrader](./features/CARDTRADER-LISTINGS.md) - Processus de création marketplace
- [🔍 Recherche Unifiée](./01-PROJECT-OVERVIEW.md#recherche-unifiée) - Système multi-API

### Opérations
- [🚀 Installation](./02-INSTALLATION-GUIDE.md) - Configuration environnement
- [🌐 Déploiement](./deployment/DEPLOYMENT.md) - Mise en production
- [🐛 Troubleshooting](./troubleshooting/TROUBLESHOOTING.md) - Résolution problèmes architecture

---

*Architecture maintenue et documentée pour Da TCG Bot v2025*

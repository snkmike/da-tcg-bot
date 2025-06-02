# Documentation Technique : Da TCG Bot

## 1. Introduction

### 1.1. Objectif du Projet
Da TCG Bot est une application web spécialisée dans l'écosystème **Lorcana** avec intégration **CardTrader**. Elle offre aux collectionneurs une plateforme unifiée pour :
- Gérer leurs collections de cartes Lorcana
- Effectuer des recherches unifiées (Lorcana + CardTrader)
- Créer et gérer des listings sur le marketplace CardTrader
- Suivre les prix et valeurs des cartes
- Importer/exporter des collections

L'application se concentre principalement sur Lorcana avec des fonctionnalités de marketplace avancées via CardTrader.

### 1.2. Architecture de Haut Niveau
L'application est structurée comme suit :
*   **Frontend :** Single Page Application (SPA) React + Vite avec interface moderne et responsive
*   **Backend :** Supabase (PostgreSQL + Auth + API temps réel)
*   **Proxies API :** Trois serveurs proxy Node.js indépendants pour les API externes
*   **Développement HTTPS :** Configuration complète pour développement local sécurisé
*   **Système de Collections :** Gestion avancée des collections avec tags, filtres et groupements

## 2. Démarrage Rapide

### 2.1. Prérequis
*   **Node.js** (version LTS 18+ recommandée)
*   **npm** (inclus avec Node.js)
*   **Compte Supabase** et projet configuré
*   **Token API CardTrader** pour les fonctionnalités marketplace
*   **Git** pour cloner le repository

### 2.2. Installation
```bash
git clone <url_du_repository>
cd da-tcg-bot
npm install
```

### 2.3. Configuration Environnement
Créez un fichier `.env.local` à la racine :
```env
# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# CardTrader API
REACT_APP_CARDTRADER_API_TOKEN=votre_token_cardtrader
VITE_CARDTRADER_API_TOKEN=votre_token_cardtrader

# APIs externes (optionnel)
JUSTTCG_API_KEY=votre_cle_justtcg
LORCAST_API_KEY=votre_cle_lorcast

# Développement HTTPS
VITE_SITE_URL=https://dev.tcgbot.local:3000
```

### 2.4. Démarrage des Proxies API
L'application nécessite **trois proxies** qui doivent être démarrés en parallèle :

```bash
# Terminal 1 - CardTrader Proxy (port 8021)
node server/cardtrader-proxy.mjs

# Terminal 2 - Lorcast Proxy (port 8020)  
node server/lorcast-proxy.mjs

# Terminal 3 - JustTCG Proxy (port 8010)
node justtcg-proxy.mjs
```

### 2.5. Lancement de l'Application

**Option 1 - Développement standard :**
```bash
npm run dev
```

**Option 2 - Développement HTTPS (recommandé) :**
```bash
npm run start
```

#### Configuration HTTPS Local
1. **Fichier hosts :** Ajoutez `127.0.0.1 dev.tcgbot.local` à votre fichier hosts
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - macOS/Linux: `/etc/hosts`

2. **Certificats :** Les certificats `dev.tcgbot.local-key.pem` et `dev.tcgbot.local.pem` sont fournis

3. **Accès :** `https://dev.tcgbot.local:3000`

### 2.6. Migrations Base de Données
Appliquez les migrations SQL (dossier `/db/migrations`) via Supabase Studio ou CLI :
```sql
-- Exemples de migrations importantes
-- add_card_version.sql
-- create_listings_table.sql  
-- add_is_foil_to_price_history.sql
```

## 3. Structure Détaillée du Projet

### 3.1. Racine du Projet
```
📂 da-tcg-bot/
├── 📄 package.json              # Dépendances et scripts npm
├── ⚙️ vite.config.js            # Configuration Vite (HTTPS, proxies, build)
├── 🎨 tailwind.config.js        # Configuration Tailwind CSS
├── 📝 postcss.config.js         # Configuration PostCSS
├── 🌐 index.html                # Point d'entrée HTML
├── 🔐 dev.tcgbot.local-key.pem  # Clé privée SSL développement
├── 🔐 dev.tcgbot.local.pem      # Certificat SSL développement
├── 🔄 justtcg-proxy.mjs         # Proxy API JustTCG (port 8010)
└── 📋 copy-public.js            # Script de copie des assets
```

### 3.2. Répertoire `/src` - Code Source Principal
```
📂 src/
├── 🚀 index.jsx                 # Point d'entrée React
├── 🔧 supabaseClient.js         # Configuration client Supabase
├── 🛠️ cra-compat.js            # Couche compatibilité CRA/Vite
├── 🎨 index.css                 # Styles globaux
└── 📁 app/                      # Application principale
    ├── App.jsx                  # Composant racine + layout
    ├── routes.jsx               # Configuration des routes
    ├── tabsState.js            # Gestion état des onglets
    └── useAppState.js          # Hook état global application
```

### 3.3. Composants par Fonctionnalité
```
📂 src/components/
├── 🔐 auth/                     # Authentification
│   └── Auth.jsx
├── 👤 account/                  # Gestion compte utilisateur
│   └── MyAccountTab.jsx
├── 🃏 cards/                    # Affichage et gestion cartes
│   ├── CardDetail.jsx
│   ├── CardGroup.jsx
│   ├── CardItem.jsx
│   ├── CardResult.jsx
│   ├── CardSearchResult.jsx
│   ├── CollectionCardItem.jsx
│   ├── SearchCardItem.jsx
│   ├── SetResult.jsx
│   └── SetSearchResult.jsx
├── 📚 collection/               # Gestion collections
│   ├── CollectionDetails.jsx
│   ├── CollectionList.jsx
│   ├── MyCollectionTab.jsx
│   ├── ModalImportCollection.jsx
│   ├── groupCards.js           # Logique groupement cartes
│   ├── useCardSelection.js     # Hook sélection cartes
│   └── useCollectionData.js    # Hook données collections
├── 🛒 listings/                # Marketplace CardTrader
│   ├── ListingsTab.jsx         # Interface principale listings
│   ├── CreateListingModal.jsx  # Création nouveaux listings
│   └── CardTraderTest.jsx      # Tests API CardTrader
├── 🔍 search/                  # Recherche unifiée
├── 🔍 search-new/              # Nouvelle interface recherche
├── 💰 price/                   # Suivi des prix
├── 🏷️ tags/                    # Système de tags
├── 🎛️ ui/                      # Composants UI réutilisables
├── 🔧 utils/                   # Utilitaires composants
└── 🌐 common/                  # Composants partagés
    ├── CollectionSelector.jsx
    └── Toast.jsx
```

### 3.4. Configuration et Utilitaires
```
📂 src/
├── 📁 config/
│   └── cardTraderConfig.js     # Configuration API CardTrader
├── 📁 utils/
│   ├── cardTraderUtils.js      # Utilitaires CardTrader
│   └── 📁 api/                 # Services API
│       ├── cardTraderAPI.js    # Client API CardTrader
│       └── fetchLorcanaData.js # Client API Lorcana
├── 📁 contexts/                # Contextes React
├── 📁 hooks/                   # Hooks personnalisés
├── 📁 data/                    # Données mock/statiques
│   ├── mockCards.js
│   └── mockSets.js
└── 📁 pages/                   # Composants pages niveau haut
```

### 3.5. Infrastructure Serveur
```
📂 server/
├── 🔄 cardtrader-proxy.mjs     # Proxy CardTrader (port 8021)
├── 🔄 lorcast-proxy.mjs        # Proxy Lorcast (port 8020)
└── ⏰ updatePricesDaily.js     # Script mise à jour prix (cron)
```

### 3.6. Scripts et Base de Données
```
📂 scripts/
└── 🚀 start-https.js           # Démarrage développement HTTPS

📂 db/
├── 📊 BasedeDonnee.csv         # Export données CSV
└── 📁 migrations/              # Migrations SQL
    ├── add_card_version.sql
    ├── add_is_foil_to_price_history.sql
    ├── add_set_code_to_card_printings.sql
    ├── add_version_to_card_printings.sql
    └── create_listings_table.sql
```

### 3.7. Documentation
```
📂 docs/
├── 📋 PROJECT_OVERVIEW.md                        # Vue d'ensemble projet
├── 🔧 TECHNICAL_DOCUMENTATION.md                 # Documentation technique
├── 📚 API-Cradtrader-documentation.md           # Docs API CardTrader
├── 📝 API-Cradtrader-documentation-How-to-sell.md
├── 📖 API-lorcast-documentation                  # Docs API Lorcast
└── 🛒 CARDTRADER_LISTINGS_DOCUMENTATION.md      # Guide listings CardTrader
```

## 4. Fonctionnalités et Modules Clés

### 4.1. Authentification Supabase
- **Composant** : `src/components/auth/Auth.jsx`
- **Configuration** : `src/supabaseClient.js`
- **Fonctionnalités** :
  - Connexion/Inscription via email/mot de passe
  - Gestion des sessions utilisateur
  - Authentification persistante entre les sessions
  - Intégration avec les permissions base de données

### 4.2. Recherche Unifiée Lorcana + CardTrader
- **Composants** :
  - `src/components/search/` - Interface de recherche principale
  - `src/components/search-new/` - Nouvelle interface de recherche
  - `src/components/cards/` - Affichage des résultats
- **APIs** :
  - **Lorcast API** via `server/lorcast-proxy.mjs` (port 8020)
  - **CardTrader API** via `server/cardtrader-proxy.mjs` (port 8021)
- **Fonctionnalités** :
  - Recherche simultanée dans Lorcana et CardTrader
  - Filtres avancés (set, rareté, foil, condition)
  - Affichage unifié des résultats avec prix
  - Support des images cartes haute qualité

### 4.3. Gestion de Collections Avancée
- **Composants principaux** :
  - `MyCollectionTab.jsx` - Interface principale collections
  - `CollectionList.jsx` - Liste des collections utilisateur
  - `CollectionDetails.jsx` - Détails d'une collection
  - `ModalImportCollection.jsx` - Import de collections
- **Hooks spécialisés** :
  - `useCollectionData.js` - Gestion données collections
  - `useCardSelection.js` - Sélection multiple cartes
- **Fonctionnalités** :
  - Création/édition/suppression de collections
  - Import/export CSV de collections
  - Groupement intelligent par sets, rareté, version
  - Système de tags personnalisés
  - Calcul automatique de la valeur totale

### 4.4. Marketplace CardTrader Integration
- **Interface** : `src/components/listings/ListingsTab.jsx`
- **Création** : `src/components/listings/CreateListingModal.jsx`
- **Configuration** : `src/config/cardTraderConfig.js`
- **API Client** : `src/utils/api/cardTraderAPI.js`
- **Fonctionnalités** :
  - Navigation dans les jeux et extensions CardTrader
  - Recherche de blueprints (cartes vendables)
  - Création de listings avec validation complète
  - Gestion des propriétés : condition, langue, foil, prix
  - Support CardTrader Zero (expédition automatisée)
  - Test de connexion API et diagnostics

### 4.5. Suivi des Prix JustTCG
- **Proxy** : `justtcg-proxy.mjs` (port 8010)
- **Script automatisé** : `server/updatePricesDaily.js`
- **Base de données** : Table `price_history` avec support foil
- **Fonctionnalités** :
  - Mise à jour quotidienne automatique des prix
  - Historique des prix avec timestamps
  - Différenciation foil/non-foil
  - Calculs de variations de prix

### 4.6. Architecture API et Proxies

#### Proxy CardTrader (Port 8021)
```javascript
// server/cardtrader-proxy.mjs
- Authentification API via token
- Gestion des blueprints et jeux
- CRUD listings complet
- Gestion des erreurs et rate limiting
```

#### Proxy Lorcast (Port 8020)
```javascript
// server/lorcast-proxy.mjs  
- Recherche cartes Lorcana
- Gestion des sets et extensions
- API publique sans authentification
```

#### Proxy JustTCG (Port 8010)
```javascript
// justtcg-proxy.mjs
- Récupération prix cartes
- Authentification via clé API
- Support recherche multi-critères
```

### 4.7. Système de Développement HTTPS
- **Script** : `scripts/start-https.js`
- **Configuration** : Certificats SSL locaux inclus
- **Domaine** : `dev.tcgbot.local:3000`
- **Avantages** :
  - Contexte sécurisé pour APIs externes
  - Test authentification en conditions réelles
  - Debugging des fonctionnalités HTTPS-only

## 5. Base de Données Supabase (PostgreSQL)

### 5.1. Architecture
- **Service** : Supabase (PostgreSQL + Auth + API temps réel)
- **Migrations** : Gérées via fichiers SQL dans `/db/migrations`
- **Accès** : Via `src/supabaseClient.js` côté frontend

### 5.2. Tables Principales

#### Collections et Cartes
```sql
-- Collections utilisateur
collections
├── id (primary key)
├── user_id (foreign key)
├── name
├── description
├── created_at
└── updated_at

-- Cartes dans les collections
collection_cards
├── id (primary key)
├── collection_id (foreign key)
├── card_id (foreign key)
├── quantity
├── is_foil (boolean)
├── condition
├── notes
└── added_at

-- Informations cartes
cards
├── id (primary key)
├── name
├── set_code
├── rarity
├── type
├── cost
├── image_url
└── lorcast_id

-- Extensions/Sets
sets
├── id (primary key)
├── code
├── name
├── release_date
└── card_count
```

#### Système de Prix
```sql
-- Historique des prix
price_history
├── id (primary key)
├── card_id (foreign key)
├── price
├── currency
├── is_foil (boolean)
├── source (JustTCG, CardTrader, etc.)
├── timestamp
└── condition

-- Impressions de cartes
card_printings
├── id (primary key)
├── card_id (foreign key)
├── set_code
├── version
├── is_foil_available
└── rarity_specific
```

#### Marketplace CardTrader
```sql
-- Listings sur CardTrader
listings
├── id (primary key)
├── user_id (foreign key)
├── cardtrader_listing_id
├── blueprint_id
├── price
├── condition
├── language
├── is_foil
├── quantity
├── status
├── created_at
└── updated_at
```

### 5.3. Migrations Importantes
- `add_card_version.sql` - Support des versions multiples
- `add_is_foil_to_price_history.sql` - Différenciation foil/non-foil
- `add_set_code_to_card_printings.sql` - Liaison sets/cartes
- `create_listings_table.sql` - Support marketplace CardTrader

### 5.4. Sécurité et Permissions
- **Row Level Security (RLS)** activé sur toutes les tables utilisateur
- **Policies** : Les utilisateurs ne voient que leurs propres données
- **API Keys** : Clé anonyme pour lecture, clé service pour admin
- **Authentification** : JWT tokens gérés automatiquement

## 6. Workflow de Développement

### 6.1. Architecture Technique
- **Frontend** : React 18 + Vite 4 + Tailwind CSS
- **État** : React Context + useState/useReducer + hooks personnalisés
- **Routage** : React Router v6
- **Build** : Vite (remplacement de Create React App)
- **Compatibilité** : Couche `cra-compat.js` pour transition CRA vers Vite

### 6.2. Scripts Disponibles
```bash
# Développement
npm run dev          # Serveur Vite standard (HTTP)
npm run start        # Serveur HTTPS local avec certificats

# Production  
npm run build        # Build optimisé pour production
npm run preview      # Aperçu du build local

# Maintenance
npm run lint         # Linting ESLint (si configuré)
npm test            # Tests Jest + React Testing Library
```

### 6.3. Configuration Multi-Environnements
```javascript
// Variables d'environnement supportées
VITE_*               // Variables Vite (frontend)
REACT_APP_*          // Variables CRA (rétrocompatibilité)
NODE_ENV             // Environnement (development/production)
VITE_SITE_URL        // URL HTTPS locale
```

### 6.4. Workflow Git Recommandé
1. **Branches** :
   - `main` - Production stable
   - `develop` - Développement actif
   - `feature/*` - Nouvelles fonctionnalités
   - `hotfix/*` - Corrections critiques

2. **Commits** :
   - Messages descriptifs en français
   - Commits atomiques (une fonctionnalité = un commit)
   - Tester avant commit

### 6.5. Tests et Qualité
- **Tests unitaires** : Jest + React Testing Library
- **Tests d'intégration** : Tests des composants complets
- **Linting** : ESLint avec règles React/Hooks
- **Formatting** : Prettier (recommandé)

### 6.6. Debugging et Monitoring
- **React DevTools** : Extension navigateur recommandée
- **Vite DevTools** : Inspection des modules et HMR
- **Supabase Studio** : Interface base de données
- **Logs Proxies** : Console des serveurs proxy pour debugging API

## 7. Déploiement

### 7.1. Frontend (Application React)
```bash
# Build de production
npm run build
# Génère le dossier /build avec assets optimisés
```

**Options de déploiement** :
- **Netlify** : Déploiement automatique depuis Git
- **Vercel** : Optimisé pour React/Vite
- **AWS S3 + CloudFront** : Solution AWS complète
- **GitHub Pages** : Gratuit pour projets open source

### 7.2. Proxies API (Node.js)
Les trois proxies doivent être déployés sur infrastructure Node.js :

**Options** :
- **Heroku** : Déploiement simple avec Procfile
- **Railway** : Alternative moderne à Heroku
- **VPS** : Contrôle total avec PM2/systemd
- **Functions Serverless** : Netlify/Vercel Functions

**Configuration production** :
```javascript
// Variables d'environnement requises
REACT_APP_CARDTRADER_API_TOKEN  // Token CardTrader
JUSTTCG_API_KEY                 // Clé JustTCG
LORCAST_API_KEY                 // Clé Lorcast (si nécessaire)
PORT                            // Port du serveur
```

### 7.3. Base de Données
- **Supabase** : Déjà hébergé en production
- **Migrations** : À appliquer via Supabase Studio
- **Backups** : Configurés automatiquement par Supabase

### 7.4. Monitoring et Maintenance
- **Script prix** : `updatePricesDaily.js` à configurer en cron job
- **Logs** : Surveillance des proxies et erreurs API
- **Performance** : Monitoring Supabase et temps de réponse API

## 8. Configuration et Fichiers Clés

### 8.1. Vite Configuration (`vite.config.js`)
```javascript
// Configuration principale
- Plugins React + JSX support
- HTTPS développement avec certificats
- Proxies vers serveurs API locaux
- Alias de chemins (@, src, public)
- Variables d'environnement
- Build optimisé pour production
```

### 8.2. Tailwind CSS (`tailwind.config.js`)
```javascript
// Personnalisation UI
- Couleurs thème personnalisées
- Breakpoints responsive
- Plugins additionnels
- Purging CSS automatique
```

### 8.3. Variables Environnement
```bash
# .env.local (développement)
VITE_SUPABASE_URL=              # URL projet Supabase
VITE_SUPABASE_ANON_KEY=         # Clé publique Supabase
REACT_APP_CARDTRADER_API_TOKEN= # Token CardTrader API
VITE_CARDTRADER_API_TOKEN=      # Redondance compatibilité
JUSTTCG_API_KEY=                # Clé JustTCG (proxy)
VITE_SITE_URL=                  # URL HTTPS locale
```

### 8.4. Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",                    // Développement HTTP
    "start": "node scripts/start-https.js", // Développement HTTPS
    "build": "vite build",            // Build production
    "preview": "vite preview",        // Aperçu build local
    "test": "jest",                   // Tests unitaires
    "lint": "eslint src/"             // Linting code
  }
}
```

## 9. Architecture des Proxies API

### 9.1. Vue d'Ensemble
Les trois proxies Node.js forment l'épine dorsale de l'intégration API :

```
Frontend React ──┐
                 ├─→ CardTrader Proxy (8021) ──→ CardTrader API
                 ├─→ Lorcast Proxy (8020) ────→ Lorcast API  
                 └─→ JustTCG Proxy (8010) ─────→ JustTCG API
```

### 9.2. CardTrader Proxy (`server/cardtrader-proxy.mjs`)
**Port** : 8021  
**Fonctionnalités** :
```javascript
// Endpoints principaux
GET  /api/test              // Test connexion API
GET  /api/games             // Liste des jeux disponibles
GET  /api/games/:id/categories // Catégories d'un jeu
GET  /api/blueprints        // Cartes vendables
POST /api/listings          // Créer un listing
PUT  /api/listings/:id      // Modifier un listing
DELETE /api/listings/:id    // Supprimer un listing
```

**Sécurité** :
- Token API CardTrader lu depuis `.env.local`
- Validation des paramètres entrants
- Gestion des erreurs HTTP détaillée
- Headers CORS configurés

### 9.3. Lorcast Proxy (`server/lorcast-proxy.mjs`)
**Port** : 8020  
**Fonctionnalités** :
```javascript
// API Lorcana publique
GET /lorcast/cards          // Recherche cartes Lorcana
GET /lorcast/sets           // Liste des sets Lorcana
```

**Caractéristiques** :
- API publique (pas d'authentification)
- Cache potentiel pour performances
- Gestion des erreurs réseau
- Support recherche avancée

### 9.4. JustTCG Proxy (`justtcg-proxy.mjs`)
**Port** : 8010  
**Fonctionnalités** :
```javascript
// Prix et données marché
GET /cards-search           // Recherche prix cartes
GET /lorcast/cards          // Proxy Lorcast (redondance)
GET /lorcast/sets           // Proxy sets (redondance)
```

**Sécurité** :
- Clé API JustTCG requise
- Validation format clé (`tcg_*`)
- Rate limiting potentiel
- Logs de debugging

### 9.5. Avantages Architecture Proxy

#### Sécurité
- **Clés API** masquées côté client
- **Tokens sensibles** stockés serveur uniquement
- **Validation** centralisée des requêtes

#### Performance
- **Cache** possible des réponses fréquentes
- **Rate limiting** centralisé
- **Compression** des réponses

#### Maintenance
- **Logs centralisés** pour debugging
- **Transformations** de données si nécessaire
- **Versioning API** transparent pour le frontend

#### CORS
- **Bypass** des restrictions navigateur
- **Headers** appropriés configurés
- **Méthodes HTTP** complètes supportées

### 9.6. Gestion des Erreurs
```javascript
// Pattern standard dans tous les proxies
try {
  const response = await fetch(apiUrl, options);
  const data = await response.json();
  res.status(response.status).json(data);
} catch (error) {
  console.error('Proxy Error:', error);
  res.status(500).json({ 
    error: 'Service temporairement indisponible',
    details: error.message 
  });
}
```

## 10. Scripts et Utilitaires

### 10.1. Script HTTPS de Développement
**Fichier** : `scripts/start-https.js`  
**Objectif** : Faciliter le développement local sécurisé

```javascript
// Fonctionnalités
- Vérification certificats SSL locaux
- Validation fichier hosts système
- Configuration automatique VITE_SITE_URL
- Démarrage Vite avec HTTPS
- Messages d'aide pour configuration
```

**Utilisation** :
```bash
npm run start  # Lance le script automatiquement
```

### 10.2. Script de Mise à Jour des Prix
**Fichier** : `server/updatePricesDaily.js`  
**Objectif** : Automatisation mise à jour prix cartes

```javascript
// Processus
1. Connexion base Supabase
2. Récupération liste cartes actives
3. Appel API JustTCG pour prix actuels
4. Mise à jour table price_history
5. Logging des résultats et erreurs
```

**Déploiement** :
- **Cron job** serveur : `0 6 * * *` (tous les jours 6h)
- **GitHub Actions** : Workflow automatisé
- **Service cloud** : Function serverless quotidienne

### 10.3. Utilitaire de Copie Assets
**Fichier** : `copy-public.js`  
**Objectif** : Gestion assets publics pendant build

```javascript
// Responsabilités
- Copie fichiers /public vers /build
- Optimisation images si nécessaire
- Génération manifests
- Validation intégrité fichiers
```

### 10.4. Compatibilité CRA
**Fichier** : `src/cra-compat.js`  
**Objectif** : Transition transparente Create React App → Vite

```javascript
// Ponts de compatibilité
- Variables process.env simulées
- Support REACT_APP_* variables
- Conversion VITE_ → REACT_APP_
- Hot Module Replacement (HMR)
- Détection environnement
```

**Avantages** :
- Migration graduelle sans casser le code existant
- Support des deux systèmes de variables
- Debugging facilité avec logs appropriés

### 10.5. Scripts de Migration Base de Données
**Localisation** : `/db/migrations/*.sql`  
**Gestion** : Manuelle via Supabase Studio

```sql
-- Exemples de migrations critiques
add_card_version.sql           -- Support versions multiples cartes
add_is_foil_to_price_history   -- Différenciation foil/normal  
create_listings_table.sql      -- Table marketplace CardTrader
add_set_code_to_card_printings -- Liaison sets/impressions
```

**Workflow recommandé** :
1. Développer migration en local
2. Tester sur base développement
3. Appliquer en production via SQL Editor
4. Vérifier intégrité données post-migration

---

## 11. Troubleshooting et FAQ

### 11.1. Problèmes Fréquents

#### Certificats HTTPS non reconnus
```bash
# Solution Windows
1. Ouvrir Chrome/Edge
2. Aller à https://dev.tcgbot.local:3000
3. Cliquer "Avancé" → "Continuer vers le site"
4. Ou installer certificats dans le store Windows
```

#### Proxies non accessibles
```bash
# Vérifier que les 3 proxies tournent
netstat -an | grep :8021  # CardTrader
netstat -an | grep :8020  # Lorcast  
netstat -an | grep :8010  # JustTCG

# Redémarrer si nécessaire
node server/cardtrader-proxy.mjs
node server/lorcast-proxy.mjs
node justtcg-proxy.mjs
```

#### Erreurs variables d'environnement
```bash
# Vérifier présence .env.local
ls -la .env.local

# Vérifier format variables
cat .env.local | grep VITE_SUPABASE
```

### 11.2. Performance et Optimisation

#### Build lent
- Vérifier `node_modules` pas trop volumineux
- Nettoyer cache Vite : `rm -rf node_modules/.vite`
- Utiliser `npm ci` au lieu de `npm install`

#### API lentes
- Vérifier latence réseau vers APIs externes
- Implémenter cache dans proxies si nécessaire
- Monitorer logs des proxies pour erreurs

### 11.3. Support et Documentation
- **Documentation API** : Dossier `/docs/`
- **Issues GitHub** : Reporter bugs et demandes features  
- **Logs détaillés** : Console navigateur + logs serveurs proxy
- **Supabase Studio** : Interface base de données complète

---

*Cette documentation technique reflète l'état actuel de l'application Da TCG Bot. Elle doit être maintenue à jour lors des évolutions du projet.*

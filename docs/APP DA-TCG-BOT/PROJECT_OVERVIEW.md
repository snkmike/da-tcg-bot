# Aperçu du Projet : Da TCG Bot

## Objectif du Projet

**Da TCG Bot** est une application web moderne conçue pour l'optimisation et la gestion des collections de jeux de cartes à collectionner (TCG). L'application se concentre principalement sur **Lorcana** avec un support étendu pour **CardTrader**, tout en offrant des fonctionnalités de base pour d'autres TCG (Yu-Gi-Oh!, Pokémon, Magic: The Gathering). 

### Fonctionnalités principales actuelles :
- **Gestion de collections** : Création, organisation et suivi de vos collections de cartes
- **Recherche avancée** : Interface unifiée pour rechercher des cartes via Lorcana et CardTrader
- **Système de listings** : Création et gestion de listings sur CardTrader marketplace  
- **Suivi des prix** : Intégration JustTCG pour le suivi des prix en temps réel
- **Dashboard** : Vue d'ensemble de votre portfolio et performances

## Technologies Clés

*   **Frontend :**
    *   **React :** Bibliothèque JavaScript pour la construction d'interfaces utilisateur.
    *   **Vite :** Outil de build et serveur de développement rapide pour les applications web modernes.
    *   **Tailwind CSS :** Framework CSS "utility-first" pour un design rapide et personnalisé.
*   **Backend & Base de Données :**
    *   **Supabase :** Plateforme open-source alternative à Firebase, fournissant une base de données PostgreSQL, une authentification, des API auto-générées, et plus encore.
*   **Serveur / Proxies :**
    *   **Node.js :** Environnement d'exécution JavaScript côté serveur, utilisé pour les scripts de proxy et les tâches planifiées.
*   **Gestion des Paquets :**
    *   **npm** (ou yarn) : Gestionnaire de paquets pour JavaScript.

## Structure du Projet (Aperçu)

Voici un aperçu des principaux dossiers et fichiers du projet :

### 📂 Racine du projet
*   `package.json` : Dépendances et scripts npm/vite
*   `vite.config.js` : Configuration Vite (build et dev server)
*   `tailwind.config.js` : Configuration Tailwind CSS
*   `postcss.config.js` : Configuration PostCSS
*   `index.html` : Point d'entrée HTML principal
*   `justtcg-proxy.mjs` : **Proxy pour l'API JustTCG** (prix des cartes)
*   Certificats HTTPS locaux (`dev.tcgbot.local-key.pem`, `dev.tcgbot.local.pem`)

### 📂 `/public`
*   Actifs statiques (favicon, manifest.json, logos, robots.txt)

### 📂 `/src` - Cœur de l'application React
*   `index.jsx` : Point d'entrée React
*   `supabaseClient.js` : Configuration Supabase
*   **`/app`** : Architecture principale
    *   `App.jsx` : Composant racine avec routage et navigation
    *   `routes.jsx` : Définition des routes
    *   `useAppState.js` : Hook de gestion d'état global
    *   `tabsState.js` : Gestion des onglets
*   **`/components`** : Composants organisés par fonctionnalité
    *   `/auth` : Authentification (Auth.jsx)
    *   `/cards` : Affichage des cartes (CardDetail, CardItem, etc.)
    *   `/collection` : Gestion des collections (MyCollectionTab, CollectionList, etc.)
    *   `/dashboard` : Tableau de bord (DashboardTab.jsx)
    *   `/listings` : **Système CardTrader** (ListingsTab, CreateListingModal)
    *   `/search` : **Recherche unifiée** (SearchTab, SearchFilters, SearchBox)
    *   `/price` : Suivi des prix (PriceTab.jsx)
    *   `/tags` : Système d'étiquetage (TagsTab.jsx)
    *   `/ui` : Composants réutilisables (TabButton.jsx)
    *   `/utils` : Utilitaires (fetchJustTCGPrices.js, importCollection.js)
*   **`/utils/api`** : Services API
    *   `cardTraderAPI.js` : Interface CardTrader
    *   `fetchLorcanaData.js` : Interface Lorcana/Lorcast
*   **`/config`** : Configuration
    *   `cardTraderConfig.js` : Configuration CardTrader
*   **`/hooks`** : Hooks personnalisés
    *   `useCollectionData.js`, `useCardSelection.js`
*   **`/data`** : Données de test (mockCards.js, mockSets.js)

### 📂 `/server` - Scripts côté serveur
*   `cardtrader-proxy.mjs` : **Proxy CardTrader** (marketplace, listings)
*   `lorcast-proxy.mjs` : **Proxy Lorcast** (API Lorcana)
*   `updatePricesDaily.js` : Script de mise à jour des prix

### 📂 `/scripts` - Utilitaires de développement
*   `start-https.js` : Serveur HTTPS local
*   `copy-public.js` : Script de build

### 📂 `/db/migrations` - Base de données
*   Scripts SQL pour la structure Supabase
*   Tables : cards, sets, card_printings, price_history, collections, user_collections, listings

### 📂 `/docs` - Documentation
*   `PROJECT_OVERVIEW.md` : Vue d'ensemble (ce document)
*   `TECHNICAL_DOCUMENTATION.md` : Documentation technique détaillée
*   API documentations (CardTrader, Lorcast)

## Environnement de Développement

### Prérequis
*   **Node.js** (version LTS recommandée) + npm
*   **Compte Supabase** avec projet configuré 
*   **Token CardTrader API** pour les fonctionnalités marketplace
*   **Clé JustTCG API** pour le suivi des prix (optionnel)

### Démarrage rapide
1. **Installation** : `npm install`
2. **Configuration** : Créer `.env.local` avec les variables Supabase et API
3. **Développement** : 
   - `npm run dev` : Serveur Vite standard
   - `npm run start` : Serveur HTTPS local (recommandé)
4. **Proxies** : Démarrer les proxies nécessaires
   - `node server/cardtrader-proxy.mjs` (port 8021)
   - `node server/lorcast-proxy.mjs` (port 8020) 
   - `node justtcg-proxy.mjs` (port 8010)

### Accès HTTPS local
L'application est configurée pour HTTPS local via `scripts/start-https.js` :
- URL : `https://dev.tcgbot.local:3000`  
- Ajoutez `127.0.0.1 dev.tcgbot.local` à votre fichier hosts
- Approuvez les certificats dans votre navigateur

## Fichiers Clés à Connaître

### 🚀 Points d'Entrée
*   **`src/index.jsx`** : Point d'entrée principal de l'application React
*   **`src/app/App.jsx`** : Composant racine et structure layout générale
*   **`src/app/routes.jsx`** : Configuration du routage de l'application
*   **`src/supabaseClient.js`** : Configuration et client Supabase

### 🔧 Configuration Système
*   **`vite.config.js`** : Configuration Vite (HTTPS, proxies, build, optimisations)
*   **`package.json`** : Dépendances, scripts npm et métadonnées projet
*   **`tailwind.config.js`** : Personnalisation thème et composants Tailwind CSS
*   **`src/cra-compat.js`** : Couche compatibilité Create React App → Vite

### 🌐 Infrastructure API et Proxies
*   **`server/cardtrader-proxy.mjs`** : Proxy CardTrader pour marketplace (port 8021)
*   **`server/lorcast-proxy.mjs`** : Proxy API Lorcana (port 8020)
*   **`justtcg-proxy.mjs`** : Proxy prix JustTCG (port 8010)
*   **`src/utils/api/cardTraderAPI.js`** : Client API CardTrader côté frontend
*   **`src/config/cardTraderConfig.js`** : Configuration spécifique CardTrader

### 🃏 Composants Fonctionnels Clés
*   **`src/components/listings/ListingsTab.jsx`** : Interface principale marketplace
*   **`src/components/collection/MyCollectionTab.jsx`** : Gestion collections utilisateur
*   **`src/components/search/`** : Système de recherche unifiée Lorcana/CardTrader
*   **`src/components/auth/Auth.jsx`** : Interface authentification Supabase

### 🛠️ Hooks et Logique Métier
*   **`src/app/useAppState.js`** : Hook état global application
*   **`src/components/collection/useCollectionData.js`** : Logique données collections
*   **`src/components/collection/useCardSelection.js`** : Gestion sélection multiple cartes
*   **`src/components/collection/groupCards.js`** : Algorithmes groupement cartes

### 📊 Base de Données et Migration
*   **`db/migrations/`** : Scripts SQL migrations base Supabase
*   **`server/updatePricesDaily.js`** : Script automatisé mise à jour prix quotidienne

### 🔐 Développement HTTPS Local
*   **`scripts/start-https.js`** : Script démarrage développement HTTPS sécurisé
*   **`dev.tcgbot.local-key.pem` & `dev.tcgbot.local.pem`** : Certificats SSL locaux

---

*Ce document fournit un aperçu général du projet. Pour des détails techniques approfondis, architectures des composants, et guides de développement, consultez `TECHNICAL_DOCUMENTATION.md`.*

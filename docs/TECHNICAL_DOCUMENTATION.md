# Documentation Technique : Da TCG Bot

## 1. Introduction

### 1.1. Objectif du Projet
Da TCG Bot est une application web visant à offrir aux collectionneurs de Jeux de Cartes à Collectionner (TCG) une plateforme pour gérer leurs collections, suivre la valeur de leurs cartes, rechercher des cartes spécifiques, et potentiellement interagir avec un marché en ligne. L'application supporte plusieurs TCG, notamment Lorcana, et est conçue pour intégrer des données provenant de diverses API externes.

### 1.2. Architecture de Haut Niveau
L'application est structurée comme suit :
*   **Frontend :** Une Single Page Application (SPA) construite avec React et Vite. Elle communique avec Supabase pour les données et l'authentification, et avec des proxies Node.js pour accéder aux API TCG externes.
*   **Backend (Base de Données & Auth) :** Supabase est utilisé comme backend principal, fournissant une base de données PostgreSQL, des services d'authentification, et des API en temps réel.
*   **Proxies Serveur :** Des scripts Node.js (fichiers `.mjs`) agissent comme proxies pour les API externes (Lorcast, JustTCG). Cela aide à gérer les CORS, à masquer les clés API, et potentiellement à mettre en cache les réponses ou à gérer les limites de taux.
*   **Tâches Planifiées :** Un script (`server/updatePricesDaily.js`) est conçu pour mettre à jour périodiquement les informations de prix, probablement exécuté comme une tâche cron.

## 2. Démarrage Rapide

### 2.1. Prérequis
*   Node.js (version LTS recommandée)
*   npm (généralement inclus avec Node.js) ou yarn
*   Un compte Supabase et un projet Supabase configuré.
*   Git pour cloner le repository.

### 2.2. Clonage du Repository
```bash
git clone <url_du_repository>
cd da-tcg-bot
```

### 2.3. Installation des Dépendances
```bash
npm install
# ou
# yarn install
```

### 2.4. Variables d'Environnement
Créez un fichier `.env` à la racine du projet et configurez les variables nécessaires pour Supabase. Référez-vous à `src/supabaseClient.js` pour les noms exacts des variables attendues (généralement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`).
```env
VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_SUPABASE
# Ajoutez d'autres clés API si nécessaire pour les proxies
```

### 2.5. Exécution du Serveur de Développement
Le projet utilise Vite. Pour démarrer le serveur de développement :
```bash
npm run dev
```
Pour démarrer avec HTTPS (recommandé si l'application utilise des fonctionnalités nécessitant un contexte sécurisé, ou pour simuler l'environnement de production) :
```bash
npm run start
```
Cela utilisera les certificats `dev.tcgbot.local-key.pem` et `dev.tcgbot.local.pem`. Vous devrez peut-être faire confiance à ces certificats dans votre navigateur ou système d'exploitation. L'application sera généralement accessible sur `https://dev.tcgbot.local:3000` ou une adresse similaire.

### 2.6. Migrations de Base de Données
Les migrations de schéma pour la base de données Supabase se trouvent dans `/db/migrations`. Appliquez-les à votre instance Supabase via l'interface SQL de Supabase Studio ou en utilisant l'outil CLI de Supabase.

### 2.7. Configuration et Accès HTTPS Local
Pour un environnement de développement sécurisé, l'application prend en charge HTTPS local via les certificats fournis.

#### Étapes pour configurer HTTPS local :
1. Assurez-vous que les fichiers `dev.tcgbot.local-key.pem` et `dev.tcgbot.local.pem` sont présents à la racine du projet.
2. Ajoutez une entrée dans votre fichier `hosts` pour mapper `dev.tcgbot.local` à `127.0.0.1` :
   ```plaintext
   127.0.0.1 dev.tcgbot.local
   ```
3. Lancez le serveur de développement avec HTTPS en exécutant :
   ```bash
   npm run start
   ```
4. Accédez à l'application via l'URL : `https://dev.tcgbot.local:3000`.

#### Notes :
- Vous devrez peut-être approuver les certificats dans votre navigateur ou système d'exploitation.
- Cette configuration est utile pour tester des fonctionnalités nécessitant un contexte sécurisé, comme l'authentification ou les API externes.

## 3. Structure Détaillée du Projet

*   **`/` (Racine)**
    *   `package.json`: Dépendances Node.js, scripts (`dev`, `build`, `lint`, `start`, etc.).
    *   `vite.config.js`: Configuration de Vite (plugins, alias, options du serveur de dev, configuration du build).
    *   `tailwind.config.js`: Configuration de Tailwind CSS (thème, plugins).
    *   `postcss.config.js`: Configuration de PostCSS (généralement pour Tailwind et Autoprefixer).
    *   `index.html`: Template HTML principal, point d'entrée de l'application Vite.
    *   `justtcg-proxy.mjs`: Proxy Node.js pour l'API JustTCG.
    *   `dev.tcgbot.local-key.pem`, `dev.tcgbot.local.pem`: Clé privée et certificat SSL pour le développement HTTPS local.
    *   `copy-public.js`: Script Node.js, probablement pour copier le contenu de `/public` vers le répertoire de build (`dist`) ou pour d'autres manipulations de fichiers lors du build.
    *   `README.md`: Informations générales sur le projet.

*   **`/public`**
    *   Contient les actifs statiques qui sont copiés tels quels dans le répertoire de build. Ex: `favicon.ico`, `manifest.json`.

*   **`/src` (Source de l'application)**
    *   `index.jsx`: Point d'entrée de l'application React. Initialise React et monte le composant `App`.
    *   `App.css`, `index.css`: Styles globaux et de base.
    *   `supabaseClient.js`: Configure et exporte le client Supabase. C'est ici que les variables d'environnement pour Supabase sont utilisées.
    *   **`/app`**:
        *   `App.jsx`: Composant racine de l'application. Contient la structure principale (mise en page, barres de navigation) et le système de routage.
        *   `routes.jsx`: Définit les routes de l'application en utilisant probablement `react-router-dom`.
        *   `tabsState.js`: Gestion de l'état des onglets (potentiellement avec Zustand ou un contexte React).
        *   `useAppState.js`: Hook personnalisé pour gérer l'état global de l'application.
    *   **`/components`**: Répertoire central pour tous les composants React réutilisables.
        *   Organisé par fonctionnalité (ex: `/account`, `/alerts`, `/auth`, `/cards`, `/collection`, `/dashboard`, `/listings`, `/price`, `/search`, `/tags`, `/ui`, `/utils`).
        *   Chaque sous-dossier contient des composants spécifiques à cette fonctionnalité.
    *   **`/utils`**: Fonctions utilitaires JavaScript/TypeScript.
        *   `lorcanaCardUtils.js`: Utilitaires spécifiques aux cartes Lorcana.
        *   **`/api`**:
            *   `fetchLorcanaData.js`: Fonctions pour récupérer des données depuis l'API Lorcana (probablement via le proxy `lorcast-proxy.mjs`).
        *   `fetchJustTCGPrices.js` (dans `src/components/utils`): Fonctions pour récupérer les prix depuis l'API JustTCG (probablement via `justtcg-proxy.mjs`).
        *   `importCollection.js`: Logique pour importer des collections.
    *   **`/hooks`**: Hooks React personnalisés (ex: `useLorcanaCollections.js`, `useCardSelection.js`, `useCollectionData.js`).
    *   **`/contexts`**: Si des Contextes React sont utilisés pour la gestion d'état.
    *   **`/pages`**: (Peut-être utilisé pour les composants de page de haut niveau si non gérés directement dans `/app` ou `/components`).
    *   **`/data`**: Données statiques ou mock (ex: `mockCards.js`, `mockSets.js`).
    *   `reportWebVitals.js`, `setupTests.js`, `App.test.js`: Fichiers liés aux tests et au suivi des performances web.

*   **`/db/migrations`**:
    *   Contient des fichiers `.sql` définissant les changements de schéma de la base de données (création de tables, ajout de colonnes, etc.). Ces migrations sont à appliquer manuellement ou via un outil de migration sur l'instance Supabase.
    *   Exemples : `add_card_version.sql`, `create_listings_table.sql`.

*   **`/server`**: Scripts exécutés côté serveur (Node.js).
    *   `lorcast-proxy.mjs`: Proxy pour l'API Lorcast. Gère les requêtes vers l'API Lorcast, potentiellement pour ajouter des clés API, contourner les problèmes CORS, ou mettre en cache des réponses.
    *   `updatePricesDaily.js`: Script Node.js destiné à être exécuté régulièrement (ex: tâche cron quotidienne) pour mettre à jour les prix des cartes dans la base de données Supabase.

*   **`/scripts`**: Scripts utilitaires pour le développement.
    *   `start-https.js`: Script Node.js pour démarrer le serveur de développement Vite avec HTTPS, en utilisant les certificats locaux.

*   **`/docs`**: Documentation du projet.
    *   `API-lorcast-documentation`: Documentation spécifique à l'intégration de l'API Lorcast.

## 4. Fonctionnalités et Modules Clés

### 4.1. Authentification
*   Gérée via Supabase Auth.
*   Le composant `src/components/auth/Auth.jsx` gère probablement l'interface utilisateur pour la connexion et l'inscription.
*   Le `supabaseClient.js` est utilisé pour interagir avec les services d'authentification de Supabase.

### 4.2. Recherche et Affichage de Cartes
*   Composants dans `src/components/search/` et `src/components/cards/`.
*   `SearchBox.jsx`, `SearchFilters.jsx` pour l'interface de recherche.
*   `CardResult.jsx`, `CardSearchResult.jsx`, `LorcanaResults.jsx` pour afficher les résultats.
*   Les données des cartes sont récupérées depuis Supabase et/ou via les proxies vers les API externes.

### 4.3. Gestion de Collection
*   Composants dans `src/components/collection/`.
*   `MyCollectionTab.jsx`, `CollectionList.jsx`, `CollectionCardItem.jsx`.
*   Permet aux utilisateurs de gérer leurs collections de cartes, stockées dans la base de données Supabase.
*   `useCollectionData.js` et `useCardSelection.js` sont des hooks pour la logique de cette fonctionnalité.
*   `ModalImportCollection.jsx` et `importCollection.js` pour l'importation de collections.

### 4.4. Suivi des Prix
*   Composants dans `src/components/price/` (ex: `PriceTab.jsx`).
*   Le script `server/updatePricesDaily.js` est crucial pour maintenir les données de prix à jour dans la table `price_history` de la base de données.
*   `fetchJustTCGPrices.js` est utilisé pour récupérer les données de prix depuis l'API JustTCG.

### 4.5. Intégration d'API Externes
*   **Lorcast API :**
    *   Proxy : `server/lorcast-proxy.mjs`.
    *   Utilitaire client : `src/utils/api/fetchLorcanaData.js`.
    *   Documentation spécifique : `docs/API-lorcast-documentation`.
*   **JustTCG API :**
    *   Proxy : `justtcg-proxy.mjs` (à la racine).
    *   Utilitaire client : `src/components/utils/fetchJustTCGPrices.js`.

Les proxies sont essentiels pour :
*   **CORS :** Contourner les restrictions Cross-Origin Resource Sharing des navigateurs.
*   **Sécurité des Clés API :** Les clés API des services externes sont stockées et utilisées côté serveur (dans les proxies), et non exposées dans le code client.
*   **Rate Limiting :** Les proxies peuvent implémenter une logique pour éviter de dépasser les limites de taux des API externes.
*   **Caching :** Potentiellement, pour mettre en cache les réponses fréquentes et réduire la charge sur les API externes.

### 4.6. Gestion des Annonces eBay
L'application inclut une fonctionnalité pour afficher et gérer les annonces eBay via la route `/listings`.

#### Détails de la fonctionnalité :
- **Route :** `/listings`
- **Composant associé :** `ListingsTab.jsx` dans `src/components/listings/`.
- **Navigation :** Un onglet "Annonces eBay" est ajouté à la barre de navigation principale.
- **Description :**
  - Permet aux utilisateurs de rechercher et d'afficher des annonces eBay liées aux cartes TCG.
  - Intègre des filtres pour affiner les résultats (par exemple, par prix, rareté, etc.).

#### Exemple d'utilisation :
- Accédez à `https://dev.tcgbot.local:3000/listings` pour visualiser les annonces eBay.
- Utilisez les filtres disponibles pour personnaliser les résultats affichés.

#### Débogage et Tests :
- Lors de la tentative de publication d'une annonce de test, des journaux détaillés sont générés dans la console du navigateur :
  - **Token d'accès eBay :** Vérifie si le token est présent dans le stockage local.
  - **Réponse du serveur :** Affiche les détails de la réponse du backend.
  - **Erreurs :** Capture et affiche les erreurs éventuelles lors de la publication.
- Pour tester la publication d'une annonce :
  1. Connectez-vous à eBay via l'onglet "Mon Compte" pour obtenir un token d'accès valide.
  2. Cliquez sur le bouton "Tester la publication d'une annonce eBay" dans la page `/listings`.
  3. Consultez les journaux dans la console pour diagnostiquer les éventuels problèmes.

## 5. Base de Données (Supabase)

*   Supabase fournit une instance PostgreSQL.
*   Le schéma est géré via des migrations SQL situées dans `/db/migrations`.
*   **Tables clés (déduites des migrations et de l'utilisation) :**
    *   `cards` : Informations de base sur les cartes.
    *   `sets` : Informations sur les extensions/sets de cartes.
    *   `card_printings` : Différentes impressions/versions d'une carte (avec `set_code`, `version`).
    *   `price_history` : Historique des prix des cartes (avec `is_foil`).
    *   `collections` : Collections créées par les utilisateurs.
    *   `collection_cards` : Table de liaison pour les cartes dans les collections des utilisateurs.
    *   `listings` : (Probablement pour les fonctionnalités de vente/achat).
*   Les interactions avec la base de données depuis le frontend se font via le `supabaseClient.js`.

## 6. Workflow de Développement

### 6.1. Style de Code et Linting
*   Vérifiez `package.json` pour les linters configurés (ex: ESLint) et les formateurs (ex: Prettier).
*   Exécutez les commandes de linting (ex: `npm run lint`) régulièrement.

### 6.2. Tests
*   Des fichiers de test existent (`App.test.js`, `setupTests.js`), suggérant l'utilisation de Jest et React Testing Library.
*   Exécutez les tests avec `npm test` (ou une commande similaire définie dans `package.json`).

## 7. Déploiement
*   La commande `npm run build` (ou `yarn build`) génère une version de production de l'application dans le dossier `/dist`.
*   Ce dossier `/dist` contient des actifs statiques qui peuvent être déployés sur n'importe quel hébergeur de sites statiques (Netlify, Vercel, GitHub Pages, AWS S3, etc.).
*   Les proxies (`lorcast-proxy.mjs`, `justtcg-proxy.mjs`) et le script `updatePricesDaily.js` doivent être déployés sur un environnement Node.js (ex: un serveur VPS, une fonction serverless, Heroku).
*   Assurez-vous que les variables d'environnement sont correctement configurées dans l'environnement de production.

## 8. Fichiers de Configuration Clés

*   **`vite.config.js`**: Contrôle le processus de build et le serveur de développement. Peut inclure des alias de chemin, des optimisations, la configuration du proxy de développement, etc.
*   **`tailwind.config.js`**: Personnalisation de Tailwind CSS (couleurs, polices, points d'arrêt, plugins).
*   **`package.json`**: Liste des dépendances, scripts du projet.
*   **`.env`**: (Non versionné) Stocke les secrets et les configurations spécifiques à l'environnement.

## 9. Proxies (`justtcg-proxy.mjs`, `server/lorcast-proxy.mjs`)

Ces scripts Node.js utilisent probablement des frameworks comme Express.js ou le module `http` natif pour créer des serveurs intermédiaires.
*   **Objectifs :**
    *   Recevoir des requêtes du client React.
    *   Transférer ces requêtes aux API TCG externes appropriées.
    *   Ajouter des en-têtes d'authentification (clés API) aux requêtes sortantes.
    *   Retourner les réponses des API externes au client.
*   Ils doivent être exécutés sur un serveur accessible par l'application frontend. En développement, Vite peut être configuré pour proxyfier les requêtes vers ces serveurs proxy Node.js.

## 10. Scripts Serveur et Utilitaires

*   **`server/updatePricesDaily.js`**:
    *   Ce script est conçu pour être exécuté périodiquement (par exemple, via une tâche cron sur un serveur).
    *   Il se connecte à Supabase et aux API de prix (probablement JustTCG).
    *   Il récupère les derniers prix et met à jour la table `price_history` dans la base de données Supabase.
*   **`scripts/start-https.js`**:
    *   Facilite le développement local en HTTPS en utilisant les certificats fournis. Il démarre probablement le serveur Vite avec les options HTTPS activées.
*   **`copy-public.js`**:
    *   Un script utilitaire, potentiellement utilisé pendant le processus de build (`npm run build`) pour s'assurer que les fichiers du dossier `/public` sont correctement copiés ou traités.

Cette documentation devrait servir de base solide pour comprendre et contribuer au projet Da TCG Bot. Elle devra être maintenue à jour au fur et à mesure de l'évolution du projet.

# Aperçu du Projet : Da TCG Bot

## Objectif du Projet

**Da TCG Bot** est une application conçue pour l'optimisation des collections de jeux de cartes à collectionner (TCG) et potentiellement pour faciliter la vente et l'achat en ligne. Elle vise à fournir aux utilisateurs des outils pour gérer leurs cartes, suivre les prix, et découvrir de nouvelles cartes pour des jeux tels que Yu-Gi-Oh!, Pokémon, Magic: The Gathering, et Lorcana.

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

*   **`/` (Racine du projet) :**
    *   `package.json` : Définit les dépendances du projet et les scripts (npm).
    *   `vite.config.js` : Configuration pour Vite (serveur de développement, build).
    *   `tailwind.config.js` : Configuration pour Tailwind CSS.
    *   `postcss.config.js` : Configuration pour PostCSS (utilisé avec Tailwind).
    *   `index.html` : Point d'entrée HTML principal de l'application.
    *   `justtcg-proxy.mjs` : Script proxy pour l'API JustTCG.
    *   Fichiers de certificat HTTPS (`dev.tcgbot.local-key.pem`, `dev.tcgbot.local.pem`) : Pour le développement local en HTTPS.

*   **`/public` :**
    *   Contient les actifs statiques qui sont servis tels quels (favicon, `manifest.json`, `robots.txt`, images de logo).

*   **`/src` :** Cœur de l'application React.
    *   `index.jsx` : Point d'entrée principal de l'application React.
    *   `supabaseClient.js` : Initialisation et configuration du client Supabase.
    *   **`/app` :**
        *   `App.jsx` : Composant principal de l'application, gère la structure globale et le routage.
        *   `routes.jsx` : Définition des routes de l'application.
    *   **`/components` :** Contient les composants React réutilisables, organisés par fonctionnalité (ex: `auth`, `cards`, `collection`, `search`).
    *   **`/utils` :** Fonctions utilitaires, y compris les fonctions pour interagir avec les API externes (ex: `fetchLorcanaData.js`).
    *   **`/hooks` :** Hooks React personnalisés pour la logique réutilisable.
    *   **`/contexts` :** Contextes React pour la gestion d'état global.
    *   **`/db/migrations` :** Scripts SQL pour les migrations de la base de données Supabase.

*   **`/server` :** Scripts côté serveur.
    *   `lorcast-proxy.mjs` : Script proxy pour l'API Lorcast.
    *   `updatePricesDaily.js` : Script (probablement une tâche cron) pour mettre à jour quotidiennement les prix des cartes.

*   **`/scripts` :** Scripts utilitaires pour le développement.
    *   `start-https.js` : Script pour démarrer le serveur de développement Vite avec HTTPS.
    *   `copy-public.js` : (Probablement) Script pour copier des fichiers du dossier public lors du build.

*   **`/docs` :** Documentation du projet (où vous lisez ceci !).

## Environnement de Développement

*   **Node.js & npm/yarn :** Nécessaires pour installer les dépendances et exécuter les scripts.
*   **Vite :** Utilisé pour le serveur de développement local avec rechargement à chaud (`npm run dev`).
*   **Supabase :** Un compte Supabase est nécessaire pour la base de données et l'authentification. Les informations de connexion sont configurées dans `src/supabaseClient.js` (généralement via des variables d'environnement).
*   **HTTPS Local :** Le projet est configuré pour utiliser HTTPS en local via `scripts/start-https.js` et les certificats fournis.

## Fichiers Clés à Connaître

*   **`package.json` :** Pour comprendre les dépendances et les scripts disponibles (`dev`, `build`, `start:https`, etc.).
*   **`vite.config.js` :** Pour la configuration du build et du serveur de développement.
*   **`src/supabaseClient.js` :** Pour la configuration de la connexion à Supabase.
*   **`src/app/App.jsx` :** Composant racine de l'application React.
*   **`src/app/routes.jsx` :** Définition de la navigation de l'application.
*   **`server/updatePricesDaily.js` :** Logique de mise à jour des prix.
*   **`justtcg-proxy.mjs` & `server/lorcast-proxy.mjs` :** Logique des proxies pour les API externes.
*   **Dossier `/db/migrations` :** Pour comprendre la structure de la base de données.

Ce document fournit un aperçu. Pour des détails plus techniques, veuillez consulter `TECHNICAL_DOCUMENTATION.md`.

# 🃏 da-tcg-bot

Une application pour optimiser votre gestion de cartes à collectionner (TCG) : Magic, Pokémon, Yu-Gi-Oh!, etc.
Suivi de prix, alertes personnalisées, dashboard, call/hold, etc.

---

## 🚀 Fonctionnalités principales

* 🔍 Recherche avancée :

  * Par nom, extension ou jeu
  * Détails individuels + rapport global sur une extension

* 📈 Suivi des prix :

  * Historique avec graphes (jour/semaine/mois/année)
  * Évolution temps réel

* 🚨 Alertes personnalisées :

  * Définir un prix d’achat ou vente
  * Notifications (email/app/Discord)
  * Monitoring en direct sur Cardmarket, Amazon, Cdiscount, etc.

* 🏷️ Étiquetage :

  * Manuel ou IA (Call to Go, Bad Call, Hold, etc.)

* 📊 Dashboard :

  * Vue d'ensemble du portfolio
  * Performance, recommandations d'achat/vente

* 📦 Gestion de collection :

  * Import/Export, tri, filtres

---

## 🛠️ Technologies utilisées

* **Frontend** : React + Vite + Tailwind CSS
* **Backend** : (en développement ou prévu) Node.js / Express
* **Base de données** : (à définir : MongoDB / PostgreSQL ?)
* **APIs externes** : Cardmarket, Amazon, Cdiscount, autres

---

## 📦 Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/snkmike/da-tcg-bot.git
cd da-tcg-bot
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l’application

```bash
npm run dev
```

Accéder ensuite à [http://localhost:5173](http://localhost:5173)

---

## 🔧 Configuration environnement

Créer un fichier `.env` à la racine, exemple :

```env
VITE_API_URL=http://localhost:3000
CARDMARKET_API_KEY=...
AMAZON_API_KEY=...
DISCORD_WEBHOOK_URL=...
```

---

## 🧰 Tests

> (A à implémenter)

Prévu : tests unitaires avec Jest + tests d’intégration + e2e (Cypress)

---

## 🚀 Déploiement

### En local avec Docker (prochainement)

```bash
docker-compose up --build
```

### En production (prévu)

* Frontend : Vercel / Netlify
* Backend : Render / Railway / VPS
* DB : MongoDB Atlas / PlanetScale

---

## 📁 Structure du projet

```bash
da-tcg-bot/
├── public/                 # Fichiers statiques
├── src/                    # Frontend React
│   ├── components/         # Composants UI
│   ├── pages/              # Pages principales
│   ├── api/                # Appels API
│   ├── hooks/              # Hooks React
│   └── utils/              # Fonctions utilitaires
├── server/                 # Backend (Express ? à définir)
├── .env                    # Variables d’environnement
├── tailwind.config.js      # Config Tailwind
└── package.json            # Dépendances projet
```

---

## 📌 TODO (Roadmap rapide)

### Général
* [x] Authentification utilisateur
* [x] Utilisation pour Lorcana de l'API Lorcast (https://lorcast.com/docs/api)

### Lorcana
* [x] Implémenter la recherche par jeu/extension
* [x] Implémenter un systeme d'ajout rapide et optimisé
* [x] Implémenter des filtres commun a tout les résultat Lorcana
* [ ] Intégration API Cardmarket
* [ ] Stockage et visualisation de l’historique de prix
* [ ] Ajout des alertes personnalisables
* [ ] Ajout d’un dashboard portfolio


### Autres jeux (Magic, Yu-gi-Ho, Pokémon)
* [ ] Implémenter la recherche par jeu/extension
* [ ] Intégration API Cardmarket
* [ ] Stockage et visualisation de l’historique de prix
* [ ] Ajout des alertes personnalisables
* [ ] Ajout d’un dashboard portfolio


---

## 👥 Contributions

Les PR sont bienvenues. Si tu veux contribuer, commence par forker, cloner, créer une branche, coder, push et ouvrir une PR.

---

## 📬 Contact

Mike (snkmike) — *via GitHub ou Discord (prochainement)*

---

## 🧠 License

Projet open-source sous [MIT License](LICENSE).

---

## 📚 Documentation Complète

**➡️ [Accéder à la Documentation](./docs/README.md)**

La documentation a été **complètement réorganisée** en juin 2025 pour améliorer la navigation :

### 🚀 **Démarrage Rapide**
- 📖 [**Vue d'ensemble du Projet**](./docs/01-PROJECT-OVERVIEW.md) - Vision et fonctionnalités
- 🚀 [**Guide d'Installation**](./docs/02-INSTALLATION-GUIDE.md) - Configuration complète
- 🏗️ [**Architecture Technique**](./docs/03-ARCHITECTURE.md) - Structure et composants

### 🛠️ **Guides Techniques**
- 🗄️ [**Base de Données**](./docs/04-DATABASE.md) - Schéma Supabase et migrations
- 💻 [**Configuration de Développement**](./docs/05-DEVELOPMENT.md) - Scripts et workflow
- 🔌 [**APIs et Intégrations**](./docs/06-APIS.md) - Proxies et endpoints

### 🎯 **Fonctionnalités Spécialisées**
- 🛒 [**Listings CardTrader**](./docs/features/CARDTRADER-LISTINGS.md) - Marketplace intégration
- 🔧 [**Troubleshooting**](./docs/troubleshooting/TROUBLESHOOTING.md) - Résolution de problèmes
- 🚀 [**Déploiement**](./docs/deployment/DEPLOYMENT.md) - Mise en production

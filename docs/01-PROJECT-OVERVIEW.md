# 🎯 Aperçu du Projet : Da TCG Bot

## Qu'est-ce que Da TCG Bot ?

**Da TCG Bot** est une application web moderne conçue pour l'optimisation et la gestion des collections de cartes Lorcana avec intégration complète au marketplace CardTrader.

### 🎯 Mission
Offrir aux collectionneurs une plateforme unifiée pour gérer leurs collections, effectuer des recherches avancées, et créer des listings sur CardTrader.

### 🌟 Vision
Devenir l'outil de référence pour la gestion de collections Lorcana avec fonctionnalités marketplace intégrées.
bon
## ✨ Fonctionnalités Principales

### 📚 **Gestion de Collections**
- Création et organisation de collections personnalisées
- Import/export CSV pour migration de données
- Système de tags et catégories avancé
- Groupement intelligent par sets, rareté, version
- Calcul automatique de la valeur totale

### 🔍 **Recherche Unifiée**
- Interface unique pour Lorcana et CardTrader
- Filtres avancés (set, rareté, foil, condition)
- Affichage unifié avec prix et images
- Recherche en temps réel avec autocomplétion

### 🛒 **Marketplace CardTrader**
- Création de listings directement depuis la collection
- Mode test sécurisé pour validation
- Gestion complète des propriétés (condition, langue, foil)
- Support CardTrader Zero pour expédition automatisée
- Interface intuitive avec logs temps réel

### 💰 **Suivi des Prix**
- Intégration JustTCG pour prix du marché
- Historique des prix avec différenciation foil/non-foil
- Mise à jour quotidienne automatisée
- Calculs de variations et tendances

### 📊 **Dashboard et Analytics**
- Vue d'ensemble du portfolio
- Statistiques de collection
- Performance des cartes
- Alertes et notifications

## 🔧 Technologies Utilisées

### Frontend
- **React 18** : Interface utilisateur moderne et réactive
- **Vite 4** : Build tool rapide et optimisé
- **Tailwind CSS** : Framework CSS utility-first
- **React Router** : Navigation et routage

### Backend et Infrastructure
- **Supabase** : Base de données PostgreSQL + Auth + API temps réel
- **Node.js** : Serveurs proxy pour APIs externes
- **Express.js** : Framework serveur pour les proxies

### APIs et Intégrations
- **CardTrader API** : Marketplace et listings (via proxy port 8021)
- **Lorcast API** : Données cartes Lorcana (via proxy port 8020)
- **JustTCG API** : Prix du marché (via proxy port 8010)

### Développement
- **Git** : Contrôle de version
- **HTTPS local** : Développement sécurisé avec certificats
- **Jest + React Testing Library** : Tests unitaires et d'intégration

## 🎯 Audience Cible

### 👤 **Collectionneurs Occasionnels**
- Interface simple pour gérer leur collection
- Recherche facile de cartes et prix
- Import rapide de collections existantes

### 🏪 **Vendeurs/Commerçants**
- Outils avancés pour marketplace
- Gestion en lot des listings
- Suivi automatisé des stocks et prix

### 🛠️ **Développeurs**
- Architecture modulaire et extensible
- Documentation complète
- APIs bien définies

## 📊 Statut du Projet

### ✅ **Fonctionnalités Actuelles (Production Ready)**
- Authentification Supabase
- Gestion de collections complète
- Recherche unifiée Lorcana/CardTrader
- Système de listings CardTrader validé
- Suivi des prix JustTCG

### 🚧 **En Développement**
- Optimisations de performance
- Interface mobile responsive
- Analytics avancées
- Notifications push

### 🔮 **Roadmap Future**
- Support multi-TCG étendu
- API publique
- Marketplace intégré
- Application mobile

## 🌐 Liens Utiles

- **Application** : `https://dev.tcgbot.local:3000` (développement)
- **Supabase Studio** : Dashboard base de données
- **CardTrader** : [cardtrader.com](https://cardtrader.com)
- **Lorcast** : [lorcast.com](https://lorcast.com)

## 📚 Prochaines Étapes

**Nouveau dans le projet ?**
1. 📖 Lisez le [Guide d'Installation](./02-INSTALLATION-GUIDE.md)
2. 🏗️ Explorez l'[Architecture](./03-ARCHITECTURE.md)
3. 🛒 Testez les [Listings CardTrader](./features/CARDTRADER-LISTINGS.md)

**Développeur expérimenté ?**
- 🌐 [APIs et Intégrations](./06-APIS.md)
- ⚙️ [Configuration et Développement](./05-DEVELOPMENT.md)
- 🚀 [Déploiement](./deployment/DEPLOYMENT.md)

---

*Da TCG Bot - L'outil moderne pour les collectionneurs Lorcana.*

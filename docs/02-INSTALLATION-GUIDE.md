# 🚀 Guide d'Installation - Da TCG Bot

## 📋 Prérequis Système

### 🛠️ Outils Requis
- **Node.js** : Version LTS 18+ (recommandé : 20.x)
- **npm** : Version 9+ (inclus avec Node.js)
- **Git** : Pour cloner le repository
- **Navigateur moderne** : Chrome, Firefox, Safari, Edge

### 🌐 Comptes Externes Requis
- **Compte Supabase** : [supabase.com](https://supabase.com) (gratuit)
- **Token CardTrader** : [cardtrader.com](https://cardtrader.com) (optionnel mais recommandé)
- **Clé JustTCG** : [justtcg.com](https://justtcg.com) (optionnel)

## 📥 Installation

### 1. Clonage du Repository
```bash
git clone <url_du_repository>
cd da-tcg-bot
```

### 2. Installation des Dépendances
```bash
npm install
```

Cette commande installera toutes les dépendances frontend et les outils de développement.

## ⚙️ Configuration

### 1. Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet :

```env
# === CONFIGURATION SUPABASE (OBLIGATOIRE) ===
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_publique_supabase

# === CARDTRADER API (RECOMMANDÉ) ===
REACT_APP_CARDTRADER_API_TOKEN=votre_token_cardtrader
VITE_CARDTRADER_API_TOKEN=votre_token_cardtrader

# === APIS EXTERNES (OPTIONNEL) ===
JUSTTCG_API_KEY=tcg_votre_cle_justtcg
LORCAST_API_KEY=votre_cle_lorcast

# === DÉVELOPPEMENT HTTPS (AUTO-CONFIGURÉ) ===
VITE_SITE_URL=https://dev.tcgbot.local:3000
```

### 2. Configuration Supabase

#### Créer un Projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme

#### Appliquer les Migrations
```sql
-- Dans Supabase Studio > SQL Editor
-- Exécuter les fichiers dans l'ordre :
-- 1. db/migrations/add_card_version.sql
-- 2. db/migrations/create_listings_table.sql
-- 3. db/migrations/add_is_foil_to_price_history.sql
-- etc.
```

### 3. Configuration HTTPS Local (Recommandé)

#### Modifier le fichier hosts
**Windows** : `C:\Windows\System32\drivers\etc\hosts`
**macOS/Linux** : `/etc/hosts`

Ajouter cette ligne :
```
127.0.0.1 dev.tcgbot.local
```

#### Certificats SSL
Les certificats sont déjà fournis :
- `dev.tcgbot.local-key.pem` (clé privée)
- `dev.tcgbot.local.pem` (certificat)

## 🚀 Démarrage de l'Application

### Option 1 : Développement Standard (HTTP)
```bash
npm run dev
```
- Application accessible sur : `http://localhost:5173`
- Mode rapide pour développement simple

### Option 2 : Développement HTTPS (Recommandé)
```bash
npm run start
```
- Application accessible sur : `https://dev.tcgbot.local:3000`
- Mode sécurisé pour tester les APIs externes
- Approuver les certificats dans votre navigateur

## 🔄 Démarrage des Proxies API

L'application nécessite **trois serveurs proxy** pour fonctionner complètement.

### Démarrage Manuel (Développement)
Dans trois terminaux séparés :

```bash
# Terminal 1 - CardTrader Proxy (Port 8021)
node server/cardtrader-proxy.mjs

# Terminal 2 - Lorcast Proxy (Port 8020)  
node server/lorcast-proxy.mjs

# Terminal 3 - JustTCG Proxy (Port 8010)
node justtcg-proxy.mjs
```

### Script de Démarrage Automatique (Optionnel)
```bash
# Créer un script batch/shell pour démarrer tous les proxies
# Windows (start-proxies.bat) :
start "CardTrader" node server/cardtrader-proxy.mjs
start "Lorcast" node server/lorcast-proxy.mjs  
start "JustTCG" node justtcg-proxy.mjs

# macOS/Linux (start-proxies.sh) :
node server/cardtrader-proxy.mjs &
node server/lorcast-proxy.mjs &
node justtcg-proxy.mjs &
```

## ✅ Vérification de l'Installation

### 1. Test de l'Application
- Ouvrir `https://dev.tcgbot.local:3000`
- Vérifier que la page d'accueil se charge
- Tester l'authentification Supabase

### 2. Test des Proxies
```bash
# Vérifier que les ports sont ouverts
netstat -an | findstr :8021  # CardTrader
netstat -an | findstr :8020  # Lorcast
netstat -an | findstr :8010  # JustTCG
```

### 3. Test des APIs
- **Lorcast** : Tester la recherche de cartes Lorcana
- **CardTrader** : Tester la connexion (si token configuré)
- **JustTCG** : Tester la récupération de prix (si clé configurée)

## 🐛 Problèmes Courants

### Certificats HTTPS non reconnus
```bash
# Solution Chrome/Edge :
1. Aller à https://dev.tcgbot.local:3000
2. Cliquer "Avancé" → "Continuer vers le site"

# Solution permanente Windows :
1. Double-clic sur dev.tcgbot.local.pem
2. Installer dans "Autorités de certification racine"
```

### Proxies ne démarrent pas
```bash
# Vérifier les ports disponibles
netstat -an | findstr :8021
netstat -an | findstr :8020
netstat -an | findstr :8010

# Tuer les processus si nécessaire
taskkill /F /IM node.exe  # Windows
pkill node               # macOS/Linux
```

### Variables d'environnement non chargées
```bash
# Vérifier le fichier .env.local
type .env.local          # Windows
cat .env.local           # macOS/Linux

# Redémarrer l'application après modification
```

### Erreurs Supabase
- Vérifier l'URL et la clé dans `.env.local`
- Confirmer que les migrations sont appliquées
- Vérifier les permissions RLS dans Supabase Studio

## 📚 Prochaines Étapes

Une fois l'installation terminée :

1. 🏗️ **Explorez l'Architecture** : [Architecture](./03-ARCHITECTURE.md)
2. 💾 **Configurez la Base de Données** : [Base de Données](./04-DATABASE.md)
3. 🛒 **Testez les Listings** : [CardTrader Listings](./features/CARDTRADER-LISTINGS.md)
4. ⚙️ **Personnalisez le Développement** : [Configuration](./05-DEVELOPMENT.md)

## 🆘 Besoin d'Aide ?

- 🐛 **Problèmes techniques** : [Troubleshooting](./troubleshooting/TROUBLESHOOTING.md)
- 📖 **Documentation API** : [APIs et Intégrations](./06-APIS.md)
- 💬 **Questions générales** : Créer une issue GitHub

---

*Installation réussie ? Vous êtes prêt à explorer Da TCG Bot !*

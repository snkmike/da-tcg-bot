# 🚨 Troubleshooting et FAQ

## Problèmes Fréquents et Solutions

### 🔐 Problèmes d'Authentification et Certificats

#### Certificats HTTPS non reconnus
**Symptômes :**
- Avertissement de sécurité dans le navigateur
- "Votre connexion n'est pas privée"
- ERR_CERT_AUTHORITY_INVALID

**Solutions :**

**Windows :**
```powershell
# Option 1: Accepter temporairement
# 1. Ouvrir Chrome/Edge
# 2. Aller à https://dev.tcgbot.local:3000
# 3. Cliquer "Avancé" → "Continuer vers le site"

# Option 2: Installer les certificats (permanente)
# 1. Double-cliquer sur dev.tcgbot.local.pem
# 2. "Installer le certificat"
# 3. Choisir "Ordinateur local"
# 4. "Placer tous les certificats dans le magasin suivant"
# 5. Sélectionner "Autorités de certification racines de confiance"
```

**macOS :**
```bash
# Ajouter le certificat au trousseau
sudo security add-trusted-cert -d -r trustRoot -k /System/Library/Keychains/SystemRootCertificates.keychain dev.tcgbot.local.pem
```

**Linux :**
```bash
# Copier le certificat dans le dossier des certificats
sudo cp dev.tcgbot.local.pem /usr/local/share/ca-certificates/dev.tcgbot.local.crt
sudo update-ca-certificates
```

#### Erreur "dev.tcgbot.local" non résolu
**Symptômes :**
- ERR_NAME_NOT_RESOLVED
- "Impossible d'accéder au site"

**Solution :**
```bash
# Windows
echo 127.0.0.1 dev.tcgbot.local >> C:\Windows\System32\drivers\etc\hosts

# macOS/Linux  
echo "127.0.0.1 dev.tcgbot.local" | sudo tee -a /etc/hosts

# Vérifier la modification
ping dev.tcgbot.local
```

### 🔄 Problèmes de Proxies API

#### Proxies non accessibles
**Symptômes :**
- ERR_CONNECTION_REFUSED
- "Failed to fetch"
- Timeout des requêtes API

**Diagnostic :**
```powershell
# Windows PowerShell - Vérifier les ports
netstat -an | findstr :8021  # CardTrader
netstat -an | findstr :8020  # Lorcast  
netstat -an | findstr :8010  # JustTCG

# Alternative avec Get-NetTCPConnection
Get-NetTCPConnection -LocalPort 8021,8020,8010 -State Listen
```

**Solutions :**
```bash
# Redémarrer les proxies dans l'ordre
# Terminal 1
node server/cardtrader-proxy.mjs

# Terminal 2  
node server/lorcast-proxy.mjs

# Terminal 3
node justtcg-proxy.mjs

# Vérifier les logs pour erreurs
```

#### Erreurs de CORS
**Symptômes :**
- "Access to fetch blocked by CORS policy"
- "No 'Access-Control-Allow-Origin' header"

**Solution :**
Vérifier la configuration CORS dans les proxies :
```javascript
// server/cardtrader-proxy.mjs
app.use(cors({
    origin: [
        'https://dev.tcgbot.local:3000',
        'http://localhost:3000'
    ],
    credentials: true
}));
```

### ⚙️ Problèmes de Configuration

#### Variables d'environnement manquantes
**Symptômes :**
- "Environment variable not found"
- Fonctionnalités partiellement disponibles

**Diagnostic :**
```bash
# Vérifier l'existence du fichier
ls -la .env.local

# Vérifier le contenu (sans afficher les valeurs sensibles)
grep -E "^[A-Z_]+" .env.local
```

**Solution :**
```env
# Template .env.local complet
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon

# CardTrader
VITE_CARDTRADER_API_TOKEN=votre_token_cardtrader
REACT_APP_CARDTRADER_API_TOKEN=votre_token_cardtrader

# Développement
VITE_SITE_URL=https://dev.tcgbot.local:3000
HTTPS=true
```

#### Erreurs de connexion Supabase
**Symptômes :**
- "Invalid API key"
- "Project not found"
- Problèmes d'authentification

**Solutions :**
1. **Vérifier l'URL et la clé :**
   ```javascript
   // src/supabaseClient.js
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Anon Key présente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

2. **Vérifier les politiques RLS :**
   ```sql
   -- Dans Supabase Studio
   SELECT * FROM pg_policies WHERE tablename = 'collections';
   ```

3. **Tester la connexion :**
   ```javascript
   // Console développeur
   const { data, error } = await supabase.from('collections').select('*').limit(1);
   console.log('Test connexion:', { data, error });
   ```

### 🗄️ Problèmes de Base de Données

#### Migrations non appliquées
**Symptômes :**
- "Relation does not exist"
- "Column does not exist"
- Erreurs SQL dans la console

**Solution :**
```sql
-- Vérifier les tables existantes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Appliquer les migrations manquantes
-- Dans Supabase Studio > SQL Editor
\i 'db/migrations/create_listings_table.sql'
\i 'db/migrations/add_is_foil_to_price_history.sql'
```

#### Problèmes de permissions RLS
**Symptômes :**
- "Insufficient permissions"
- Données non visibles malgré l'authentification

**Diagnostic :**
```sql
-- Vérifier l'utilisateur actuel
SELECT auth.uid(), auth.email();

-- Vérifier les politiques
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Solution :**
```sql
-- Réinitialiser les politiques de base
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
CREATE POLICY "Users can view own collections" ON collections
    FOR ALL USING (auth.uid() = user_id);
```

### 🚀 Problèmes de Performance

#### Application lente au démarrage
**Symptômes :**
- Temps de chargement > 5 secondes
- "Building..." prolongé

**Solutions :**
```bash
# Nettoyer le cache
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Build optimisé
npm run build
npm run preview
```

#### Requêtes API lentes
**Symptômes :**
- Timeouts fréquents
- Recherches qui traînent

**Diagnostic :**
```javascript
// Mesurer les performances API
console.time('API Call');
const result = await cardTraderAPI.searchCards(query);
console.timeEnd('API Call');
```

**Solutions :**
1. **Optimiser le cache :**
   ```javascript
   // Augmenter les TTL dans les proxies
   const CACHE_TTL = {
       games: 24 * 60 * 60 * 1000,      // 24h
       expansions: 12 * 60 * 60 * 1000,  // 12h
       blueprints: 6 * 60 * 60 * 1000    // 6h
   };
   ```

2. **Implémenter la pagination :**
   ```javascript
   // Limiter les résultats
   const searchWithPagination = async (query, page = 1, limit = 20) => {
       return await api.search({ query, page, limit });
   };
   ```

### 🧪 Problèmes de Développement

#### Hot reload ne fonctionne pas
**Symptômes :**
- Modifications non reflétées automatiquement
- Besoin de rafraîchir manuellement

**Solutions :**
```javascript
// vite.config.js
export default defineConfig({
    server: {
        watch: {
            usePolling: true,
            interval: 100
        }
    }
});
```

#### Erreurs ESLint/Prettier
**Symptômes :**
- Warnings en masse
- Formatage incohérent

**Solutions :**
```bash
# Auto-fix des erreurs corrigibles
npm run lint:fix
npm run format

# Ignorer temporairement
// eslint-disable-next-line rule-name
const problematicCode = something;
```

## 🔧 Outils de Diagnostic

### Script de Diagnostic Complet
```javascript
// scripts/diagnose.js
const diagnostic = {
    async checkEnvironment() {
        console.log('🔍 Vérification environnement...');
        
        const requiredVars = [
            'VITE_SUPABASE_URL',
            'VITE_SUPABASE_ANON_KEY', 
            'VITE_CARDTRADER_API_TOKEN'
        ];
        
        requiredVars.forEach(varName => {
            const value = process.env[varName];
            console.log(`${varName}: ${value ? '✅' : '❌'}`);
        });
    },
    
    async checkPorts() {
        console.log('🔍 Vérification ports...');
        
        const ports = [3000, 8010, 8020, 8021];
        
        for (const port of ports) {
            try {
                const response = await fetch(`http://localhost:${port}`);
                console.log(`Port ${port}: ✅`);
            } catch (error) {
                console.log(`Port ${port}: ❌`);
            }
        }
    },
    
    async checkDatabase() {
        console.log('🔍 Vérification base de données...');
        
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('count')
                .limit(1);
                
            console.log('Connexion Supabase:', error ? '❌' : '✅');
        } catch (error) {
            console.log('Connexion Supabase: ❌', error.message);
        }
    }
};

// Exécuter tous les diagnostics
diagnostic.checkEnvironment();
diagnostic.checkPorts();
diagnostic.checkDatabase();
```

### Commandes de Debug Rapides
```bash
# Vérifier tous les processus Node.js
ps aux | grep node

# Vérifier les ports occupés
netstat -tulpn | grep :80

# Logs en temps réel des proxies
tail -f server/logs/*.log

# Test de connectivité API
curl -H "Authorization: Bearer $VITE_CARDTRADER_API_TOKEN" \
     https://api.cardtrader.com/api/v2/games
```

## 📚 FAQ

### Q : Comment réinitialiser complètement l'environnement ?
```bash
# Arrêter tous les processus
pkill -f "node.*proxy"

# Nettoyer complètement
rm -rf node_modules package-lock.json
rm -rf .vite
npm install

# Redémarrer proprement
npm run start
```

### Q : Les images de cartes ne se chargent pas ?
- Vérifier les URLs d'images dans la base de données
- Tester l'accès direct aux URLs d'images
- Vérifier les politiques CORS des serveurs d'images

### Q : Comment déboguer les erreurs de listing CardTrader ?
```javascript
// Activer les logs détaillés
const debug = true;

if (debug) {
    console.log('Données envoyées:', listingData);
    console.log('Réponse API:', response);
}
```

### Q : L'application ne se lance pas sur le port 3000 ?
```bash
# Trouver le processus utilisant le port
lsof -ti:3000

# Arrêter le processus
kill -9 $(lsof -ti:3000)

# Ou utiliser un autre port
PORT=3001 npm run dev
```

## 🚨 En Cas d'Urgence

### Restauration Rapide
1. **Sauvegarder les données** critiques
2. **Git reset** au dernier commit stable
3. **Redémarrer tous les services**
4. **Vérifier la configuration**

### Contacts et Support
- **Documentation** : `/docs` folder
- **Issues GitHub** : Repository issues
- **Logs détaillés** : Console navigateur + serveur
- **Supabase Dashboard** : Interface complète BDD

---

## 📚 Documentation Connexe

### Configuration et Installation
- [🚀 Installation](../02-INSTALLATION-GUIDE.md) - Guide complet de configuration
- [💻 Développement](../05-DEVELOPMENT.md) - Scripts et outils de debugging
- [🌐 Déploiement](../deployment/DEPLOYMENT.md) - Problèmes de production

### Architecture Technique
- [🏗️ Architecture](../03-ARCHITECTURE.md) - Comprendre la structure système
- [🔌 APIs](../06-APIS.md) - Configuration des proxies et endpoints
- [🗄️ Base de Données](../04-DATABASE.md) - Problèmes de connexion Supabase

### Fonctionnalités Spécifiques
- [🛒 Listings CardTrader](../features/CARDTRADER-LISTINGS.md) - Debug marketplace
- [📖 Vue d'ensemble](../01-PROJECT-OVERVIEW.md) - Contexte fonctionnel

---

**En cas de problème non couvert, vérifier d'abord les logs de la console développeur et des serveurs proxy pour identifier la source de l'erreur.**

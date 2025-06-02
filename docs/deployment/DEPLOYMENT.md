# 🚀 Déploiement et Production

## Vue d'Ensemble du Déploiement

**Da TCG Bot** est conçu pour être déployé facilement sur différentes plateformes cloud avec une architecture séparée entre frontend et proxies API.

## 🏗️ Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION                              │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vercel/Netlify)     │    APIs Proxies (Railway)  │
│  ├── React App Build           │    ├── CardTrader Proxy    │
│  ├── Static Assets             │    ├── Lorcast Proxy       │
│  └── CDN Distribution          │    └── JustTCG Proxy       │
├─────────────────────────────────────────────────────────────┤
│              Backend (Supabase Cloud)                      │
│  ├── PostgreSQL Database       │                            │
│  ├── Authentication            │                            │
│  ├── Real-time APIs            │                            │
│  └── Storage                   │                            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Stratégies de Déploiement Recommandées

### Option 1: Déploiement Séparé (Recommandé)

#### Frontend → Vercel
- **Avantages** : CDN global, déploiement automatique, domaine custom gratuit
- **Configuration** : Zero-config avec Git integration

#### Proxies API → Railway
- **Avantages** : Support Node.js natif, prix abordable, scaling automatique
- **Configuration** : Déploiement par service

#### Backend → Supabase Cloud
- **Avantages** : Géré complètement, scaling automatique, backups
- **Configuration** : Projet cloud existant

### Option 2: Déploiement Unifié

#### Tout-en-un → DigitalOcean App Platform
- **Avantages** : Infrastructure unifiée, gestion simplifiée
- **Configuration** : Multi-service dans un seul projet

## 🔧 Configuration pour la Production

### Variables d'Environnement Production

#### Frontend (.env.production)
```env
# Supabase Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Proxies URLs (Production)
VITE_CARDTRADER_PROXY_URL=https://cardtrader-proxy.railway.app
VITE_LORCAST_PROXY_URL=https://lorcast-proxy.railway.app
VITE_JUSTTCG_PROXY_URL=https://justtcg-proxy.railway.app

# Production Settings
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Proxies (.env pour chaque service)
```env
# Commun à tous les proxies
NODE_ENV=production
PORT=8080
CORS_ORIGINS=https://your-domain.com

# CardTrader Proxy
CARDTRADER_API_TOKEN=your_production_token
CARDTRADER_RATE_LIMIT=1000

# Lorcast Proxy  
LORCAST_API_KEY=your_lorcast_key

# JustTCG Proxy
JUSTTCG_API_KEY=your_justtcg_key
```

### Optimisations Build Production

#### Configuration Vite Optimisée
```javascript
// vite.config.prod.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ],
  
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false, // Désactiver en production
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparation des vendors pour cache optimal
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils-vendor': ['axios', 'lodash']
        }
      }
    },
    
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en production
        drop_debugger: true
      }
    }
  },
  
  // Configuration pour optimiser les assets
  assetsInclude: ['**/*.woff2', '**/*.woff']
});
```

## 🌐 Déploiement Frontend (Vercel)

### 1. Configuration Vercel

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_CARDTRADER_PROXY_URL": "@cardtrader-proxy-url",
    "VITE_LORCAST_PROXY_URL": "@lorcast-proxy-url",
    "VITE_JUSTTCG_PROXY_URL": "@justtcg-proxy-url"
  },
  
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/app/:path*",
      "destination": "/:path*",
      "permanent": false
    }
  ]
}
```

### 2. Script de Déploiement
```bash
#!/bin/bash
# deploy-frontend.sh

echo "🚀 Déploiement Frontend Production"

# Vérifications pré-déploiement
echo "🔍 Vérification environnement..."
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL manquant"
    exit 1
fi

# Build optimisé
echo "🏗️ Build production..."
npm run build

# Tests de build
echo "🧪 Test du build..."
npm run preview &
PREVIEW_PID=$!
sleep 5

# Test de base
curl -f http://localhost:4173 || {
    echo "❌ Build défectueux"
    kill $PREVIEW_PID
    exit 1
}

kill $PREVIEW_PID
echo "✅ Build validé"

# Déploiement
echo "🚀 Déploiement vers Vercel..."
vercel --prod

echo "✅ Déploiement frontend terminé"
```

## 🔄 Déploiement Proxies API (Railway)

### 1. Configuration Railway

#### railway.toml
```toml
[build]
builder = "NIXPACKS"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "cardtrader-proxy"
source = "server/cardtrader-proxy.mjs"

[services.variables]
NODE_ENV = "production"
PORT = "8080"

[[services]]
name = "lorcast-proxy" 
source = "server/lorcast-proxy.mjs"

[[services]]
name = "justtcg-proxy"
source = "justtcg-proxy.mjs"
```

### 2. Dockerfile pour Proxies
```dockerfile
# Dockerfile.proxy
FROM node:18-alpine

WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY server/ ./server/
COPY justtcg-proxy.mjs ./

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8080

# Exposer le port
EXPOSE 8080

# Commande de démarrage (sera override par Railway)
CMD ["node", "server/cardtrader-proxy.mjs"]
```

### 3. Script de Déploiement Proxies
```bash
#!/bin/bash
# deploy-proxies.sh

echo "🔄 Déploiement Proxies API"

services=("cardtrader-proxy" "lorcast-proxy" "justtcg-proxy")

for service in "${services[@]}"; do
    echo "🚀 Déploiement $service..."
    
    # Deploy to Railway
    railway service $service
    railway up --service $service
    
    # Vérifier le déploiement
    echo "🔍 Vérification $service..."
    railway logs --service $service --lines 10
done

echo "✅ Tous les proxies déployés"
```

## 🗄️ Configuration Base de Données Production

### 1. Migration vers Production
```sql
-- Scripts de migration production
-- 1. Backup base de développement
pg_dump -h dev.supabase.co -U postgres -d postgres > dev_backup.sql

-- 2. Nettoyer les données de test
DELETE FROM user_collections WHERE collection_id IN (
    SELECT id FROM collections WHERE name LIKE '%test%'
);

-- 3. Optimiser les index pour production
CREATE INDEX CONCURRENTLY idx_user_collections_user_search 
    ON user_collections(collection_id, foil, condition);

CREATE INDEX CONCURRENTLY idx_price_history_recent 
    ON price_history(card_printing_id, recorded_at DESC) 
    WHERE recorded_at > NOW() - INTERVAL '30 days';

-- 4. Configurer les politiques RLS strictes
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access" ON collections;
```

### 2. Configuration Monitoring Base
```sql
-- Créer table pour monitoring
CREATE TABLE monitoring_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service VARCHAR NOT NULL,
    level VARCHAR NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_monitoring_logs_service_time 
    ON monitoring_logs(service, created_at DESC);

-- Fonction de nettoyage automatique
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM monitoring_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM price_history 
    WHERE recorded_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Configurer cron job (Extension pg_cron nécessaire)
SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs();');
```

## 📊 Monitoring et Observabilité

### 1. Configuration Sentry
```javascript
// src/utils/monitoring.js
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

if (import.meta.env.PROD) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 0.1,
        beforeSend(event) {
            // Filtrer les erreurs non critiques
            if (event.exception) {
                const error = event.exception.values[0];
                if (error.type === 'ChunkLoadError') {
                    return null; // Ignorer les erreurs de chunk loading
                }
            }
            return event;
        }
    });
}

export const captureError = (error, context = {}) => {
    console.error(error);
    if (import.meta.env.PROD) {
        Sentry.captureException(error, { extra: context });
    }
};
```

### 2. Health Checks pour Proxies
```javascript
// server/health-check.js
export const createHealthCheck = (serviceName) => {
    return (req, res) => {
        const startTime = Date.now();
        
        const healthStatus = {
            service: serviceName,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version
        };
        
        // Vérifications spécifiques selon le service
        if (serviceName === 'cardtrader-proxy') {
            healthStatus.hasApiToken = !!process.env.CARDTRADER_API_TOKEN;
        }
        
        const responseTime = Date.now() - startTime;
        healthStatus.responseTime = responseTime;
        
        res.status(200).json(healthStatus);
    };
};

// Ajouter aux proxies
app.get('/health', createHealthCheck('cardtrader-proxy'));
```

### 3. Monitoring Script
```javascript
// scripts/monitor-production.js
const monitorServices = async () => {
    const services = [
        'https://your-app.vercel.app',
        'https://cardtrader-proxy.railway.app/health',
        'https://lorcast-proxy.railway.app/health',
        'https://justtcg-proxy.railway.app/health'
    ];
    
    for (const service of services) {
        try {
            const response = await fetch(service, { timeout: 5000 });
            if (response.ok) {
                console.log(`✅ ${service}: OK`);
            } else {
                console.log(`⚠️ ${service}: ${response.status}`);
                // Envoyer alerte
            }
        } catch (error) {
            console.log(`❌ ${service}: ${error.message}`);
            // Envoyer alerte critique
        }
    }
};

// Exécuter toutes les 5 minutes
setInterval(monitorServices, 5 * 60 * 1000);
```

## 🔐 Sécurité Production

### 1. Configuration HTTPS et Sécurité
```javascript
// Configuration headers sécurité
const securityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
};
```

### 2. Gestion des Secrets
```bash
# Variables secrètes par service
# Vercel
vercel env add VITE_SUPABASE_ANON_KEY production

# Railway
railway variables set CARDTRADER_API_TOKEN=your_token
railway variables set NODE_ENV=production
```

## 📈 Optimisation Performance Production

### 1. CDN et Cache
```javascript
// Configuration cache browser
const cacheHeaders = {
    // Assets statiques (images, fonts)
    '/assets/*': 'public, max-age=31536000, immutable',
    
    // HTML
    '/': 'public, max-age=0, must-revalidate',
    
    // API responses (courte durée)
    '/api/*': 'public, max-age=300'
};
```

### 2. Optimisation Bundle
```bash
# Analyse du bundle
npm run build
npx vite-bundle-analyzer dist

# Optimisations recommandées
npm install --save-dev compression-webpack-plugin
npm install --save-dev workbox-webpack-plugin
```

## 🚀 Processus de Déploiement Complet

### Script de Déploiement Global
```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 DÉPLOIEMENT PRODUCTION DA TCG BOT"
echo "===================================="

# 1. Vérifications pré-déploiement
echo "🔍 Vérifications pré-déploiement..."
npm run test
npm run lint
npm run type-check

# 2. Build et test
echo "🏗️ Build production..."
npm run build
npm run preview &
PREVIEW_PID=$!

# Test smoke
sleep 10
curl -f http://localhost:4173 || {
    echo "❌ Build défectueux"
    kill $PREVIEW_PID
    exit 1
}
kill $PREVIEW_PID

# 3. Déploiement proxies
echo "🔄 Déploiement proxies..."
./scripts/deploy-proxies.sh

# 4. Attendre stabilisation proxies
echo "⏳ Attente stabilisation..."
sleep 30

# 5. Tests APIs
echo "🧪 Tests APIs production..."
./scripts/test-production-apis.sh

# 6. Déploiement frontend
echo "🌐 Déploiement frontend..."
vercel --prod

# 7. Tests post-déploiement
echo "✅ Tests post-déploiement..."
sleep 30
./scripts/test-production-app.sh

echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
```

---

## 📚 Documentation Connexe

### Préparation au Déploiement
- [🚀 Installation](../02-INSTALLATION-GUIDE.md) - Configuration environnement local
- [💻 Développement](../05-DEVELOPMENT.md) - Scripts de build et configuration
- [🏗️ Architecture](../03-ARCHITECTURE.md) - Structure à déployer

### Configuration Production
- [🗄️ Base de Données](../04-DATABASE.md) - Configuration Supabase production
- [🔌 APIs](../06-APIS.md) - Proxies et endpoints en production
- [🛒 Listings CardTrader](../features/CARDTRADER-LISTINGS.md) - Mode production marketplace

### Support et Maintenance
- [🐛 Troubleshooting](../troubleshooting/TROUBLESHOOTING.md) - Résolution problèmes production
- [📖 Vue d'ensemble](../01-PROJECT-OVERVIEW.md) - Contexte et objectifs du projet

---

**Ce guide de déploiement couvre tous les aspects pour mettre Da TCG Bot en production de manière sécurisée et performante.**

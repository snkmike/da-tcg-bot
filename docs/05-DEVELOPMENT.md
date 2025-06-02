# ⚙️ Configuration et Développement

## 🛠️ Configuration de l'Environnement

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# ═══════════════════════════════════════════
# SUPABASE CONFIGURATION
# ═══════════════════════════════════════════
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ═══════════════════════════════════════════
# CARDTRADER API
# ═══════════════════════════════════════════
REACT_APP_CARDTRADER_API_TOKEN=votre_token_cardtrader
VITE_CARDTRADER_API_TOKEN=votre_token_cardtrader

# ═══════════════════════════════════════════
# APIS EXTERNES (Optionnel)
# ═══════════════════════════════════════════
JUSTTCG_API_KEY=votre_cle_justtcg
LORCAST_API_KEY=votre_cle_lorcast

# ═══════════════════════════════════════════
# DÉVELOPPEMENT HTTPS
# ═══════════════════════════════════════════
VITE_SITE_URL=https://dev.tcgbot.local:3000
HTTPS=true
HOST=dev.tcgbot.local
PORT=3000

# ═══════════════════════════════════════════
# CONFIGURATION AVANCÉE (Optionnel)
# ═══════════════════════════════════════════
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### Configuration Supabase

#### 1. Création du Projet
```bash
# Installer Supabase CLI
npm install -g @supabase/cli

# Connexion
supabase login

# Initialiser le projet local
supabase init
```

#### 2. Variables de Configuration
- **URL du Projet** : Disponible dans Settings > API
- **Clé Anon** : Clé publique pour authentification frontend
- **Clé Service** : Clé privée pour opérations serveur (à garder secrète)

#### 3. Configuration RLS (Row Level Security)
```sql
-- Activer RLS sur toutes les tables sensibles
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
```

### Configuration CardTrader

#### 1. Obtention du Token API
1. Créer un compte sur [CardTrader.com](https://cardtrader.com)
2. Aller dans Profile > API Token
3. Générer un nouveau token
4. Ajouter le token dans `.env.local`

#### 2. Configuration du Proxy
```javascript
// server/cardtrader-proxy.mjs
const CARDTRADER_CONFIG = {
    baseURL: 'https://api.cardtrader.com/api/v2',
    token: process.env.VITE_CARDTRADER_API_TOKEN,
    timeout: 10000,
    retries: 3
};
```

## 🏗️ Workflow de Développement

### 1. Installation Initiale
```bash
# Cloner le repository
git clone <url_repository>
cd da-tcg-bot

# Installer les dépendances
npm install

# Copier le template d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Éditer .env.local avec vos valeurs
```

### 2. Développement Local

#### Démarrage Standard
```bash
# Frontend seulement
npm run dev
```

#### Démarrage HTTPS (Recommandé)
```bash
# Terminal 1 - Frontend HTTPS
npm run start

# Terminal 2 - Proxy CardTrader
node server/cardtrader-proxy.mjs

# Terminal 3 - Proxy Lorcast  
node server/lorcast-proxy.mjs

# Terminal 4 - Proxy JustTCG
node justtcg-proxy.mjs
```

#### Configuration HTTPS Complète
```bash
# 1. Ajouter au fichier hosts
# Windows: C:\Windows\System32\drivers\etc\hosts
# macOS/Linux: /etc/hosts
echo "127.0.0.1 dev.tcgbot.local" >> /etc/hosts

# 2. Vérifier les certificats
ls -la dev.tcgbot.local*.pem

# 3. Accéder à l'application
# URL: https://dev.tcgbot.local:3000
```

### 3. Scripts NPM Disponibles

```json
{
  "scripts": {
    "dev": "vite",
    "start": "node scripts/start-https.js",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,json,css,md}",
    "analyze": "npm run build && npx vite-bundle-analyzer dist",
    "proxy:cardtrader": "node server/cardtrader-proxy.mjs",
    "proxy:lorcast": "node server/lorcast-proxy.mjs", 
    "proxy:justtcg": "node justtcg-proxy.mjs",
    "proxies": "concurrently \"npm run proxy:cardtrader\" \"npm run proxy:lorcast\" \"npm run proxy:justtcg\"",
    "db:migrate": "supabase db reset && supabase db push",
    "db:seed": "node scripts/seed-database.js",
    "update-prices": "node server/updatePricesDaily.js"
  }
}
```

## 🧰 Outils de Développement

### Configuration Vite
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Configuration HTTPS
  server: {
    https: {
      key: './dev.tcgbot.local-key.pem',
      cert: './dev.tcgbot.local.pem'
    },
    host: 'dev.tcgbot.local',
    port: 3000,
    
    // Proxies pour APIs externes en développement
    proxy: {
      '/api/cardtrader': 'http://localhost:8021',
      '/api/lorcast': 'http://localhost:8020',
      '/api/justtcg': 'http://localhost:8010'
    }
  },
  
  // Résolution des chemins
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@config': resolve(__dirname, 'src/config')
    }
  },
  
  // Optimisations build
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### Configuration Tailwind
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Configuration ESLint
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

## 🔧 Configuration des Proxies

### Proxy CardTrader Avancé
```javascript
// server/cardtrader-proxy.mjs
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 8021;

// Configuration CORS
app.use(cors({
  origin: ['https://dev.tcgbot.local:3000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Middleware d'authentification
const authenticateRequest = (req, res, next) => {
  const token = process.env.VITE_CARDTRADER_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'CardTrader token not configured' });
  }
  req.cardtraderToken = token;
  next();
};

// Cache intelligent
const cache = new Map();
const CACHE_TTL = 3600000; // 1 heure

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Routes API
app.get('/games', authenticateRequest, async (req, res) => {
  try {
    const cached = getCachedData('games');
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get('https://api.cardtrader.com/api/v2/games', {
      headers: { 'Authorization': `Bearer ${req.cardtraderToken}` }
    });

    setCachedData('games', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('CardTrader API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch games',
      details: error.response?.data 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔄 CardTrader Proxy running on port ${PORT}`);
});
```

## 🧪 Tests et Qualité

### Configuration Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Tests d'Exemple
```javascript
// src/components/__tests__/SearchTab.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import SearchTab from '../search/SearchTab';

describe('SearchTab', () => {
  test('renders search input', () => {
    render(<SearchTab />);
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('handles search input change', () => {
    render(<SearchTab />);
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    
    fireEvent.change(searchInput, { target: { value: 'Mickey Mouse' } });
    expect(searchInput.value).toBe('Mickey Mouse');
  });
});
```

## 📊 Monitoring et Debugging

### Logs Structurés
```javascript
// src/utils/logger.js
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

export const logger = {
  error: (message, data = {}) => {
    console.error(`[ERROR] ${message}`, data);
    // Envoyer à service monitoring en production
  },
  
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  info: (message, data = {}) => {
    if (import.meta.env.VITE_DEBUG_MODE) {
      console.info(`[INFO] ${message}`, data);
    }
  },
  
  debug: (message, data = {}) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};
```

### Performance Monitoring
```javascript
// src/utils/performance.js
export const performanceMonitor = {
  startTimer: (label) => {
    console.time(label);
  },
  
  endTimer: (label) => {
    console.timeEnd(label);
  },
  
  measureAsync: async (label, asyncFunction) => {
    const start = performance.now();
    try {
      const result = await asyncFunction();
      const end = performance.now();
      console.log(`${label} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${label} failed after ${end - start} milliseconds`, error);
      throw error;
    }
  }
};
```

## 🚀 Optimisation et Performance

### Code Splitting React
```javascript
// src/app/routes.jsx
import { lazy, Suspense } from 'react';

// Composants chargés paresseusement
const SearchTab = lazy(() => import('../components/search/SearchTab'));
const ListingsTab = lazy(() => import('../components/listings/ListingsTab'));
const CollectionTab = lazy(() => import('../components/collection/MyCollectionTab'));

export const AppRoutes = () => (
  <Suspense fallback={<div>Chargement...</div>}>
    <Routes>
      <Route path="/search" element={<SearchTab />} />
      <Route path="/listings" element={<ListingsTab />} />
      <Route path="/collection" element={<CollectionTab />} />
    </Routes>
  </Suspense>
);
```

### Mémorisation et Optimisation
```javascript
// src/hooks/useOptimizedSearch.js
import { useMemo, useCallback, useState } from 'react';
import { debounce } from 'lodash';

export const useOptimizedSearch = (searchFunction, delay = 300) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchFunction(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay),
    [searchFunction, delay]
  );

  const search = useCallback((query) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  return { results, isLoading, search };
};
```

---

## 📚 Documentation Connexe

### Mise en Place
- [🚀 Installation](./02-INSTALLATION-GUIDE.md) - Configuration initiale de l'environnement
- [🏗️ Architecture](./03-ARCHITECTURE.md) - Structure technique et composants
- [🗄️ Base de Données](./04-DATABASE.md) - Schéma et migrations

### APIs et Intégrations
- [🔌 APIs](./06-APIS.md) - Configuration des proxies et endpoints
- [🛒 Listings CardTrader](./features/CARDTRADER-LISTINGS.md) - Développement marketplace
- [🐛 Troubleshooting](./troubleshooting/TROUBLESHOOTING.md) - Résolution problèmes développement

### Déploiement
- [🌐 Déploiement](./deployment/DEPLOYMENT.md) - Mise en production
- [📖 Vue d'ensemble](./01-PROJECT-OVERVIEW.md) - Objectifs et contexte du projet

---

**Configuration robuste assurant un environnement de développement optimal et une application performante en production.**

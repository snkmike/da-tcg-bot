# 🌐 APIs et Intégrations

## Vue d'Ensemble des APIs

**Da TCG Bot** intègre trois APIs principales via des serveurs proxy Node.js pour optimiser les performances et gérer l'authentification de manière sécurisée.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Proxies API    │────▶│  APIs Externes  │
│   React App     │     │                  │     │                 │
│   Port 3000     │     │ CardTrader 8021  │     │ CardTrader API  │
│                 │     │ Lorcast   8020   │     │ Lorcast API     │
│                 │     │ JustTCG   8010   │     │ JustTCG API     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 🛒 CardTrader API (Port 8021)

### Configuration et Authentification

#### Setup Initial
```javascript
// server/cardtrader-proxy.mjs
const CARDTRADER_CONFIG = {
    baseURL: 'https://api.cardtrader.com/api/v2',
    token: process.env.VITE_CARDTRADER_API_TOKEN,
    timeout: 15000,
    retries: 3,
    rateLimitDelay: 1000
};
```

#### Authentification
```javascript
const authenticateRequest = (req, res, next) => {
    const token = process.env.VITE_CARDTRADER_API_TOKEN;
    if (!token) {
        return res.status(500).json({ 
            error: 'CardTrader API token not configured' 
        });
    }
    req.headers['Authorization'] = `Bearer ${token}`;
    next();
};
```

### Endpoints Principaux

#### 1. Jeux et Extensions
```javascript
// GET /games - Liste des jeux disponibles
app.get('/games', authenticateRequest, async (req, res) => {
    const cached = getCachedData('games');
    if (cached) return res.json(cached);
    
    const response = await cardtraderRequest('/games');
    setCachedData('games', response.data, 24 * 60 * 60 * 1000); // 24h cache
    res.json(response.data);
});

// GET /expansions/:gameId - Extensions d'un jeu
app.get('/expansions/:gameId', authenticateRequest, async (req, res) => {
    const { gameId } = req.params;
    const cacheKey = `expansions_${gameId}`;
    
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);
    
    const response = await cardtraderRequest(`/expansions`, { game_id: gameId });
    setCachedData(cacheKey, response.data, 12 * 60 * 60 * 1000); // 12h cache
    res.json(response.data);
});
```

#### 2. Blueprints (Cartes Vendables)
```javascript
// GET /blueprints/:expansionId - Cartes d'une extension
app.get('/blueprints/:expansionId', authenticateRequest, async (req, res) => {
    const { expansionId } = req.params;
    const { page = 1, per_page = 100 } = req.query;
    
    const cacheKey = `blueprints_${expansionId}_${page}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);
    
    const response = await cardtraderRequest(`/blueprints`, {
        expansion_id: expansionId,
        page,
        per_page
    });
    
    setCachedData(cacheKey, response.data, 6 * 60 * 60 * 1000); // 6h cache
    res.json(response.data);
});

// GET /blueprints/search - Recherche de blueprints
app.get('/blueprints/search', authenticateRequest, async (req, res) => {
    const { name, expansion_id, collector_number } = req.query;
    
    const response = await cardtraderRequest('/blueprints', {
        name,
        expansion_id,
        collector_number,
        per_page: 50
    });
    
    res.json(response.data);
});
```

#### 3. Gestion des Listings
```javascript
// POST /listings - Créer un listing
app.post('/listings', authenticateRequest, async (req, res) => {
    const listingData = {
        blueprint_id: req.body.blueprint_id,
        price: req.body.price,
        quantity: req.body.quantity,
        user_data_field: req.body.user_data_field,
        properties: {
            condition: req.body.condition,
            language: req.body.language,
            mtg_foil: req.body.foil || false,
            signed: req.body.signed || false,
            altered: req.body.altered || false
        }
    };

    try {
        const response = await cardtraderRequest('/listings', listingData, 'POST');
        res.json({
            success: true,
            listing_id: response.data.id,
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
});

// GET /listings - Récupérer les listings utilisateur
app.get('/listings', authenticateRequest, async (req, res) => {
    const { status = 'active', page = 1 } = req.query;
    
    const response = await cardtraderRequest('/listings', {
        status,
        page,
        per_page: 50
    });
    
    res.json(response.data);
});

// DELETE /listings/:id - Supprimer un listing
app.delete('/listings/:id', authenticateRequest, async (req, res) => {
    const { id } = req.params;
    
    try {
        await cardtraderRequest(`/listings/${id}`, {}, 'DELETE');
        res.json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
});
```

### Fonctions Utilitaires CardTrader

#### Cache Intelligent
```javascript
const cache = new Map();

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

const setCachedData = (key, data, ttl = 3600000) => {
    cache.set(key, { 
        data, 
        timestamp: Date.now(), 
        ttl 
    });
};
```

#### Gestion des Erreurs et Rate Limiting
```javascript
const cardtraderRequest = async (endpoint, params = {}, method = 'GET') => {
    const config = {
        method,
        url: `${CARDTRADER_CONFIG.baseURL}${endpoint}`,
        headers: {
            'Authorization': `Bearer ${CARDTRADER_CONFIG.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: CARDTRADER_CONFIG.timeout
    };

    if (method === 'GET') {
        config.params = params;
    } else {
        config.data = params;
    }

    for (let attempt = 1; attempt <= CARDTRADER_CONFIG.retries; attempt++) {
        try {
            const response = await axios(config);
            return response;
        } catch (error) {
            if (error.response?.status === 429) {
                // Rate limit atteint, attendre avant retry
                const delay = CARDTRADER_CONFIG.rateLimitDelay * attempt;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            if (attempt === CARDTRADER_CONFIG.retries) {
                throw error;
            }
            
            // Retry pour erreurs réseau
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};
```

## 🃏 Lorcast API (Port 8020)

### Configuration
```javascript
// server/lorcast-proxy.mjs
const LORCAST_CONFIG = {
    baseURL: 'https://api.lorcast.com/v0',
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'Da-TCG-Bot/1.0'
    }
};
```

### Endpoints Lorcana

#### 1. Recherche de Cartes
```javascript
// GET /cards - Recherche de cartes Lorcana
app.get('/cards', async (req, res) => {
    const { 
        name, 
        set, 
        rarity, 
        cost, 
        inkable,
        type,
        page = 1 
    } = req.query;

    const params = {
        name,
        set,
        rarity,
        cost,
        inkable,
        type,
        page,
        per_page: 50
    };

    // Filtrer les paramètres vides
    Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
            delete params[key];
        }
    });

    try {
        const response = await axios.get(`${LORCAST_CONFIG.baseURL}/cards`, {
            params,
            headers: LORCAST_CONFIG.headers,
            timeout: LORCAST_CONFIG.timeout
        });

        res.json({
            success: true,
            data: response.data,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(response.data.total / 50)
            }
        });
    } catch (error) {
        console.error('Lorcast API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to search cards',
            details: error.response?.data
        });
    }
});
```

#### 2. Sets et Extensions
```javascript
// GET /sets - Liste des sets Lorcana
app.get('/sets', async (req, res) => {
    const cacheKey = 'lorcana_sets';
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get(`${LORCAST_CONFIG.baseURL}/sets`, {
            headers: LORCAST_CONFIG.headers
        });

        const data = {
            success: true,
            data: response.data
        };

        setCachedData(cacheKey, data, 24 * 60 * 60 * 1000); // Cache 24h
        res.json(data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch sets'
        });
    }
});

// GET /sets/:setCode/cards - Cartes d'un set spécifique
app.get('/sets/:setCode/cards', async (req, res) => {
    const { setCode } = req.params;
    const { page = 1 } = req.query;

    const cacheKey = `set_${setCode}_cards_${page}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get(`${LORCAST_CONFIG.baseURL}/sets/${setCode}/cards`, {
            params: { page, per_page: 100 },
            headers: LORCAST_CONFIG.headers
        });

        const data = {
            success: true,
            data: response.data,
            set_code: setCode
        };

        setCachedData(cacheKey, data, 12 * 60 * 60 * 1000); // Cache 12h
        res.json(data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: `Failed to fetch cards for set ${setCode}`
        });
    }
});
```

## 💰 JustTCG API (Port 8010)

### Configuration
```javascript
// justtcg-proxy.mjs
const JUSTTCG_CONFIG = {
    baseURL: 'https://api.justtcg.com/v1',
    apiKey: process.env.JUSTTCG_API_KEY,
    timeout: 8000,
    rateLimitDelay: 500
};
```

### Endpoints Prix

#### 1. Prix des Cartes
```javascript
// GET /prices/:cardName - Prix d'une carte
app.get('/prices/:cardName', async (req, res) => {
    const { cardName } = req.params;
    const { set, foil = 'false' } = req.query;

    const cacheKey = `price_${cardName}_${set}_${foil}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get(`${JUSTTCG_CONFIG.baseURL}/prices`, {
            params: {
                name: cardName,
                set,
                foil: foil === 'true',
                game: 'lorcana'
            },
            headers: {
                'Authorization': `Bearer ${JUSTTCG_CONFIG.apiKey}`,
                'Accept': 'application/json'
            },
            timeout: JUSTTCG_CONFIG.timeout
        });

        const data = {
            success: true,
            card_name: cardName,
            prices: response.data,
            is_foil: foil === 'true',
            fetched_at: new Date().toISOString()
        };

        setCachedData(cacheKey, data, 30 * 60 * 1000); // Cache 30min
        res.json(data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: `Failed to fetch price for ${cardName}`
        });
    }
});

// POST /prices/batch - Prix en lot
app.post('/prices/batch', async (req, res) => {
    const { cards } = req.body;
    
    if (!Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Cards array is required'
        });
    }

    const results = [];
    
    for (const card of cards) {
        try {
            // Délai pour respecter rate limit
            await new Promise(resolve => 
                setTimeout(resolve, JUSTTCG_CONFIG.rateLimitDelay)
            );

            const response = await axios.get(`${JUSTTCG_CONFIG.baseURL}/prices`, {
                params: {
                    name: card.name,
                    set: card.set,
                    foil: card.foil || false,
                    game: 'lorcana'
                },
                headers: {
                    'Authorization': `Bearer ${JUSTTCG_CONFIG.apiKey}`
                }
            });

            results.push({
                card: card,
                success: true,
                prices: response.data
            });
        } catch (error) {
            results.push({
                card: card,
                success: false,
                error: error.response?.data || error.message
            });
        }
    }

    res.json({
        success: true,
        results,
        total_processed: cards.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
    });
});
```

## 🔄 Client API Frontend

### Service CardTrader
```javascript
// src/utils/api/cardTraderAPI.js
const CARDTRADER_PROXY_URL = 'http://localhost:8021';

export const cardTraderAPI = {
    // Récupérer les jeux
    async getGames() {
        const response = await fetch(`${CARDTRADER_PROXY_URL}/games`);
        return response.json();
    },

    // Récupérer les extensions
    async getExpansions(gameId) {
        const response = await fetch(`${CARDTRADER_PROXY_URL}/expansions/${gameId}`);
        return response.json();
    },

    // Rechercher des blueprints
    async searchBlueprints(params) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${CARDTRADER_PROXY_URL}/blueprints/search?${queryString}`);
        return response.json();
    },

    // Créer un listing
    async createListing(listingData) {
        const response = await fetch(`${CARDTRADER_PROXY_URL}/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listingData)
        });
        return response.json();
    },

    // Récupérer les listings utilisateur
    async getUserListings(status = 'active') {
        const response = await fetch(`${CARDTRADER_PROXY_URL}/listings?status=${status}`);
        return response.json();
    }
};
```

### Service Lorcast
```javascript
// src/utils/api/lorcanaAPI.js
const LORCAST_PROXY_URL = 'http://localhost:8020';

export const lorcanaAPI = {
    // Rechercher des cartes
    async searchCards(params) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${LORCAST_PROXY_URL}/cards?${queryString}`);
        return response.json();
    },

    // Récupérer les sets
    async getSets() {
        const response = await fetch(`${LORCAST_PROXY_URL}/sets`);
        return response.json();
    },

    // Cartes d'un set
    async getSetCards(setCode, page = 1) {
        const response = await fetch(`${LORCAST_PROXY_URL}/sets/${setCode}/cards?page=${page}`);
        return response.json();
    }
};
```

### Hook de Recherche Unifiée
```javascript
// src/hooks/useUnifiedSearch.js
import { useState, useCallback } from 'react';
import { cardTraderAPI } from '../utils/api/cardTraderAPI';
import { lorcanaAPI } from '../utils/api/lorcanaAPI';

export const useUnifiedSearch = () => {
    const [results, setResults] = useState({
        lorcana: [],
        cardtrader: [],
        loading: false,
        error: null
    });

    const search = useCallback(async (query, filters = {}) => {
        setResults(prev => ({ ...prev, loading: true, error: null }));

        try {
            const [lorcanaResponse, cardtraderResponse] = await Promise.allSettled([
                lorcanaAPI.searchCards({ name: query, ...filters }),
                cardTraderAPI.searchBlueprints({ name: query, ...filters })
            ]);

            setResults({
                lorcana: lorcanaResponse.status === 'fulfilled' ? lorcanaResponse.value.data : [],
                cardtrader: cardtraderResponse.status === 'fulfilled' ? cardtraderResponse.value.data : [],
                loading: false,
                error: null
            });
        } catch (error) {
            setResults(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, []);

    return { results, search };
};
```

## 🛡️ Sécurité et Bonnes Pratiques

### Validation des Données
```javascript
// Validation côté proxy
const validateListingData = (data) => {
    const errors = [];
    
    if (!data.blueprint_id || !Number.isInteger(data.blueprint_id)) {
        errors.push('Blueprint ID is required and must be an integer');
    }
    
    if (!data.price || data.price <= 0) {
        errors.push('Price must be greater than 0');
    }
    
    if (!data.quantity || data.quantity < 1) {
        errors.push('Quantity must be at least 1');
    }
    
    const validConditions = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Light Played', 'Played', 'Poor'];
    if (!validConditions.includes(data.condition)) {
        errors.push('Invalid condition');
    }
    
    return errors;
};
```

### Gestion des Erreurs
```javascript
// Middleware de gestion d'erreurs global
const errorHandler = (error, req, res, next) => {
    console.error('API Error:', {
        url: req.url,
        method: req.method,
        error: error.message,
        stack: error.stack
    });

    if (error.response) {
        // Erreur de l'API externe
        res.status(error.response.status).json({
            success: false,
            error: 'External API error',
            details: error.response.data
        });
    } else if (error.code === 'ECONNABORTED') {
        // Timeout
        res.status(408).json({
            success: false,
            error: 'Request timeout'
        });
    } else {
        // Erreur serveur
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
```

---

## 📚 Documentation Connexe

### Développement
- [🏗️ Architecture](./03-ARCHITECTURE.md) - Structure technique et flux de données
- [💻 Configuration de Développement](./05-DEVELOPMENT.md) - Workflow et scripts
- [🐛 Troubleshooting](./troubleshooting/TROUBLESHOOTING.md) - Résolution des problèmes API

### Fonctionnalités
- [🛒 Listings CardTrader](./features/CARDTRADER-LISTINGS.md) - Intégration marketplace complète
- [🔍 Recherche Unifiée](./01-PROJECT-OVERVIEW.md#recherche-unifiée) - Système de recherche multi-API

### Installation et Déploiement
- [🚀 Installation](./02-INSTALLATION-GUIDE.md) - Configuration des proxies
- [🌐 Déploiement](./deployment/DEPLOYMENT.md) - Mise en production des APIs

---

*Dernière mise à jour : Juin 2025*

**Cette architecture API robuste permet une intégration transparente avec tous les services externes tout en optimisant les performances et la sécurité.**

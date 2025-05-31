// server/cardtrader-proxy.mjs
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8021;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Read CardTrader API token from environment or .env.local file
let API_TOKEN = process.env.REACT_APP_CARDTRADER_API_TOKEN;

if (!API_TOKEN) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const tokenMatch = envContent.match(/REACT_APP_CARDTRADER_API_TOKEN=(.+)/);
    if (tokenMatch) {
      API_TOKEN = tokenMatch[1].trim();
    }
  } catch (error) {
    console.warn('⚠️ Could not read .env.local file');
  }
}

if (!API_TOKEN) {
  console.error('❌ CardTrader API token not found');
  process.exit(1);
}

console.log('🎯 CardTrader API token loaded:', API_TOKEN.substring(0, 20) + '...');

const BASE_URL = 'https://api.cardtrader.com/api/v2';

// Middleware to add CardTrader headers
const addCardTraderHeaders = (req, res, next) => {
  req.cardTraderHeaders = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  next();
};

app.use(addCardTraderHeaders);

// GET /cardtrader/info (fixed endpoint)
app.get('/cardtrader/info', async (req, res) => {
  try {
    console.log('🌐 Fetching app info from CardTrader...');
    const response = await fetch(`${BASE_URL}/info`, {
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ CardTrader app info:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ CardTrader app_info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /cardtrader/games
app.get('/cardtrader/games', async (req, res) => {
  try {
    console.log('🌐 Fetching games from CardTrader...');
    const response = await fetch(`${BASE_URL}/games`, {
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // CardTrader API returns {array: [...]} format, unwrap it
    const games = data.array || data;
    console.log('✅ CardTrader games count:', games.length);
    res.json(games);
  } catch (error) {
    console.error('❌ CardTrader games error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /cardtrader/expansions
app.get('/cardtrader/expansions', async (req, res) => {
  try {
    console.log('🌐 Fetching expansions from CardTrader...');
    const response = await fetch(`${BASE_URL}/expansions`, {
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // CardTrader API returns {array: [...]} format, unwrap it
    const expansions = data.array || data;
    console.log('✅ CardTrader expansions count:', expansions.length);
    res.json(expansions);
  } catch (error) {
    console.error('❌ CardTrader expansions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /cardtrader/blueprints/export (with query params)
app.get('/cardtrader/blueprints/export', async (req, res) => {
  try {
    const queryString = Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query).toString() : '';
    console.log(`🌐 Fetching blueprints from CardTrader with params: ${queryString}`);
    const response = await fetch(`${BASE_URL}/blueprints/export${queryString}`, {
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // CardTrader API returns {array: [...]} format, unwrap it
    const blueprints = data.array || data;
    console.log('✅ CardTrader blueprints count:', blueprints.length);
    res.json(blueprints);
  } catch (error) {
    console.error('❌ CardTrader blueprints error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /cardtrader/products/export (user's products)
app.get('/cardtrader/products/export', async (req, res) => {
  try {
    console.log('🌐 Fetching user products from CardTrader...');
    const response = await fetch(`${BASE_URL}/products/export`, {
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // CardTrader API returns {array: [...]} format, unwrap it
    const products = data.array || data;
    console.log('✅ CardTrader user products count:', products.length);
    res.json(products);
  } catch (error) {
    console.error('❌ CardTrader products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /cardtrader/products (user's products - legacy route)
app.get('/cardtrader/products', async (req, res) => {
  try {
    console.log('🌐 Fetching user products from CardTrader...');
    const response = await fetch(`${BASE_URL}/products/export`, {
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // CardTrader API returns {array: [...]} format, unwrap it
    const products = data.array || data;
    console.log('✅ CardTrader user products count:', products.length);
    res.json(products);
  } catch (error) {
    console.error('❌ CardTrader products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /cardtrader/products (create product)
app.post('/cardtrader/products', async (req, res) => {
  try {
    console.log('🌐 Creating product on CardTrader:', req.body);
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: req.cardTraderHeaders,
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ CardTrader product created:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ CardTrader create product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /cardtrader/products/:id
app.delete('/cardtrader/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🌐 Deleting product ${id} from CardTrader...`);
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: req.cardTraderHeaders
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ CardTrader product deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ CardTrader delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ CardTrader Proxy running at http://localhost:${PORT}`);
});

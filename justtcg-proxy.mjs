// justtcg-proxy.mjs
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
console.log(`🔑 Clé API brute: ${process.env.JUSTTCG_API_KEY}`);


const app = express();
const PORT = 8010;
const BASE_URL = 'https://api.justtcg.com/functions/v1';
const API_KEY = process.env.JUSTTCG_API_KEY || 'NO_KEY_LOADED';

app.use(cors());

// 🔒 Log de contrôle pour l’API Key
console.log(`🔑 API KEY chargée: ${API_KEY.startsWith('tcg_') ? '[OK]' : '[ABSENTE OU INVALIDE]'}`);

app.get('/cards-search', async (req, res) => {
  const url = new URL(`${BASE_URL}/cards-search`);
  for (const [key, value] of Object.entries(req.query)) {
    url.searchParams.append(key, value);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.get('/lorcast/cards', async (req, res) => {
  const url = new URL('https://api.lorcast.com/cards');
  for (const [key, value] of Object.entries(req.query)) {
    url.searchParams.append(key, value);
  }

  try {
    const response = await fetch(url.href);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy /lorcast/cards:', err);
    res.status(500).json({ error: 'Erreur proxy Lorcast' });
  }
});

app.get('/lorcast/sets', async (req, res) => {
  try {
    const response = await fetch('https://api.lorcast.com/sets');
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Erreur proxy /lorcast/sets:', err);
    res.status(500).json({ error: 'Erreur proxy Lorcast' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ JustTCG Proxy running at http://localhost:${PORT}`);
});

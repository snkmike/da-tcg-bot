// server/lorcast-proxy.mjs
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 8020;

app.use(cors());

app.get('/lorcast/cards', async (req, res) => {
  const { name } = req.query;
  const url = `https://api.lorcast.com/v0/cards/search?q=${encodeURIComponent(name)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Lorcast Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Lorcast API' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Lorcast Proxy running at http://localhost:${PORT}`);
});

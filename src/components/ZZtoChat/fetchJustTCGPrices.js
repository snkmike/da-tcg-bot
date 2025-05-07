// src/components/utils/fetchJustTCGPrices.js

const IS_LOCAL = window.location.hostname === 'localhost';
const BASE_URL = IS_LOCAL
  ? 'http://localhost:8010/cards-search'
  : 'https://api.justtcg.com/functions/v1/cards-search';

function inferGameFromSet(setName) {
  const magicSets = ['Alpha', 'Beta', 'Unlimited', 'Revised', 'Stronghold', 'Worldwake'];
  const pokemonSets = ['Base Set', 'Jungle', 'Fossil', 'Team Rocket'];
  const yugiohSets = ['LOB', 'MRD', 'IOC', 'GLD'];

  if (magicSets.includes(setName)) return 'mtg';
  if (pokemonSets.includes(setName)) return 'pokemon';
  if (yugiohSets.includes(setName)) return 'yugioh';
  return '';
}

export async function updatePricesForCards(localCards) {
  const updated = [];

  for (const card of localCards) {
    const game = inferGameFromSet(card.set);
    if (!game) {
      console.warn(`❌ Jeu non reconnu pour l'extension : ${card.set}`);
      updated.push(card);
      continue;
    }

    const url = new URL(BASE_URL);
    url.searchParams.append('q', card.name);
    url.searchParams.append('game', game);
    url.searchParams.append('set', card.set);
    url.searchParams.append('limit', '5');

    try {
      console.log(`🔍 Recherche API pour "${card.name}" (${game}, ${card.set})`);
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`❌ API JustTCG a retourné un statut ${response.status}`);
        updated.push(card);
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data?.data)) {
        console.warn(`⚠️ Réponse inattendue pour ${card.name}:`, data);
        updated.push(card);
        continue;
      }

      console.log("🎯 Résultats API:", data.data.map(c => c.name));

      const exactMatch = data.data.find(apiCard => apiCard.name === card.name);
      const partialMatch = data.data.find(apiCard => apiCard.name.includes(card.name));
      const match = exactMatch || partialMatch;

      const variant = match?.variations?.[0];
      if (!match || !variant) {
        console.warn(`❌ Aucune donnée pour ${card.name} (${card.set})`);
        updated.push(card);
        continue;
      }

      updated.push({
        ...card,
        avg: variant.price || 0,
        low: variant.price || 0,
        trend: variant.price || 0,
        priceBought: variant.price || card.priceBought
      });

      console.log(`✅ ${card.name} → ${variant.price}€`);
    } catch (err) {
      console.error(`❌ Erreur API pour ${card.name}:`, err.message);
      updated.push(card);
    }
  }

  return updated;
}

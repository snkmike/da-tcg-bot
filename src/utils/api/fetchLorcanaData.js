//src/utils/api/fetchLorcanaData.js
// This function fetches data from the Lorcana API based on the provided query and filters.
// It handles errors and formats the data for easier use in the application.      // This export is used in src/components/search/SearchBox.jsx
// this is useful for the search bar in the header and the search page by name.
export async function fetchLorcanaData(query, filterSet, minPrice, maxPrice, selectedRarities, showSetResults) {
  console.log('🔎 Fetching Lorcana data with:', { query, filterSet, minPrice, maxPrice, selectedRarities, showSetResults });

  // Return early if no query is provided
  if (!query || query.trim().length < 3) {
    console.log('⚠️ Query too short or empty. Skipping fetch.');
    return [];
  }

  try {
    let allCards = [];

    // Ensure rarity filters are not applied by default
    const rarityFilter = selectedRarities && selectedRarities.length > 0
      ? selectedRarities.map(rarity => `rarity:${rarity}`).join(' OR ')
      : null;
    const fullQuery = rarityFilter ? `${query} (${rarityFilter})` : query;

    // Log the full query for debugging
    console.log('🔍 Full query:', fullQuery);

    // Use the full query including both Enchanted and normal cards
    const searchResponse = await fetch(`https://api.lorcast.com/v0/cards/search?q=${encodeURIComponent(fullQuery)}`);
    if (!searchResponse.ok) {
      throw new Error(`API returned status ${searchResponse.status}: ${searchResponse.statusText}`);
    }

    const searchJson = await searchResponse.json();

    if (!Array.isArray(searchJson.results)) {
      throw new Error('Invalid search response format');
    }

    allCards = searchJson.results.map(card => ({
      id: card.id,
      name: card.name,
      version: card.version || null,
      set_name: card.set?.name || 'Set inconnu',
      rarity: card.rarity,
      image: card.image_uris?.digital?.normal || '',
      price: card.prices?.usd || null,
      foil_price: card.prices?.usd_foil || null,
      collector_number: card.collector_number,
      set_code: card.set?.code || '',
      isFoil: false,
      card_printing_id: card.id
    }));

    // Perform an additional search for Enchanted cards
    const enchantedQuery = `${query} (rarity:enchanted)`;
    console.log('🔍 Enchanted query:', enchantedQuery);

    const enchantedResponse = await fetch(`https://api.lorcast.com/v0/cards/search?q=${encodeURIComponent(enchantedQuery)}`);
    if (!enchantedResponse.ok) {
      throw new Error(`API returned status ${enchantedResponse.status}: ${enchantedResponse.statusText}`);
    }

    const enchantedJson = await enchantedResponse.json();

    if (!Array.isArray(enchantedJson.results)) {
      throw new Error('Invalid enchanted search response format');
    }

    const enchantedCards = enchantedJson.results.map(card => ({
      id: card.id,
      name: card.name,
      version: card.version || null,
      set_name: card.set?.name || 'Set inconnu',
      rarity: card.rarity,
      image: card.image_uris?.digital?.normal || '',
      price: card.prices?.usd || null,
      foil_price: card.prices?.usd_foil || null,
      collector_number: card.collector_number,
      set_code: card.set?.code || '',
      isFoil: false,
      card_printing_id: card.id
    }));

    // Combine normal and enchanted cards
    allCards = [...allCards, ...enchantedCards];

    // Filter by rarity if specified
    const filteredByRarity = selectedRarities.length > 0
      ? allCards.filter(card => selectedRarities.includes(card.rarity?.toLowerCase()))
      : allCards;

    // Filter by price range if specified
    const filteredByPrice = filteredByRarity.filter(card => {
      const price = parseFloat(card.price || 0);
      const min = parseFloat(minPrice || 0);
      const max = parseFloat(maxPrice || Infinity);
      return price >= min && price <= max;
    });

    // Sort results if required
    const sortedResults = showSetResults
      ? [...filteredByPrice].sort((a, b) => (a.set_name || '').localeCompare(b.set_name || ''))
      : filteredByPrice;

    return sortedResults;
  } catch (err) {
    console.error('❌ Erreur fetch Lorcana:', err);
    return [];
  }
}

export async function fetchCardByNumber(setCode, numbers) {
  try {
    if (!setCode) {
      console.error('❌ Code de set manquant');
      return { cards: [], duplicates: {} };
    }

    // Si un seul numéro est passé en string, on le convertit en tableau
    const originalNumbers = typeof numbers === 'string' ? [numbers] : [...numbers];
    
    // Analyser les doublons, en gardant distinct les numéros normaux et foil
    const duplicates = {};
    console.log('🔍 Nombres originaux reçus:', originalNumbers);

    originalNumbers.forEach(num => {
      const trimmed = num.trim();
      duplicates[trimmed] = (duplicates[trimmed] || 0) + 1;
      console.log(`📊 Comptage '${trimmed}':`, duplicates[trimmed]);
    });

    console.log('📋 Tableau des doublons:', duplicates);

    // Traiter chaque numéro pour l'API (retirer les F)
    const apiNumbers = [...new Set(originalNumbers.map(n => n.trim().replace(/F$/i, '')))]; 
    console.log('🎯 Numéros uniques pour API (sans F):', apiNumbers);

    // Ne garder que les vrais doublons et créer les warnings
    const duplicateInfo = {};
    Object.entries(duplicates).forEach(([num, count]) => {
      console.log(`🔄 Analyse doublon '${num}':`, count);
      if (count > 1) {
        duplicateInfo[num] = {
          count: count,
          text: `#${num} (${count} fois)`
        };
        console.log(`⚠️ Doublon détecté pour '${num}':`, duplicateInfo[num]);
      }
    });

    // Créer un tableau de promesses pour les requêtes en parallèle
    const cardPromises = apiNumbers.map(async (number) => {
      const url = `https://api.lorcast.com/v0/cards/${setCode}/${number}`;
      console.log('🔍 Recherche carte:', { url });
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`❌ Carte ${setCode}/${number} introuvable`);
        return null;
      }
      const card = await response.json();
      
      // Retourner la carte avec toutes ses informations de prix
      return {
        id: card.id,
        name: card.name,
        version: card.version || null,
        set_name: card.set?.name || 'Set inconnu',
        rarity: card.rarity,
        image: card.image_uris?.digital?.normal || '',
        prices: card.prices, // Garder l'objet prices complet
        collector_number: card.collector_number,
        set_code: setCode,
        set_name: card.set?.name || 'Set inconnu',
        card_printing_id: card.id
      };
    });

    // Exécuter toutes les requêtes en parallèle
    const results = await Promise.all(cardPromises);
    // Filtrer les résultats null (cartes non trouvées)
    const filteredResults = results.filter(card => card !== null);

    console.log('📦 Cartes trouvées:', filteredResults);

    // Retourner les résultats avec les informations sur les doublons
    return {
      cards: filteredResults,
      duplicates: duplicateInfo
    };
  } catch (err) {
    console.error('❌ Erreur fetch par numéro :', err);
    return {
      cards: [], 
      duplicates: {}
    };
  }
}

export async function fetchLorcanaSets() {
  try {
    const response = await fetch('https://api.lorcast.com/v0/sets');
    const json = await response.json();
    return json.results.map(set => ({
      code: set.code,
      name: set.name,
      icon: set.icon_uri || null
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('❌ Erreur fetch sets Lorcana:', err);
    return [];
  }
}

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
    // Fetch all sets and their cards in parallel
    const setsResponse = await fetch('https://api.lorcast.com/v0/sets');
    if (!setsResponse.ok) {
      throw new Error(`API returned status ${setsResponse.status}: ${setsResponse.statusText}`);
    }

    const setsJson = await setsResponse.json();

    if (!Array.isArray(setsJson.results)) {
      throw new Error('Invalid sets response format');
    }

    // Fetch cards for all sets in parallel
    const setCardsPromises = setsJson.results.map(async (set) => {
      try {
        const setCardsResponse = await fetch(`https://api.lorcast.com/v0/sets/${set.code}/cards`);
        if (!setCardsResponse.ok) {
          console.warn(`⚠️ Failed to fetch cards for set ${set.code}`);
          return [];
        }

        const setCardsJson = await setCardsResponse.json();
        // Directly create entries for each available version (normal, foil)
        return setCardsJson.flatMap(apiCard => {
          const versionsOutput = [];
          const commonData = {
            card_printing_id: apiCard.id,
            name: apiCard.name,
            api_version_name: apiCard.version || null,
            set_name: apiCard.set?.name || 'Set inconnu',
            rarity: apiCard.rarity,
            image: apiCard.image_uris?.digital?.normal || '',
            collector_number: apiCard.collector_number,
            set_code: apiCard.set?.code || '',
          };

          const hasNormalPrice = apiCard.prices?.usd !== null && apiCard.prices?.usd !== undefined;
          const hasFoilPrice = apiCard.prices?.usd_foil !== null && apiCard.prices?.usd_foil !== undefined;

          if (hasNormalPrice) {
            versionsOutput.push({
              ...commonData,
              id: `${apiCard.id}-normal`,
              price: apiCard.prices.usd,
              isFoil: false,
            });
          }

          if (hasFoilPrice) {
            versionsOutput.push({
              ...commonData,
              id: `${apiCard.id}-foil`,
              price: apiCard.prices.usd_foil,
              isFoil: true,
            });
          }

          if (versionsOutput.length === 0) {
            // Card has no listed prices, create a default entry
            let defaultIsFoil = false;
            if (commonData.api_version_name) {
              const lowerVersion = commonData.api_version_name.toLowerCase();
              if (lowerVersion.includes('enchanted') || lowerVersion.includes('foil') || lowerVersion.includes('promo')) {
                defaultIsFoil = true;
              }
            }
            versionsOutput.push({
              ...commonData,
              id: `${apiCard.id}-default`,
              price: null,
              isFoil: defaultIsFoil,
            });
          }
          return versionsOutput;
        });
      } catch (err) {
        console.warn(`⚠️ Error fetching cards for set ${set.code}:`, err);
        return [];
      }
    });

    const allCardsArrays = await Promise.all(setCardsPromises);
    const allCards = allCardsArrays.flat(); // allCards now contains all distinct versions

    console.log('📦 Total card versions generated:', allCards.length);

    // Apply filters locally using the new allCards list
    const filteredByQuery = query
      ? allCards.filter(card => card.name.toLowerCase().includes(query.toLowerCase()))
      : allCards;

    const filteredByRarity = selectedRarities.length > 0
      ? filteredByQuery.filter(card => selectedRarities.includes(card.rarity?.toLowerCase()))
      : filteredByQuery;

    const filteredByPrice = filteredByRarity.filter(card => {
      const price = parseFloat(card.price || 0); // Use card.price directly
      const min = parseFloat(minPrice || 0);
      const max = parseFloat(maxPrice || Infinity);
      return price >= min && price <= max;
    });

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

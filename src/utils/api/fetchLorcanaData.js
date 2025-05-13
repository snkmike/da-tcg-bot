//src/utils/api/fetchLorcanaData.js
// This function fetches data from the Lorcana API based on the provided query and filters.
// It handles errors and formats the data for easier use in the application.      // This export is used in src/components/search/SearchBox.jsx
// this is useful for the search bar in the header and the search page by name.
export async function fetchLorcanaData(query, filterSet, minPrice, maxPrice, selectedRarities, showSetResults) {
  console.log('🔎 Fetching Lorcana data with:', { query, filterSet, minPrice, maxPrice, selectedRarities, showSetResults });
  try {
    const nameEncoded = encodeURIComponent(query || 'Elsa');
    const response = await fetch(`https://api.lorcast.com/v0/cards/search?q=${nameEncoded}`);
    const json = await response.json();

    // Créer deux entrées pour chaque carte si elle a une version foil
    const formatted = (json.results || []).reduce((acc, card) => {
      // Extraire l'UUID du format crd_UUID
      const cardUUID = card.id.replace('crd_', '');
      
      const baseCard = {
        id: card.id,
        name: card.name,
        version: card.version || null,
        set_name: card.set?.name || 'Set inconnu',
        rarity: card.rarity,          image: card.image_uris?.digital?.normal || '',
          price: card.prices?.usd || null,
          foil_price: card.prices?.usd_foil || null,
          collector_number: card.collector_number,
          set_code: card.set?.code || '',
          set_name: card.set?.name || 'Set inconnu',
          isFoil: false,
          card_printing_id: card.id
        };

        acc.push(baseCard);

        if (card.prices?.usd_foil) {
          acc.push({
            ...baseCard,
            id: `${card.id}_foil`,
            isFoil: true,
            price: card.prices.usd_foil,
            card_printing_id: card.id // Use same UUID for foil version
          });
        }

      return acc;
    }, []);

    const filtered = filterSet === 'all'
      ? formatted
      : formatted.filter(card => card.set_name === filterSet);

    const priceFiltered = filtered.filter(card => {
      const p = parseFloat(card.price || 0);
      const min = parseFloat(minPrice || 0);
      const max = parseFloat(maxPrice || Infinity);
      return p >= min && p <= max;
    });

    const rarityFiltered = selectedRarities.length === 0
      ? priceFiltered
      : priceFiltered.filter(card =>
          selectedRarities.includes((card.rarity || '').toLowerCase())
        );

    let final = rarityFiltered;
    if (showSetResults) {
      final = [...rarityFiltered].sort((a, b) =>
        (a.set_name || '').localeCompare(b.set_name || '')
      );
    }

    return final;
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

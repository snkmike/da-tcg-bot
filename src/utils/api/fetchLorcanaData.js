// src/utils/api/fetchLorcanaData.js

export async function fetchLorcanaData(query, filterSet, minPrice, maxPrice, selectedRarities, showSetResults) {
  try {
    const nameEncoded = encodeURIComponent(query || 'Elsa');

    const [resBase, resEnchanted, resPromo] = await Promise.all([
      fetch(`http://localhost:8020/lorcast/cards?q=${nameEncoded}`),
      fetch(`http://localhost:8020/lorcast/cards?q=${nameEncoded}+rarity:enchanted`),
      fetch(`http://localhost:8020/lorcast/cards?q=${nameEncoded}+rarity:promo`)
    ]);

    const baseData = await resBase.json();
    const enchantedData = await resEnchanted.json();
    const promoData = await resPromo.json();

    const allResults = [
      ...baseData.results, 
      ...enchantedData.results,
      ...promoData.results
    ];

    const formatted = allResults.map(card => ({
      id: card.id,
      name: card.name,
      set_name: card.set?.name || 'Set inconnu',
      rarity: card.rarity,
      image: card.image_uris?.digital?.normal || '',
      price: card.prices?.usd || null,
      foil_price: card.prices?.usd_foil || null,
      collector_number: card.collector_number,
    }));

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

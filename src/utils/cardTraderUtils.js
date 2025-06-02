// Utilitaires pour CardTrader - logique métier centralisée

/**
 * Détecte si une carte CardTrader est Foil basé sur la structure API
 * @param {Object} blueprint - L'objet blueprint de CardTrader
 * @returns {boolean} - true si la carte est Foil
 */
export const isCardFoil = (blueprint) => {
  if (!blueprint) return false;

  // 1. Vérifier fixed_properties.finish (valeur directe)
  const finish = blueprint.fixed_properties?.finish;
  if (finish && (finish === 'foil' || finish.toLowerCase().includes('foil'))) {
    console.log(`🔍 Foil détecté via finish: ${blueprint.name} (finish: ${finish})`);
    return true;
  }
  
  // 2. Vérifier fixed_properties.treatment pour holo/special
  const treatment = blueprint.fixed_properties?.treatment;
  if (treatment && (treatment === 'holo' || treatment === 'etched' || treatment.toLowerCase().includes('foil'))) {
    console.log(`🔍 Foil détecté via treatment: ${blueprint.name} (treatment: ${treatment})`);
    return true;
  }
  
  // 3. Vérifier properties_hash.finish (array de finitions disponibles)
  const finishArray = blueprint.properties_hash?.finish;
  if (Array.isArray(finishArray) && finishArray.some(f => f === 'foil' || f.toLowerCase().includes('foil'))) {
    console.log(`🔍 Foil détecté via properties_hash: ${blueprint.name} (finishes: ${finishArray.join(', ')})`);
    return true;
  }
  
  // 4. Vérifier properties_hash.treatment (array de traitements)
  const treatmentArray = blueprint.properties_hash?.treatment;
  if (Array.isArray(treatmentArray) && treatmentArray.some(t => t === 'holo' || t === 'etched' || t.toLowerCase().includes('foil'))) {
    console.log(`🔍 Foil détecté via properties_hash treatment: ${blueprint.name} (treatments: ${treatmentArray.join(', ')})`);
    return true;
  }
  
  // 5. Vérifier la version
  const version = (blueprint.version || '').toLowerCase();
  if (version.includes('foil') || version.includes('holo')) {
    console.log(`🔍 Foil détecté via version: ${blueprint.name} (version: ${blueprint.version})`);
    return true;
  }
  
  // 6. Vérifier le nom comme fallback (dernier recours)
  const cardName = (blueprint.name || '').toLowerCase();
  if (cardName.includes('foil') || cardName.includes('holo')) {
    console.log(`🔍 Foil détecté via nom: ${blueprint.name}`);
    return true;
  }
  
  return false;
};

/**
 * Extrait le nom de base d'une carte (sans "Foil", "Holo", etc.)
 * @param {Object} blueprint - L'objet blueprint de CardTrader
 * @returns {string} - Le nom de base de la carte
 */
export const getBaseCardName = (blueprint) => {
  if (!blueprint || !blueprint.name) return '';
  
  const cardName = blueprint.name;
  // Supprimer les suffixes/préfixes Foil communs
  return cardName
    .replace(/\s*\(foil\)/gi, '')
    .replace(/\s*foil\s*/gi, ' ')
    .replace(/\s*holo\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Trie les blueprints avec gestion spéciale des cartes Foil
 * @param {Array} blueprints - Liste des blueprints à trier
 * @param {string} sortOrder - 'alphabetical' ou 'rarity'
 * @param {boolean} includeFoil - Si les cartes Foil sont incluses
 * @returns {Array} - Blueprints triés
 */
export const sortBlueprints = (blueprints, sortOrder = 'alphabetical', includeFoil = false) => {
  return [...blueprints].sort((a, b) => {
    // Si les cartes Foil sont incluses, grouper par nom de base
    if (includeFoil) {
      const baseNameA = getBaseCardName(a);
      const baseNameB = getBaseCardName(b);
      const isFoilA = isCardFoil(a);
      const isFoilB = isCardFoil(b);
      
      // Comparer d'abord par nom de base selon le tri sélectionné
      let baseComparison = 0;
      switch (sortOrder) {
        case 'alphabetical':
          baseComparison = baseNameA.localeCompare(baseNameB);
          break;
        case 'rarity':
          const rarityA = a.fixed_properties?.lorcana_rarity || a.rarity || '';
          const rarityB = b.fixed_properties?.lorcana_rarity || b.rarity || '';
          baseComparison = rarityA.localeCompare(rarityB) || baseNameA.localeCompare(baseNameB);
          break;
        default:
          baseComparison = baseNameA.localeCompare(baseNameB);
      }
      
      // Si les noms de base sont identiques, trier par version (non-Foil puis Foil)
      if (baseComparison === 0) {
        if (isFoilA && !isFoilB) return 1;  // Foil après non-Foil
        if (!isFoilA && isFoilB) return -1; // non-Foil avant Foil
        return 0; // Même type
      }
      
      return baseComparison;
    } else {
      // Tri normal quand les Foil ne sont pas incluses
      const nameA = a.name || '';
      const nameB = b.name || '';
      
      switch (sortOrder) {
        case 'alphabetical':
          return nameA.localeCompare(nameB);
        case 'rarity':
          const rarityA = a.fixed_properties?.lorcana_rarity || a.rarity || '';
          const rarityB = b.fixed_properties?.lorcana_rarity || b.rarity || '';
          return rarityA.localeCompare(rarityB) || nameA.localeCompare(nameB);
        default:
          return nameA.localeCompare(nameB);
      }
    }
  });
};

/**
 * Convertit un blueprint CardTrader au format card standard pour réutiliser les composants existants
 * @param {Object} blueprint - Blueprint CardTrader
 * @param {Object} expansion - Extension associée (optionnel)
 * @returns {Object} - Carte au format standard
 */
export const convertBlueprintToCard = (blueprint, expansion = null) => {
  if (!blueprint) return null;

  return {
    // Format standard
    id: blueprint.id,
    name: blueprint.name,
    image_url: blueprint.image_url,
    
    // Informations spécifiques CardTrader
    source: 'cardtrader',
    blueprint_id: blueprint.id,
    category_id: blueprint.category_id,
    
    // Propriétés de la carte
    collector_number: blueprint.fixed_properties?.collector_number,
    rarity: blueprint.fixed_properties?.lorcana_rarity || blueprint.rarity,
    version: blueprint.version,
    description: blueprint.description,
    
    // Extension
    set: expansion ? {
      name: expansion.name,
      code: expansion.code,
      icon_url: expansion.icon_url,
      released_at: expansion.released_at
    } : null,
    
    // Jeu
    game: blueprint.game,
    
    // IDs externes
    scryfall_id: blueprint.scryfall_id,
    tcg_player_id: blueprint.tcg_player_id,
    card_market_ids: blueprint.card_market_ids,
    
    // Propriétés éditables
    editable_properties: blueprint.editable_properties,
    
    // Données brutes pour debug
    _raw: blueprint
  };
};

// searchUtils.js
// Fonctions utilitaires pour la recherche

// Fonction pour extraire le numéro de collection d'un blueprint CardTrader
export const extractCollectorNumber = (blueprint) => {
  // IMPORTANT: Dans CardTrader, les blueprints n'ont PAS de collector_number direct
  // Les numéros de collection sont spécifiques aux produits, pas aux blueprints
  // Un blueprint peut avoir plusieurs collector_numbers selon les réimpressions
  
  // 1. Chercher dans les editable_properties (structure la plus courante)
  if (blueprint.editable_properties && Array.isArray(blueprint.editable_properties)) {
    for (const property of blueprint.editable_properties) {
      if (property.name === 'collector_number' && property.possible_values?.length > 0) {
        // Retourner la première valeur possible
        return property.possible_values[0];
      }
    }
  }
  
  // 2. Chercher dans les fixed_properties (moins courant)
  if (blueprint.fixed_properties?.collector_number) {
    return blueprint.fixed_properties.collector_number;
  }
  
  // 3. Chercher directement dans le blueprint (très rare)
  if (blueprint.collector_number) {
    return blueprint.collector_number;
  }
  
  // 4. Fallback: CardTrader n'a peut-être pas de collector_number pour ce blueprint
  return null;
};

// Validation de la recherche par numéro
export const validateNumberSearch = (searchByNumber, selectedExpansion) => {
  if (!selectedExpansion) {
    return {
      isValid: false,
      error: 'Veuillez d\'abord sélectionner une extension pour la recherche par numéro'
    };
  }
  
  if (!searchByNumber.trim()) {
    return {
      isValid: false,
      error: 'Veuillez entrer au moins un numéro de collection'
    };
  }

  // Valider le format des numéros (permet: 1, 123, 001, 123F, etc.)
  const numbers = searchByNumber.split(',').map(n => n.trim());
  const invalidNumbers = numbers.filter(n => !/^\d+[a-zA-Z]*$/i.test(n));
  
  if (invalidNumbers.length > 0) {
    return {
      isValid: false,
      error: `Format invalide pour: ${invalidNumbers.join(', ')}. Utilisez le format: 1,2,3,123F`
    };
  }
  
  return { isValid: true };
};

// Recherche de cartes par numéro avec différentes stratégies
export const findCardsByNumber = (blueprintsWithNumbers, searchNumbers) => {
  const searchResults = [];
  const notFoundNumbers = [];
  
  searchNumbers.forEach(numberInput => {
    console.log(`🔎 Recherche du numéro: "${numberInput}"`);
    
    const cleanNumber = numberInput.trim();
    let foundItem = null;

    // Stratégie 1: Correspondance exacte (sensible à la casse)
    foundItem = blueprintsWithNumbers.find(item => 
      item.collectorNumber === cleanNumber
    );
    
    // Stratégie 2: Correspondance insensible à la casse
    if (!foundItem) {
      foundItem = blueprintsWithNumbers.find(item => 
        item.collectorNumber?.toLowerCase() === cleanNumber.toLowerCase()
      );
    }
    
    // Stratégie 3: Correspondance partielle (numéro sans lettres)
    if (!foundItem) {
      const numericPart = cleanNumber.replace(/[^0-9]/g, '');
      if (numericPart) {
        foundItem = blueprintsWithNumbers.find(item => {
          const itemNumericPart = item.collectorNumber?.replace(/[^0-9]/g, '');
          return itemNumericPart === numericPart;
        });
      }
    }
    
    // Stratégie 4: Correspondance avec padding (001 = 1)
    if (!foundItem && /^\d+$/.test(cleanNumber)) {
      const paddedNumber = cleanNumber.padStart(3, '0');
      foundItem = blueprintsWithNumbers.find(item => {
        const itemPadded = item.collectorNumber?.replace(/[^0-9]/g, '').padStart(3, '0');
        return itemPadded === paddedNumber;
      });
    }
    
    if (foundItem) {
      console.log(`✅ Trouvé: ${foundItem.blueprint.name} (numéro: ${foundItem.collectorNumber})`);
      
      searchResults.push({
        ...foundItem.blueprint,
        searched_number: numberInput,
        actual_collector_number: foundItem.collectorNumber
      });
    } else {
      console.warn(`❌ Numéro "${numberInput}" non trouvé`);
      notFoundNumbers.push(numberInput);
    }
  });
  
  return { searchResults, notFoundNumbers };
};

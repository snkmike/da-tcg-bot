// useSearchSelection.js
// Hook générique pour la sélection de cartes multi-sources
// Généralisation de useCardTraderSelection pour supporter différentes sources de données

import { useState } from 'react';

// Fonction pour générer une clé unique selon la source de données
const getUniqueKey = (card, dataSource = 'cardtrader') => {
  switch (dataSource) {
    case 'cardtrader':
      return `cardtrader_${card.id}_${card.expansion_id}_${card.category_id}`;
    case 'lorcana':
      return `lorcana_${card.id || card.collector_number}_${card.set_code}`;
    case 'pokemon':
      return `pokemon_${card.id}_${card.set_id || card.set_code}`;
    default:
      // Clé générique basée sur l'ID et le set
      return `${dataSource}_${card.id}_${card.set_code || card.expansion_id || 'unknown'}`;
  }
};

export default function useSearchSelection() {
  const [selectedCards, setSelectedCards] = useState([]);

  const toggleCardSelection = (card, dataSource = 'cardtrader', isSelected = false) => {
    setSelectedCards((prev) => {
      const key = getUniqueKey(card, dataSource);
      const exists = prev.find(c => getUniqueKey(c, dataSource) === key);
      
      if (exists || isSelected) {
        // Si déjà sélectionné, on retire la carte
        return prev.filter(c => getUniqueKey(c, dataSource) !== key);
      } else {
        // Sinon, on l'ajoute avec les propriétés par défaut
        const newCard = {
          ...card,
          quantity: 1,
          quantityFoil: 0,
          source: dataSource // Marquer la source pour la distinction
        };

        // Propriétés spécifiques selon la source
        if (dataSource === 'cardtrader') {
          newCard.name = card.name;
          newCard.collector_number = card.fixed_properties?.collector_number || card.id;
          newCard.expansion_id = card.expansion_id;
          newCard.category_id = card.category_id;
          newCard.rarity = card.fixed_properties?.lorcana_rarity || card.rarity || 'Non spécifiée';
          newCard.game = card.game?.name || 'CardTrader';
          newCard.image_url = card.image_url;
        } else if (dataSource === 'lorcana') {
          newCard.name = card.name;
          newCard.collector_number = card.collector_number;
          newCard.set_code = card.set_code;
          newCard.rarity = card.rarity;
          newCard.game = 'Lorcana';
          newCard.image_url = card.image;
        }
        // Ajouter d'autres sources si nécessaire
        
        console.log(`🟢 [toggleCardSelection] Ajout carte ${dataSource} sélectionnée:`, newCard);
        return [...prev, newCard];
      }
    });
  };

  // Gérer la quantité
  const updateQuantity = (cardId, qty, card, dataSource = 'cardtrader', isFoilQty = false) => {
    setSelectedCards(prev => prev.map(c => {
      if (getUniqueKey(c, dataSource) === getUniqueKey(card, dataSource)) {
        if (isFoilQty) {
          return { ...c, quantityFoil: qty };
        } else {
          return { ...c, quantity: qty };
        }
      }
      return c;
    }));
  };

  // Pour la compatibilité avec le système existant
  const toggleFoil = (cardId, card, dataSource = 'cardtrader') => {
    setSelectedCards(prev => prev.map(c => 
      getUniqueKey(c, dataSource) === getUniqueKey(card, dataSource) 
        ? { ...c, isFoil: !c.isFoil } 
        : c
    ));
  };

  // Fonction pour vider la sélection
  const clearSelection = () => {
    setSelectedCards([]);
  };

  // Fonction pour sélectionner toutes les cartes d'une liste
  const selectAllCards = (cards, dataSource = 'cardtrader') => {
    const allCards = cards.map(card => ({
      ...card,
      quantity: 1,
      quantityFoil: 0,
      source: dataSource
    }));
    setSelectedCards(allCards);
  };

  // Fonction pour vérifier si une carte est sélectionnée
  const isCardSelected = (card, dataSource = 'cardtrader') => {
    const key = getUniqueKey(card, dataSource);
    return selectedCards.some(c => getUniqueKey(c, dataSource) === key);
  };

  // Fonction pour obtenir une carte sélectionnée
  const getSelectedCard = (card, dataSource = 'cardtrader') => {
    const key = getUniqueKey(card, dataSource);
    return selectedCards.find(c => getUniqueKey(c, dataSource) === key);
  };

  return { 
    selectedCards, 
    setSelectedCards, 
    toggleCardSelection, 
    updateQuantity, 
    toggleFoil,
    clearSelection,
    selectAllCards,
    isCardSelected,
    getSelectedCard,
    getUniqueKey 
  };
}

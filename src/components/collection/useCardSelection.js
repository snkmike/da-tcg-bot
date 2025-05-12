import { useState } from 'react';
import { getCardUniqueKey } from '../utils/lorcanaCardUtils';

export default function useCardSelection() {
  const [selectedCards, setSelectedCards] = useState([]);

  // Permet de gérer séparément quantité normale et foil
  const toggleCardSelection = (card, isSelected = false) => {
    setSelectedCards((prev) => {
      const key = getCardUniqueKey(card);
      const exists = prev.find(c => getCardUniqueKey(c) === key);
      if (exists || isSelected) {
        // Si déjà sélectionné, on retire la carte
        return prev.filter(c => getCardUniqueKey(c) !== key);
      } else {
        // Sinon, on l'ajoute
        // 🟢 Correction: forcer la copie de set_code et collector_number si présents
        const {
          set_code = null,
          collector_number = null,
          set_name = null,
          version = null,
          type = null,
          rarity = null,
          image = null,
          oracle_text = null
        } = card;
        const newCard = {
          ...card,
          set_code,
          collector_number,
          set_name,
          version,
          type,
          rarity,
          image,
          oracle_text,
          quantity: 1,
          quantityFoil: 0
        };
        console.log('🟢 [toggleCardSelection] Ajout carte sélectionnée:', newCard);
        return [
          ...prev,
          newCard
        ];
      }
    });
  };
 
  // Ajoute le paramètre isFoilQty pour gérer les deux champs
  const updateQuantity = (id, qty, card, isFoilQty = false) => {
    setSelectedCards(prev => prev.map(c => {
      if (getCardUniqueKey(c) === getCardUniqueKey(card)) {
        // On met à jour la quantité normale ou foil sans écraser l'autre
        if (isFoilQty) {
          return { ...c, quantityFoil: qty };
        } else {
          return { ...c, quantity: qty };
        }
      }
      return c;
    }));
  };

  // toggleFoil reste inchangé (optionnel)
  const toggleFoil = (id, card) => {
    setSelectedCards(prev => prev.map(c => getCardUniqueKey(c) === getCardUniqueKey(card) ? { ...c, isFoil: !c.isFoil } : c));
  };

  return { selectedCards, setSelectedCards, toggleCardSelection, updateQuantity, toggleFoil };
}

import React from 'react';
import { useEffect } from 'react';
import SearchCardItem from './SearchCardItem';
import { getCardUniqueKey } from '../utils/lorcanaCardUtils';

export default function CardGroup({ cards, selectedCards, toggleCardSelection, updateQuantity, toggleFoil, handleSingleAdd, selectedCollection }) {
  useEffect(() => {
    console.log('CardGroup selectedCards:', selectedCards);
  }, [selectedCards]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {cards.map(card => {
        // Normalisation des champs pour la clé unique
        const normalizedCard = {
          ...card,
          collector_number: String(card.collector_number || ''),
          isFoil: card.isFoil === true ? true : false,
        };
        const cardKey = getCardUniqueKey(normalizedCard);
        const selected = selectedCards.find(c => getCardUniqueKey({
          ...c,
          collector_number: String(c.collector_number || ''),
          isFoil: c.isFoil === true ? true : false,
        }) === cardKey);
        const isSelected = !!selected;
        console.log('CardGroup map:', { card, cardKey, isSelected, selected });
        return (
          <SearchCardItem
            key={cardKey}
            card={card}
            isSelected={isSelected}
            selected={selected || {}}
            toggleCardSelection={toggleCardSelection}
            updateQuantity={(id, qty, _card, isFoilQty = false) => updateQuantity(id, qty, card, isFoilQty)}
            toggleFoil={(id) => toggleFoil(id, card)}
            handleSingleAdd={handleSingleAdd}
            selectedCollection={selectedCollection}
            selectedCards={selectedCards}
          />
        );
      })}
    </div>
  );
}

// CollectionDetail.jsx
import React, { useState, useEffect } from 'react';
import SearchCardItem from './SearchCardItem';

export default function CollectionDetail({ collectionCards, allCards }) {
  const [cardsWithDetails, setCardsWithDetails] = useState([]);

  useEffect(() => {
    const mergedCards = collectionCards.map(colCard => {
      const cardDetails = allCards.find(c => c.id === colCard.cardId);
      return {
        ...cardDetails,
        ...colCard, // quantity, isFoil, etc.
      };
    });
    setCardsWithDetails(mergedCards);
  }, [collectionCards, allCards]);

  return (
    <div className="collection-detail">
      {cardsWithDetails.map(card => (
        <SearchCardItem
          key={card.id}
          card={card}
          isSelected={false} // Adjust based on your selection logic
          selected={card}
          toggleCardSelection={() => {}}
          updateQuantity={() => {}}
          toggleFoil={() => {}}
          handleSingleAdd={() => {}}
          selectedCollection={true} // Adjust based on your collection logic
        />
      ))}
    </div>
  );
}
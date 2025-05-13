// CollectionDetails.jsx - Détail d'une collection spécifique
import React, { useState, useEffect } from 'react';
import SearchFilters from '../search/SearchFilters';
import CollectionCardItem from '../cards/CollectionCardItem';

export default function CollectionDetails({ 
  collection, 
  cards, 
  onBack,
  fetchCardsForCollection
}) {
  const [filterSet, setFilterSet] = useState('all');
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showSetResults, setShowSetResults] = useState(false);
  const [filterKey] = useState(0);
  const [sortKey, setSortKey] = useState('alpha');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    // Suppression de l'appel redondant à fetchCardsForCollection
    console.log('🔄 Chargement initial des cartes pour la collection');
  }, []); // Removed dependencies to prevent redundant calls

  const filteredCards = cards.filter(card => {
    if (filterSet !== 'all' && card.set_name !== filterSet) return false;
    if (selectedRarities.length > 0 && !selectedRarities.includes(card.rarity?.toLowerCase())) return false;
    if (minPrice && (parseFloat(card.isFoil ? card.foil_price : card.price) || 0) < parseFloat(minPrice)) return false;
    if (maxPrice && (parseFloat(card.isFoil ? card.foil_price : card.price) || 0) > parseFloat(maxPrice)) return false;
    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    const valA = sortKey === 'price' ? parseFloat(a.price || 0) :
                sortKey === 'number' ? parseInt(a.collector_number || 0) :
                a.name?.toLowerCase();
    const valB = sortKey === 'price' ? parseFloat(b.price || 0) :
                sortKey === 'number' ? parseInt(b.collector_number || 0) :
                b.name?.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <button
        className="mb-4 text-indigo-600 hover:underline"
        onClick={onBack}
      >
        ← Retour aux collections
      </button>

      <h3 className="text-lg font-semibold mb-2">{collection.name}</h3>

      <SearchFilters
        filterSet={filterSet}
        setFilterSet={setFilterSet}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        showSetResults={showSetResults}
        setShowSetResults={setShowSetResults}
        availableSets={[...new Set(cards.map(c => c.set_name))]}
        selectedRarities={selectedRarities}
        setSelectedRarities={setSelectedRarities}
        filterKey={filterKey}
        sortKey={sortKey}
        setSortKey={setSortKey}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {sortedCards.map(card => (
          <CollectionCardItem
            key={`${card.name}_${card.set_name}_${card.collector_number}_${card.isFoil}`}
            card={card}
            onUpdate={() => fetchCardsForCollection(collection.id)}
            collectionId={collection.id}
          >
            <div className="text-sm mt-2">
              <p className="text-green-600 font-bold">Prix normal: {card.price} €</p>
              {card.foil_price > 0 && (
                <p className="text-purple-600 font-bold">Prix foil: {card.foil_price} €</p>
              )}
            </div>
          </CollectionCardItem>
        ))}
      </div>
    </div>
  );
}

export default function CardResult({ searchResults = [], setSelectedCard, groupBySet = false }) {
  console.log('🎴 CardResult reçoit:', {
    searchResults,
    length: searchResults?.length,
    firstCard: searchResults?.[0],
    isArray: Array.isArray(searchResults),
    type: typeof searchResults,
    keys: Object.keys(searchResults || {}),
    stringify: JSON.stringify(searchResults)
  });

  // Protection contre les résultats non valides
  const validResults = Array.isArray(searchResults) ? searchResults : [];
  
  if (validResults.length === 0) {
    console.log('❌ CardResult: Pas de résultats valides à afficher');
    return <p className="text-gray-500">Aucun résultat trouvé.</p>;
  }

  console.log('✅ CardResult: Affichage de', validResults.length, 'résultats');

  const renderCard = (card) => (
    <div
      key={card.id}
      className="border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50"
      onClick={() => setSelectedCard(card)}
    >
      <div className="flex justify-between gap-4">
        {card.image && (
          <img 
            src={card.image} 
            alt={card.name} 
            className="w-16 h-16 object-contain rounded"
          />
        )}
        <div className="flex-1">
          <h4 className="font-medium">{card.name}</h4>
          <p className="text-sm text-gray-600">{card.set_name || card.set || ''}</p>
          <p className="text-sm text-gray-500">#{card.collector_number} - {card.rarity}</p>
        </div>
        <div className="flex flex-col items-end">
          {card.price && (
            <span className="font-bold text-green-600">${card.price}</span>
          )}
          {card.foil_price && (
            <span className="text-sm text-purple-600">${card.foil_price} Foil</span>
          )}
        </div>
      </div>
    </div>
  );

  if (groupBySet) {
    const grouped = validResults.reduce((acc, card) => {
      const setName = card.set_name || card.set || 'Set inconnu';
      if (!acc[setName]) acc[setName] = [];
      acc[setName].push(card);
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([setName, cards]) => (
          <div key={setName}>
            <h3 className="text-lg font-bold text-indigo-600 mb-2">{setName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map(renderCard)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {validResults.map(renderCard)}
    </div>
  );
}

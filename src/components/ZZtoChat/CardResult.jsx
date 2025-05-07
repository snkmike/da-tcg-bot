export default function CardResult({ searchResults = [], setSelectedCard, groupBySet = false }) {
  if (!searchResults || searchResults.length === 0) {
    return <p className="text-gray-500">Aucun résultat trouvé.</p>;
  }

  if (groupBySet) {
    const grouped = {};

    for (const card of searchResults) {
      const setName = card.set || card.set_name || 'Set inconnu';
      if (!grouped[setName]) grouped[setName] = [];
      grouped[setName].push(card);
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        {Object.entries(grouped).map(([setName, cards]) => (
          <div key={setName} className="mb-6">
            <h3 className="text-lg font-bold text-indigo-600 mb-2">{setName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(card => (
                <div
                  key={card.id}
                  className="border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{card.name}</h4>
                      <p className="text-sm text-gray-600">{card.game || ''} - {card.set || card.set_name}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold">{card.price}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Affichage simple (non groupé)
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map(card => (
          <div
            key={card.id}
            className="border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedCard(card)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{card.name}</h4>
                <p className="text-sm text-gray-600">{card.game || ''} - {card.set || card.set_name}</p>
              </div>
              <div className="flex items-center">
                <span className="font-bold">{card.price}€</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

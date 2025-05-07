// src/components/CardSearchResult.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function CardSearchResult({ searchResults, setSelectedCard }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-medium mb-3">Résultats des cartes</h3>
      {searchResults.length > 0 ? (
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
                  <p className="text-sm text-gray-600">{card.game} - {card.set}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{card.price}€</span>
                  {card.trend === 'up' && <ArrowUpRight className="ml-1 text-green-600" size={16} />}
                  {card.trend === 'down' && <ArrowDownRight className="ml-1 text-red-600" size={16} />}
                  {card.trend === 'stable' && <Minus className="ml-1 text-gray-600" size={16} />}
                </div>
              </div>
              {card.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {card.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${
                        tag === 'Call to Go' ? 'bg-green-100 text-green-800' :
                        tag === 'Bad Call' ? 'bg-red-100 text-red-800' :
                        tag === 'Hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucun résultat. Modifiez vos critères de recherche.</p>
      )}
    </div>
  );
}

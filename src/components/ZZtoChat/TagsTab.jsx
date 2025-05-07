// src/components/TagsTab.jsx
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export default function TagsTab({ cards }) {
  const [sortBy, setSortBy] = useState('name');
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sortedCards = [...cards].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'trend') {
      const trendOrder = { up: 0, stable: 1, down: 2 };
      return trendOrder[a.trend] - trendOrder[b.trend];
    }
    return 0;
  });

  const tagColors = {
    'Call to Go': 'bg-green-100 text-green-800',
    'Bad Call': 'bg-red-100 text-red-800',
    'Hold': 'bg-yellow-100 text-yellow-800',
    'Reserved': 'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Étiquetage stratégique</h2>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Gérer les étiquettes</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Trier par :</span>
            <select
              className="p-1 border border-gray-300 rounded-md text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Nom</option>
              <option value="price">Prix</option>
              <option value="trend">Tendance</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {sortedCards.map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-md p-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCard(card.id)}
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="font-medium">{card.name}</h4>
                    <p className="text-sm text-gray-600">
                      {card.game} - {card.set}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold">{card.price}€</span>
                    {card.trend === 'up' && <ArrowUpRight className="ml-1 text-green-600" size={16} />}
                    {card.trend === 'down' && <ArrowDownRight className="ml-1 text-red-600" size={16} />}
                    {card.trend === 'stable' && <Minus className="ml-1 text-gray-600" size={16} />}
                  </div>
                </div>
                <div className="flex items-center">
                  {card.tags.length > 0 && (
                    <div className="flex space-x-1 mr-2">
                      {card.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {expandedCards[card.id] ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </div>
              </div>

              {expandedCards[card.id] && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex space-x-2 mb-3">
                    <button className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">+ Call to Go</button>
                    <button className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">+ Bad Call</button>
                    <button className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm">+ Hold</button>
                    <button className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">+ Reserved</button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="p-1 border border-gray-300 rounded-md text-sm flex-1"
                      placeholder="Nouvelle étiquette personnalisée"
                    />
                    <button className="bg-indigo-600 text-white px-2 py-1 rounded-md text-sm">Ajouter</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Analyse IA des tendances */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium mb-4">Analyse IA des tendances</h3>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-md p-3">
            <h4 className="font-medium mb-2">Suggestions d'étiquettes</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span>Charizard - Base Set</span>
                <div className="flex space-x-2">
                  <button className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">Call to Go</button>
                  <button className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">Ignorer</button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Dark Magician - LOB</span>
                <div className="flex space-x-2">
                  <button className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">Bad Call</button>
                  <button className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">Ignorer</button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-md p-3">
            <h4 className="font-medium mb-2">Cartes à surveiller</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span>Jace, the Mind Sculptor - Worldwake</span>
                <div className="flex space-x-2">
                  <button className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm">Hold</button>
                  <button className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">Ignorer</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

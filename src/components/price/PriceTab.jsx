// src/components/PriceTab.jsx
import React, { useState } from 'react';

export default function PriceTab({ selectedCard }) {
  const [timeframe, setTimeframe] = useState('monthly');
  const [source, setSource] = useState('cardmarket');

  const sourcePrices = {
    cardmarket: selectedCard.price,
    amazon: Math.floor(selectedCard.price * 1.15),
    cdiscount: Math.floor(selectedCard.price * 0.95)
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{selectedCard.name}</h2>
      <p className="text-sm text-gray-600 mb-4">{selectedCard.game} - {selectedCard.set}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(sourcePrices).map(([site, price]) => (
          <div key={site} className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1 capitalize">{site}</h3>
            <p className="text-2xl font-bold">{price}€</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Evolution du prix</h3>
          <div className="flex space-x-2">
            <select 
              className="p-1 border border-gray-300 rounded-md text-sm"
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
            <select 
              className="p-1 border border-gray-300 rounded-md text-sm"
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              <option value="cardmarket">Cardmarket</option>
              <option value="amazon">Amazon</option>
              <option value="cdiscount">Cdiscount</option>
            </select>
          </div>
        </div>

        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
          <div className="relative w-full h-3/4">
            <div className="absolute bottom-0 left-0 w-full h-full flex items-end space-x-12 px-8">
              {selectedCard.priceHistory.map((price, index) => {
                const height = (price / Math.max(...selectedCard.priceHistory)) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-8 bg-indigo-500 rounded-t-sm" style={{ height: `${height}%` }} />
                    <span className="text-xs mt-1">{`S${index+1}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-3">Définir une alerte de prix</h3>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Prix cible</label>
            <input type="number" className="p-2 border border-gray-300 rounded-md w-32" placeholder="€" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Type</label>
            <select className="p-2 border border-gray-300 rounded-md w-32">
              <option value="below">En dessous</option>
              <option value="above">Au dessus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Source</label>
            <select className="p-2 border border-gray-300 rounded-md w-32">
              <option value="all">Toutes</option>
              <option value="cardmarket">Cardmarket</option>
              <option value="amazon">Amazon</option>
              <option value="cdiscount">Cdiscount</option>
            </select>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md self-end">
            Créer l'alerte
          </button>
        </div>
      </div>
    </div>
  );
}

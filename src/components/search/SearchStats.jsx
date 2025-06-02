// SearchStats.jsx
// Affichage des statistiques de recherche

import React from 'react';

export default function SearchStats({ 
  results, 
  pricesCache, 
  lastSearchTime 
}) {
  // Calculer les statistiques de recherche
  const calculateSearchStats = () => {
    if (results.length === 0) return null;

    const stats = {
      total: results.length,
      withPrices: Object.keys(pricesCache).length,
      avgPrice: 0
    };

    if (stats.withPrices > 0) {
      const prices = Object.values(pricesCache).map(p => p.min * 1.1);
      stats.avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    return stats;
  };

  const searchStats = calculateSearchStats();

  if (!searchStats) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
        <span>📊 <strong>{searchStats.total}</strong> cartes trouvées</span>
        <span>💰 <strong>{searchStats.withPrices}</strong> avec prix</span>
        {searchStats.avgPrice > 0 && (
          <span>📈 Prix moyen: <strong>{searchStats.avgPrice.toFixed(2)}€</strong></span>
        )}
        {lastSearchTime && (
          <span>🕒 Dernière recherche: {new Date(lastSearchTime).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}

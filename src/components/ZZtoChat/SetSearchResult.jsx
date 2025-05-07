// src/components/SetSearchResult.jsx
import React from 'react';

export default function SetSearchResult({ mockSets }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-medium mb-3">Résultats des extensions</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nom</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Jeu</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Prix moyen</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Performance</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Top carte</th>
            </tr>
          </thead>
          <tbody>
            {mockSets.map(set => (
              <tr key={set.id} className="border-b border-gray-200">
                <td className="px-4 py-3">{set.name}</td>
                <td className="px-4 py-3">{set.game}</td>
                <td className="px-4 py-3">{set.avgPrice}€</td>
                <td className="px-4 py-3">
                  <span className={set.performance.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {set.performance}
                  </span>
                </td>
                <td className="px-4 py-3">{set.topCard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

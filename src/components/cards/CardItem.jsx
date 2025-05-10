// CardItem.jsx
// Composant de base pour l'affichage d'une carte
// Contient les éléments statiques communs (nom, image, set, etc.)
// Les composants enfants peuvent ajouter des fonctionnalités spécifiques

import React from 'react';

export default function CardItem({
  card,
  className = '',
  children,
  onClick,
  topLeftBadge,
  topRightBadge
}) {  
  return (
    <div
      onClick={onClick}
      className={`relative bg-white border p-3 rounded-lg shadow-sm hover:shadow-md flex flex-col ${className}`}
    >
      {/* Badges personnalisables en haut à gauche et à droite */}
      {topLeftBadge && (
        <div className="absolute top-2 left-2">
          {topLeftBadge}
        </div>
      )}
      {topRightBadge && (
        <div className="absolute top-2 right-2">
          {topRightBadge}
        </div>
      )}

      {/* Informations statiques de la carte */}
      <div className="mb-2">
        <img src={card.image} alt={card.name} className="w-full h-auto object-contain mb-2 rounded" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{card.name}</span>
          {card.version && (
            <span className="text-xs font-normal italic text-gray-600 whitespace-nowrap truncate">• {card.version}</span>
          )}
        </div>
        <p className="text-xs text-gray-600 truncate">Set: {card.set_name}</p>
        <p className="text-xs text-gray-600">#{card.collector_number} - {card.rarity}</p>
        <div className="text-sm mt-1">
          <span className="text-green-600">${card.price || '-'}</span>
          {card.foil_price && (
            <span className="text-purple-500 ml-2">Foil: ${card.foil_price}</span>
          )}
        </div>
      </div>

      {/* Contenu supplémentaire injecté par les composants enfants */}
      {children}
    </div>
  );
}

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
    <div className={`${className} bg-white rounded-xl overflow-hidden h-full flex flex-col`}
      onClick={onClick}
    >
      <div className="relative p-3 flex-grow">
        {topLeftBadge}
        {topRightBadge}
        {card.image && (
          <div className={`relative h-full ${card.isFoil ? 'card-foil' : ''}`}>
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-baseline gap-2 mb-2 w-full">
          <h4 className="font-bold text-gray-900 text-lg leading-snug truncate min-w-0 shrink">{card.name}</h4>
          {card.version && (
            <span className="text-sm font-medium text-gray-500 truncate flex-1 min-w-0">
              {card.version}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">{card.set_name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-md">#{card.collector_number}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-md">{card.rarity}</span>
          </div>
        </div>
        
        {/* Prix avec effet glassmorphism */}
        <div className="mt-3">
          {card.isFoil ? (
            <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
              <span className="text-purple-700 font-bold">{card.price} €</span>
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
              <span className="text-green-700 font-bold">{card.price} €</span>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

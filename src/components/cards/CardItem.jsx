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
  // Détecter si la carte a des traitements spéciaux pour appliquer des effets visuels
  const hasSpecialTreatment = card.isFoil || card.specialTreatments?.length > 0;
  
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
              className={`w-full h-full object-cover rounded-xl ${
                card.isFoil ? 'border-2 border-purple-500' : 
                hasSpecialTreatment ? 'border border-gray-300' : ''
              }`}
            />
            {/* Effet visuel pour les cartes foil */}
            {card.isFoil && (
              <div className="absolute inset-0 rounded-xl pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-transparent to-purple-300/20 rounded-xl" />
              </div>
            )}
          </div>
        )}
      </div>      
      <div className="px-4 pb-4">
        {/* Structure uniforme : Nom - nom secondaire */}
        <div className="flex items-baseline gap-2 mb-2 w-full">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 text-lg leading-snug truncate">
              {card.name}
              {card.subtitle && (
                <span className="text-sm font-normal text-gray-500 italic ml-1">
                  - {card.subtitle}
                </span>
              )}
            </h4>
          </div>
        </div>
        
        {/* Structure uniforme : Nom du set */}
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">{card.set_name}</p>
          
          {/* Structure uniforme : Num coll + rareté */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-md">#{card.collector_number}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-md">{card.rarity}</span>
            {/* Badge pour traitement spécial dans l'info de base */}
            {card.isFoil && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">
                ✨ Foil
              </span>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

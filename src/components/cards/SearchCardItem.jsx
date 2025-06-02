// SearchCardItem.jsx
// Version refactorisée avec structure uniforme : [i] + éléments d'action empilés, Image, nom - nom secondaire, num collection + rareté, prix arrondi (i prix), options de quantité en bottom right après sélection
import React, { useState } from 'react';
import { Sparkles, Check, Info } from 'lucide-react';
import CardItem from './CardItem';
import CardDetail from './CardDetail';

export default function SearchCardItem({ card, isSelected = false, onSelect, updateQuantity, selectedCollection }) {
  // Trouver la quantité initiale
  const initialQuantity = isSelected ? card.quantity || 1 : 1;
  const [localQuantity, setLocalQuantity] = useState(initialQuantity);
  const [showDetail, setShowDetail] = useState(false);
  const [showPriceDetail, setShowPriceDetail] = useState(false);

  // Mettre à jour la quantité locale quand la carte change ou est sélectionnée/désélectionnée
  React.useEffect(() => {
    if (isSelected && card.quantity) {
      setLocalQuantity(card.quantity);
    } else if (!isSelected) {
      setLocalQuantity(1);
    }
  }, [isSelected, card.quantity]);

  const handleQuantityChange = (newQuantity) => {
    const val = parseInt(newQuantity, 10);
    if (val > 0) {
      setLocalQuantity(val);
      if (isSelected) {
        updateQuantity(card.id, val, card);
      }
    }
  };

  return (
    <>
      <div 
        className={`relative cursor-pointer bg-white shadow-md rounded-xl overflow-hidden group ${
          isSelected ? 'ring-2 ring-blue-500 shadow-blue-100' : 'hover:ring-1 hover:ring-gray-200'
        }`}
        onClick={(e) => {
          setShowPriceDetail(false); // Fermer l'encart prix si ouvert
          onSelect(e);
        }}
      >
        <CardItem card={card}>
          {/* Structure uniforme : [i] + Actions empilées en haut à gauche */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-30">
            {/* Bouton info principal */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-sm transition-colors"
              title="Détails de la carte"
            >
              <Info size={16} />
            </button>
          </div>

          {/* Indicateur de sélection en haut à droite */}
          {isSelected && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1.5 shadow-md z-30">
              <Check size={14} />
            </div>
          )}

          {/* Badge Foil en haut à droite (si pas sélectionné) */}
          {!isSelected && card.isFoil && (
            <div className="absolute top-3 right-3 z-20">
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded shadow-sm">
                <Sparkles size={10} className="inline mr-1" />
                Foil
              </span>
            </div>
          )}          {/* Prix uniforme : toujours affiché au même endroit si disponible */}
          {(card.price > 0 || card.foil_price > 0) && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
              {/* Prix principal arrondi (normal ou foil selon la carte) */}
              <div className={`${
                card.isFoil ? 'bg-purple-600' : 'bg-green-600'
              } text-white rounded-lg px-3 py-1.5 shadow-sm`}>
                <div className="text-sm font-bold">
                  {card.isFoil ? 
                    (card.foil_price > 0 ? `${(Math.round(card.foil_price * 100) / 100).toFixed(2)}€` : `${(Math.round(card.price * 100) / 100).toFixed(2)}€`) :
                    `${(Math.round(card.price * 100) / 100).toFixed(2)}€`
                  }
                </div>
              </div>
              
              {/* Bouton info prix */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPriceDetail(!showPriceDetail);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-sm transition-colors"
                title="Détails des prix"
              >
                <Info size={14} />
              </button>
            </div>
          )}

          {/* Options de quantité en bas à droite SEULEMENT si sélectionné */}
          {isSelected && (
            <div className="absolute bottom-3 right-3 bg-white shadow-lg rounded-lg p-2 z-20">
              <input
                type="number"
                min="1"
                value={localQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-16 text-center bg-gray-50 border border-gray-200 rounded-lg p-1 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                onClick={(e) => e.stopPropagation()}
                title="Quantité"
              />
            </div>
          )}

          {/* Encart détaillé des prix - repositionné pour éviter les superpositions */}
          {showPriceDetail && (card.price > 0 || card.foil_price > 0) && (
            <div className="absolute bottom-16 left-3 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-40 min-w-48">
              <div className="text-xs text-gray-800 font-medium mb-2">💰 Détails Prix Base</div>
              <div className="space-y-1 text-xs">
                {card.price > 0 && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Normal:</span>
                    <span className="font-medium">{card.price.toFixed(2)}€</span>
                  </div>
                )}
                {card.foil_price > 0 && (
                  <div className="flex justify-between gap-2">
                    <span className="text-purple-600">Foil:</span>
                    <span className="font-medium text-purple-600">{card.foil_price.toFixed(2)}€</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">
                  {card.isFoil && <div className="text-purple-600">Version Foil</div>}
                  Source: {card.source || 'Lorcana API'}
                </div>
              </div>
            </div>
          )}
        </CardItem>
      </div>

      {showDetail && (
        <CardDetail
          card={card}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

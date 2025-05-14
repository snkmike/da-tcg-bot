// SearchCardItem.jsx
import React, { useState } from 'react';
import { Sparkles, Check, Info } from 'lucide-react';
import CardItem from './CardItem';
import CardDetail from './CardDetail';

export default function SearchCardItem({ card, isSelected = false, onSelect, updateQuantity, selectedCollection }) {
  // Trouver la quantité initiale
  const initialQuantity = isSelected ? card.quantity || 1 : 1;
  const [localQuantity, setLocalQuantity] = useState(initialQuantity);
  const [showDetail, setShowDetail] = useState(false);

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
        className={`relative cursor-pointer bg-white shadow-md rounded-xl overflow-hidden ${
          isSelected ? 'ring-2 ring-blue-500 shadow-blue-100' : 'hover:ring-1 hover:ring-gray-200'
        }`}
        onClick={(e) => onSelect(e)}
      >
        <CardItem card={card} />
        
        {/* Bouton détail */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(true);
          }}
          className="absolute top-3 left-3 z-20 p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-sm transition-colors"
        >
          <Info size={18} />
        </button>

        {/* Quantité (visible uniquement si sélectionné) */}
        {isSelected && (
          <div className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-2">
            <input
              type="number"
              min="1"
              value={localQuantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-20 text-center bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Badge Foil */}
        {card.isFoil && (
          <div className="absolute top-2 right-3 z-20">
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded shadow-sm rounded-2">
              <Sparkles size={10} className="inline mr-1" />
              Foil
            </span>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1.5 shadow-md">
            <Check size={14} />
          </div>
        )}
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

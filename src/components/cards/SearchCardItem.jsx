// SearchCardItem.jsx
import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import CardItem from './CardItem';

export default function SearchCardItem({ 
  card,
  isSelected = false,
  onSelect,
  updateQuantity,
  selectedCollection 
}) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity) => {
    const val = parseInt(newQuantity, 10);
    if (val > 0) {
      setQuantity(val);
      if (isSelected) {
        updateQuantity(card.id, val, card);
      }
    }
  };

  return (
    <div 
      className={`relative cursor-pointer bg-white shadow-md rounded-xl overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 shadow-blue-100' : 'hover:ring-1 hover:ring-gray-200'
      }`}
      onClick={(e) => onSelect(e)}
    >
      <CardItem card={card} />
      
      {/* Quantité (visible uniquement si sélectionné) */}
      {isSelected && (
        <div className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-20 text-center bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Badge Foil */}
      {card.isFoil && (
        <div className="absolute top-1 right-3">
          <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded">
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
  );
}

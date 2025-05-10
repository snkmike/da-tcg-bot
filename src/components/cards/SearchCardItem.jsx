// SearchCardItem.jsx
// Version spécialisée de CardItem pour les résultats de recherche
import React from 'react';
import { Sparkles } from 'lucide-react';
import CardItem from './CardItem';

// NOTE : Assurez-vous que la prop 'card' passée à ce composant contient bien toutes les infos nécessaires
// (nom, image, etc.) pour un affichage correct. Si ce n'est pas le cas, faites le merge dans le composant parent.

export default function SearchCardItem({
  card,
  isSelected,
  selected,
  toggleCardSelection,  
  updateQuantity,
  toggleFoil,
  handleSingleAdd,
  selectedCollection
}) {
  return (
    <CardItem
      card={card}
      className={`cursor-pointer transition-all duration-200  ${
        isSelected ? 'ring-4 ring-green-500 shadow-xl scale-[1.03] bg-green-50 border-green-400 border-2' : ''
      }`}
      onClick={() => toggleCardSelection(card)}
    >
      {isSelected && (
        <>
          {/* Overlay visuel de sélection (optionnel, peut être retiré si trop intrusif) */}
          {/* <div className="absolute inset-0 bg-green-500/20 rounded-lg pointer-events-none z-10 flex items-center justify-center animate-fade-in">
            <svg className="w-12 h-12 text-green-600 opacity-80 animate-bounce-in" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div> */}
          {/* Panneau d'options d'ajout */}
          <div className="mt-2 p-3 bg-white/90 border-t border-green-200 rounded-b-lg flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={selected.quantity || 1}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateQuantity(card.id, parseInt(e.target.value, 10) || 1, card)}
                  className="w-full text-center border rounded p-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-sm font-medium border ${
                  selected.isFoil
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}
                title={selected.isFoil ? 'Retirer Foil' : 'Ajouter Foil'}
                onClick={e => {
                  e.stopPropagation();
                  toggleFoil(card.id, card);
                }}
                type="button"
              >
                <Sparkles size={16} />
                {selected.isFoil ? 'Foil' : 'Normal'}
              </button>
            </div>
            <button
              onClick={e => { e.stopPropagation(); handleSingleAdd(card); }}
              disabled={!selectedCollection}
              className="w-full text-sm px-3 py-1.5 rounded-md transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 font-semibold"
              type="button"
            >
              Ajouter à la collection
            </button>
          </div>
        </>
      )}
    </CardItem>
  );
}

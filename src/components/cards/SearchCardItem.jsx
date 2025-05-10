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
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-indigo-500 shadow-md transform scale-[1.02]' : ''
      }`}
      onClick={() => toggleCardSelection(card)}
      topRightBadge={
        <div className="flex items-center gap-2">          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); toggleCardSelection(card); }}
            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            title="Sélectionner la carte"
          />
        </div>
      }
    >
      {isSelected ? (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                min="1"
                value={selected.quantity || 1}
                onChange={(e) => updateQuantity(card.id, parseInt(e.target.value, 10) || 1)}
                className="w-full text-center border rounded p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <button
              className={`p-1.5 rounded-md transition-colors ${
                selected.isFoil 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={selected.isFoil ? "Retirer Foil" : "Ajouter Foil"}
              onClick={(e) => {
                e.stopPropagation();
                toggleFoil(card.id);
              }}
            >
              <Sparkles size={16} />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleSingleAdd(card); }}
            disabled={!selectedCollection}
            className="w-full text-sm px-3 py-1.5 rounded-md transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            Ajouter à la collection
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); handleSingleAdd(card); }}
          disabled={!selectedCollection}
          className={`mt-3 w-full text-sm px-3 py-1.5 rounded-md transition-colors ${
            selectedCollection 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedCollection ? 'Ajouter à la collection' : 'Sélectionnez une collection'}
        </button>
      )}
    </CardItem>
  );
}

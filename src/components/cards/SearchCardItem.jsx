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
  selectedCollection,
  selectedCards = []
}) {
  React.useEffect(() => {
    console.log('SearchCardItem render:', {
      card,
      isSelected,
      selected
    });
  });

  // Calcul des quantités normales et foil
  const quantity = selected.quantity ?? 1;
  const quantityFoil = selected.quantityFoil ?? 0;

  const isMultiSelection = selectedCards && selectedCards.length > 1;

  const handleQuantityChange = (e) => {
    e.stopPropagation();
    updateQuantity(card.id, parseInt(e.target.value, 10) || 0, card, false);
  };
  const handleFoilQuantityChange = (e) => {
    e.stopPropagation();
    updateQuantity(card.id, parseInt(e.target.value, 10) || 0, card, true);
  };

  return (
    <div className="relative">
      <CardItem
        card={card}
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected ? 'ring-0 ring-green-500 shadow-lg scale-[1.01] border-green-400 border bg-white z-10' : 'border border-gray-200'
        }`}
        onClick={e => {
          e.stopPropagation();
          toggleCardSelection(card, isSelected); // On passe l'état courant pour permettre le toggle
        }}
      >
        {/* Card content is rendered by CardItem */}
      </CardItem>
      {isSelected && (
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 w-[85%] bg-white border rounded-lg shadow-lg p-3 flex flex-col gap-2 z-20 animate-fade-in"
          style={{ pointerEvents: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          <label className="block text-xs text-gray-600 font-medium mb-2 pl-1">Options d'ajout à la collection</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                <abbr title="quantité" className="no-underline cursor-help">Qte</abbr>
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onClick={e => e.stopPropagation()}
                onChange={handleQuantityChange}
                className="w-full text-center border rounded p-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><abbr title="quantité foil" className="no-underline cursor-help">Qte foil</abbr> <Sparkles size={12} className="inline ml-1 text-purple-500" /></label>
              <input
                type="number"
                min="0"
                value={quantityFoil}
                onClick={e => e.stopPropagation()}
                onChange={handleFoilQuantityChange}
                className="w-full text-center border rounded p-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          {/* Le bouton d'ajout individuel est supprimé, on utilisera le bouton principal */}
        </div>
      )}
    </div>
  );
}

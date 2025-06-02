import React from 'react';

const defaultRarities = ['Common', 'Uncommon', 'Rare', 'Super_rare', 'Legendary', 'Enchanted', 'Promo'];

const defaultRarityDisplayNames = {
  'common': 'Common',
  'uncommon': 'Uncommon', 
  'rare': 'Rare',
  'super_rare': 'Super rare',
  'legendary': 'Legendary',
  'enchanted': 'Enchanted',
  'promo': 'Promo'
};

export default function RarityFilter({
  selectedRarities,
  setSelectedRarities,
  isDisabled = false,
  availableRarities = defaultRarities,
  rarityDisplayNames = defaultRarityDisplayNames
}) {
  const effectiveRarities = selectedRarities.length === 0 ? [] : selectedRarities;

  const toggleRarity = (rarity) => {
    const r = rarity.toLowerCase();
    if (selectedRarities.includes(r)) {
      setSelectedRarities(selectedRarities.filter(val => val !== r));
    } else {
      setSelectedRarities([...selectedRarities, r]);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-6 space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700 mb-3">
          Filtrer par rareté
        </legend>
        <div className="flex flex-wrap gap-2">
          {availableRarities.map(rarity => {
            const id = `rarity-${rarity.toLowerCase()}`;
            const isSelected = effectiveRarities.includes(rarity.toLowerCase());
            const displayName = rarityDisplayNames[rarity.toLowerCase()] || rarity.replace('_', ' ');
            
            return (
              <div key={rarity} className="flex items-center">
                <input
                  id={id}
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRarity(rarity)}
                  className="sr-only peer"
                  disabled={isDisabled}
                />
                <label
                  htmlFor={id}
                  className={`text-sm px-3 py-2 rounded-lg border transition-all cursor-pointer font-medium
                    ${isDisabled
                      ? 'bg-gray-50 text-gray-400 border-gray-200'
                      : isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md peer-focus:ring-2 peer-focus:ring-indigo-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 peer-focus:ring-2 peer-focus:ring-indigo-500'
                    }
                  `}
                >
                  {displayName}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

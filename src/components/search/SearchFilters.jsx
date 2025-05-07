import React from 'react';
import Select from 'react-select';

export default function SearchFilters({
  filterSet,
  setFilterSet,
  setMinPrice,
  setMaxPrice,
  showSetResults,
  setShowSetResults,
  availableSets = [],
  selectedRarities,
  setSelectedRarities,
}) {
  const setOptions = [{ value: 'all', label: 'Toutes les extensions' }, ...availableSets.map(set => ({ value: set, label: set }))];

  const allRarities = [
    'Common', 'Uncommon', 'Rare', 'Super_rare', 'Legendary', 'Enchanted', 'Promo'
  ];

  const toggleRarity = (rarity) => {
    const r = rarity.toLowerCase();
    if (selectedRarities.includes(r)) {
      setSelectedRarities(selectedRarities.filter(val => val !== r));
    } else {
      setSelectedRarities([...selectedRarities, r]);
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      '&:hover': {
        borderColor: '#6366f1',
      },
      padding: '2px 4px',
    }),
    menu: base => ({
      ...base,
      borderRadius: '0.5rem',
      zIndex: 10,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#6366f1' : isFocused ? '#e0e7ff' : 'white',
      color: isSelected ? 'white' : 'black',
      padding: '8px 12px',
    }),
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-4">Filtres complémentaires</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Extension */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extension</label>
          <Select
            options={setOptions}
            value={setOptions.find(opt => opt.value === filterSet)}
            onChange={(option) => setFilterSet(option.value)}
            styles={customStyles}
          />
        </div>

        {/* Prix minimum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix minimum</label>
          <input
            type="number"
            placeholder="€"
            onChange={e => setMinPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Prix maximum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix maximum</label>
          <input
            type="number"
            placeholder="€"
            onChange={e => setMaxPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Group by extension */}
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={showSetResults}
          onChange={(e) => setShowSetResults(e.target.checked)}
          className="form-checkbox h-4 w-4 text-indigo-600"
        />
        <span className="text-sm text-gray-700">Afficher les résultats groupés par extension</span>
      </div>

      {/* Filtre par rareté */}
      <div>
        <h4 className="text-sm font-medium mb-2">Filtrer par rareté</h4>
        <div className="flex flex-wrap gap-3">
          {allRarities.map(rarity => (
            <label key={rarity} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedRarities.includes(rarity.toLowerCase())}
                onChange={() => toggleRarity(rarity)}
                className="form-checkbox text-indigo-600"
              />
              <span>{rarity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

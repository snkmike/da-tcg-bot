import React, { useMemo } from 'react';
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
  filterKey,
  isDisabled,
  sortKey,
  setSortKey,
  sortOrder,
  setSortOrder,
}) {
  const setOptions = useMemo(() => [
    { value: 'all', label: 'Toutes les extensions' },
    ...availableSets.map(set => ({ value: set, label: set }))
  ], [availableSets]);

  const allRarities = ['Common', 'Uncommon', 'Rare', 'Super_rare', 'Legendary', 'Enchanted', 'Promo'];

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
      borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(99,102,241,0.5)' : 'none',
      '&:hover': { borderColor: '#4f46e5' },
      padding: '4px 8px',
      opacity: isDisabled ? 0.5 : 1,
      pointerEvents: isDisabled ? 'none' : 'auto',
    }),
    menu: base => ({ ...base, borderRadius: '0.5rem', zIndex: 10 }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#eef2ff' : 'white',
      color: isSelected ? 'white' : '#111827',
      padding: '8px 12px',
    }),
  };

  const sortOptions = [
    { value: 'alpha', label: 'Ordre alphabétique' },
    { value: 'number', label: 'Numéro' },
    { value: 'price', label: 'Prix' }
  ];

  return (
    <section className={`mb-4 bg-white p-6 rounded-2xl shadow-md space-y-6 ${isDisabled ? 'opacity-75' : ''}`} aria-labelledby="filters-heading">
      <h2 id="filters-heading" className="text-xl font-bold text-gray-800">Filtres de recherche</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="set-select" className="block text-sm font-medium text-gray-700 mb-1">Extension</label>
          <Select
            inputId="set-select"
            key={filterKey}
            options={setOptions}
            value={setOptions.find(opt => opt.value === filterSet)}
            onChange={option => setFilterSet(option.value)}
            styles={customStyles}
            isDisabled={isDisabled}
            aria-label="Sélectionner une extension"
          />
        </div>

        <div>
          <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Prix minimum (€)</label>
          <input
            id="min-price"
            type="number"
            placeholder="0"
            onChange={e => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isDisabled}
            aria-describedby="min-price-desc"
          />
          <span id="min-price-desc" className="sr-only">Champ de prix minimum en euros</span>
        </div>

        <div>
          <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Prix maximum (€)</label>
          <input
            id="max-price"
            type="number"
            placeholder="1000"
            onChange={e => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isDisabled}
            aria-describedby="max-price-desc"
          />
          <span id="max-price-desc" className="sr-only">Champ de prix maximum en euros</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="group-by-set"
          type="checkbox"
          checked={showSetResults}
          onChange={e => setShowSetResults(e.target.checked)}
          className="form-checkbox h-5 w-5 text-indigo-600"
          disabled={isDisabled}
        />
        <label htmlFor="group-by-set" className="text-sm text-gray-700">Afficher les résultats groupés par extension</label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-gray-800 mb-2">Filtrer par rareté</legend>
        <div className="flex flex-wrap gap-4">
          {allRarities.map(rarity => {
            const id = `rarity-${rarity.toLowerCase()}`;
            return (
              <div key={rarity} className="flex items-center space-x-2">
                <input
                  id={id}
                  type="checkbox"
                  checked={selectedRarities.includes(rarity.toLowerCase())}
                  onChange={() => toggleRarity(rarity)}
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  disabled={isDisabled}
                />
                <label htmlFor={id} className="text-sm text-gray-600">{rarity.replace('_', ' ')}</label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <label htmlFor="sort-select" className="text-sm text-gray-700">Trier par :</label>
        <div className="flex-grow">
          <Select
            inputId="sort-select"
            options={sortOptions}
            value={sortOptions.find(opt => opt.value === sortKey)}
            onChange={option => setSortKey(option.value)}
            styles={customStyles}
            isDisabled={isDisabled}
            aria-label="Critère de tri"
          />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-3 rounded-lg text-sm border border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500"
          aria-label={`Trier en ordre ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
        >
          {sortOrder === 'asc' ? '⬆️' : '⬇️'}
        </button>
      </div>
    </section>
  );
}

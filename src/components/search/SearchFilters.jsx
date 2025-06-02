import React, { useMemo } from 'react';
import Select from 'react-select';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

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

  // Mapping des raretés pour un affichage plus propre
  const rarityDisplayNames = {
    'common': 'Common',
    'uncommon': 'Uncommon', 
    'rare': 'Rare',
    'super_rare': 'Super rare',
    'legendary': 'Legendary',
    'enchanted': 'Enchanted',
    'promo': 'Promo'
  };

  // Ensure no rarities are included by default if none are selected
  const effectiveRarities = selectedRarities.length === 0
    ? []
    : selectedRarities;

  // Ensure foil and enchanted cards are always included
  const includeFoilAndEnchanted = (rarity) => {
    return rarity.toLowerCase() === 'foil' || rarity.toLowerCase() === 'enchanted';
  };

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
      padding: '2px 8px',
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
  // Séparer les contrôles désactivés du reste
  const isExtensionControlDisabled = isDisabled; // Désactiver uniquement les contrôles d'extension en mode numéro
  const areOtherControlsDisabled = false; // Les autres contrôles restent toujours actifs

  return (
    <section aria-labelledby="filters-heading">
      <div className="mb-4 bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="filters-heading" className="text-lg font-semibold text-gray-800">Filtres de recherche</h2>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extension - toujours visible, désactivée en mode numéro */}
          <div className="space-y-4">
            <div>
              <label htmlFor="set-select" className="block text-sm font-medium text-gray-700 mb-2">Extension</label>
              <Select
                inputId="set-select"
                key={filterKey}
                options={setOptions}
                value={setOptions.find(opt => opt.value === filterSet)}
                onChange={option => setFilterSet(option.value)}
                styles={customStyles}
                isDisabled={isExtensionControlDisabled}
                aria-label="Sélectionner une extension"
                className="text-sm"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-3 text-sm">
                <input
                  id="group-by-set"
                  type="checkbox"
                  checked={showSetResults}
                  onChange={e => setShowSetResults(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                  disabled={isExtensionControlDisabled}
                />
                <span className="font-medium text-gray-700">
                  Afficher les résultats groupés par extension
                </span>
              </label>
            </div>
          </div><div className="space-y-4">
            <div>
              <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (€)
              </label>
              <input
                id="min-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                defaultValue="0"
                onChange={e => setMinPrice(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={areOtherControlsDisabled}
              />
            </div>

            <div>
              <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (€)
              </label>
              <input
                id="max-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="1000"
                defaultValue="1000"
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={areOtherControlsDisabled}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">Tri</label>
            <div className="flex gap-2">
              <Select
                inputId="sort-select"
                options={sortOptions}
                value={sortOptions.find(opt => opt.value === sortKey)}
                onChange={option => setSortKey(option.value)}
                styles={customStyles}
                isDisabled={areOtherControlsDisabled}
                className="flex-grow text-sm"
                aria-label="Critère de tri"
              />
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                disabled={areOtherControlsDisabled}
                className={`p-2 rounded-lg border transition-colors ${
                  areOtherControlsDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400'
                    : 'border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500'
                }`}
                aria-label={`Trier en ordre ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUpWideNarrow className="w-5 h-5" />
                ) : (
                  <ArrowDownWideNarrow className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>        <div className="border-t border-gray-100 pt-6 space-y-4"><fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700 mb-3">Filtrer par rareté</legend>
            <div className="flex flex-wrap gap-2">
              {allRarities.map(rarity => {
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
                      disabled={areOtherControlsDisabled}
                    />
                    <label
                      htmlFor={id}
                      className={`text-sm px-3 py-2 rounded-lg border transition-all cursor-pointer font-medium
                        ${areOtherControlsDisabled
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
      </div>
    </section>
  );
}

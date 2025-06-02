// SearchAdvancedFilters.jsx
// Section des filtres avancés

import React from 'react';
import { ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import { RarityFilter, PriceFilter, SortFilter } from '../filters';

export default function SearchAdvancedFilters({
  // État d'affichage
  showAdvancedFilters,
  setShowAdvancedFilters,
  loading,
  
  // États des filtres
  selectedRarities,
  setSelectedRarities,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortKey,
  setSortKey,
  sortOrder,
  setSortOrder,
  groupBySet,
  setGroupBySet,
  
  // Handlers
  onResetFilters,
  onApplyFilters
}) {
  return (
    <>
      {/* Bouton filtres avancés */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Filter size={20} />
          Filtres avancés
          {showAdvancedFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <button
          onClick={onResetFilters}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
        >
          <RotateCcw size={16} />
          Réinitialiser
        </button>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RarityFilter
              selectedRarities={selectedRarities}
              onRarityChange={setSelectedRarities}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PriceFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
            
            <SortFilter
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSortKeyChange={setSortKey}
              onSortOrderChange={setSortOrder}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={groupBySet}
                onChange={(e) => setGroupBySet(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Grouper par extension</span>
            </label>

            <button
              onClick={onApplyFilters}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </>
  );
}

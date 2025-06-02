import React from 'react';
import SetFilter from './SetFilter';
import PriceFilter from './PriceFilter';
import SortFilter from './SortFilter';
import RarityFilter from './RarityFilter';

export default function CombinedFilters({
  // SetFilter props
  filterSet,
  setFilterSet,
  availableSets = [],
  showSetResults,
  setShowSetResults,
  filterKey,
  
  // PriceFilter props
  setMinPrice,
  setMaxPrice,
  minPrice = 0,
  maxPrice = 1000,
  
  // SortFilter props
  sortKey,
  setSortKey,
  sortOrder,
  setSortOrder,
  sortOptions,
  
  // RarityFilter props
  selectedRarities,
  setSelectedRarities,
  availableRarities,
  rarityDisplayNames,
  
  // Shared props
  isDisabled = false,
  isExtensionDisabled = false,
  showRarityFilter = true,
  showSetGrouping = true,
  title = "Filtres de recherche"
}) {
  return (
    <section aria-labelledby="filters-heading">
      <div className="mb-4 bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="filters-heading" className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extension Filter */}
          <SetFilter
            filterSet={filterSet}
            setFilterSet={setFilterSet}
            availableSets={availableSets}
            showSetResults={showSetResults}
            setShowSetResults={showSetGrouping ? setShowSetResults : undefined}
            isDisabled={isExtensionDisabled}
            filterKey={filterKey}
          />

          {/* Price Filter */}
          <PriceFilter
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            minValue={minPrice}
            maxValue={maxPrice}
            isDisabled={isDisabled}
          />

          {/* Sort Filter */}
          <SortFilter
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            isDisabled={isDisabled}
            sortOptions={sortOptions}
          />
        </div>

        {/* Rarity Filter */}
        {showRarityFilter && (
          <RarityFilter
            selectedRarities={selectedRarities}
            setSelectedRarities={setSelectedRarities}
            isDisabled={isDisabled}
            availableRarities={availableRarities}
            rarityDisplayNames={rarityDisplayNames}
          />
        )}
      </div>
    </section>
  );
}

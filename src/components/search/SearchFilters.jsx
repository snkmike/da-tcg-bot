import React from 'react';
import { CombinedFilters, DEFAULT_RARITIES, DEFAULT_RARITY_DISPLAY_NAMES } from '../filters';

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
  // Séparer les contrôles désactivés du reste
  const isExtensionControlDisabled = isDisabled; // Désactiver uniquement les contrôles d'extension en mode numéro
  const areOtherControlsDisabled = false; // Les autres contrôles restent toujours actifs

  return (
    <CombinedFilters
      // SetFilter props
      filterSet={filterSet}
      setFilterSet={setFilterSet}
      availableSets={availableSets}
      showSetResults={showSetResults}
      setShowSetResults={setShowSetResults}
      filterKey={filterKey}
      
      // PriceFilter props
      setMinPrice={setMinPrice}
      setMaxPrice={setMaxPrice}
      minPrice={0}
      maxPrice={1000}
      
      // SortFilter props
      sortKey={sortKey}
      setSortKey={setSortKey}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      
      // RarityFilter props
      selectedRarities={selectedRarities}
      setSelectedRarities={setSelectedRarities}
      availableRarities={DEFAULT_RARITIES}
      rarityDisplayNames={DEFAULT_RARITY_DISPLAY_NAMES}
      
      // Control props
      isDisabled={areOtherControlsDisabled}
      isExtensionDisabled={isExtensionControlDisabled}
      showRarityFilter={true}
      showSetGrouping={true}
      title="Filtres de recherche"
    />
  );
}

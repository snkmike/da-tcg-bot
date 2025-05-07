import SearchBox from './SearchBox';
import SearchFilters from './SearchFilters';
import CardResult from '../cards/CardResult';
import SetResult from '../cards/SetResult';

import { useState } from 'react';

export default function SearchTab({
  searchQuery,
  setSearchQuery,
  searchResults,
  filterGame,
  setFilterGame,
  filterSet,
  setFilterSet,
  setSelectedCard,
  showSetResults,
  setShowSetResults,
  mockSets,
  setMinPrice,
  setMaxPrice,
  LorcanaComponent,
  availableSets = [],
  selectedRarities,
  setSelectedRarities
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (query) => {
    setIsLoading(true);
    setSearchQuery(query);
    setTimeout(() => setIsLoading(false), 500); // Simule une requête async
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recherche de carte</h2>

      <SearchBox
        localQuery={localQuery}
        setLocalQuery={setLocalQuery}
        filterGame={filterGame}
        setFilterGame={setFilterGame}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <SearchFilters
        filterGame={filterGame}
        setFilterGame={setFilterGame}
        filterSet={filterSet}
        setFilterSet={setFilterSet}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        showSetResults={showSetResults}
        setShowSetResults={setShowSetResults}
        availableSets={availableSets}
        selectedRarities={selectedRarities}
        setSelectedRarities={setSelectedRarities}
      />

      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      {LorcanaComponent ? (
      <LorcanaComponent
      results={searchResults}
      setSelectedCard={setSelectedCard}
      groupBySet={showSetResults}
      />
    
      ) : (
      <CardResult searchResults={searchResults} setSelectedCard={setSelectedCard} />
      )}

      </div>
    </div>
  );
}

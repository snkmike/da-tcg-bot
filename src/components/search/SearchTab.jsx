
import SearchBox from './SearchBox';
import SearchFilters from './SearchFilters';
import CardResult from '../cards/CardResult';
import SetResult from '../cards/SetResult';

import { useState, useEffect } from 'react';
import { fetchLorcanaData, fetchCardByNumber } from '../../utils/api/fetchLorcanaData';

export default function SearchTab({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
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
  setSelectedRarities,
  filterKey
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setSearchResultsFromSearchBox = setSearchResults;
    }
  }, []);

  const handleSearch = async (query) => {
    console.log('📌 handleSearch appelée avec:', query);

    if (typeof query === 'object' && query.type === 'number') {
      setIsLoading(true);
      const results = await fetchCardByNumber(query.set, query.number);
      console.log('📥 Résultats fetchCardByNumber:', results);
      setSearchResults(results);
      setSearchQuery(query.number);
      setTimeout(() => setIsLoading(false), 500);
      return results;
    } else if (typeof query === 'string') {
      if (query.length < 3) return;
      setIsLoading(true);
      setSearchQuery(query);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3 || filterGame !== 'Lorcana') return;

    const doSearch = async () => {
      const results = await fetchLorcanaData(
        searchQuery,
        filterSet,
        null,
        null,
        selectedRarities,
        showSetResults
      );
      setSearchResults(results);
    };

    doSearch();
  }, [searchQuery, filterSet, selectedRarities, showSetResults, filterGame]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recherche de carte</h2>

      <SearchBox
        localQuery={searchQuery}
        setLocalQuery={setSearchQuery}
        filterGame={filterGame}
        setFilterGame={setFilterGame}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <SearchFilters
        filterSet={filterSet}
        setFilterSet={setFilterSet}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        showSetResults={showSetResults}
        setShowSetResults={setShowSetResults}
        availableSets={availableSets}
        selectedRarities={selectedRarities}
        setSelectedRarities={setSelectedRarities}
        filterKey={filterKey}
      />

      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
        {LorcanaComponent ? (
          <LorcanaComponent
            results={searchResults}
            setSelectedCard={setSelectedCard}
            groupBySet={showSetResults}
            handleAddCardsToPortfolio={() => {}}
          />
        ) : (
          <CardResult
            searchResults={searchResults}
            setSelectedCard={setSelectedCard}
            groupBySet={showSetResults}
          />
        )}
      </div>
    </div>
  );
}

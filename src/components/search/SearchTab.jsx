import SearchBox from './SearchBox';
import SearchFilters from './SearchFilters';
import CardResult from '../cards/CardResult';
import SetResult from '../cards/SetResult';

import { useState, useEffect } from 'react';
import { fetchLorcanaData, fetchCardByNumber } from '../../utils/api/fetchLorcanaData';

export default function SearchTab({
  searchQuery,
  setSearchQuery,
  searchResults: externalSearchResults,
  setSearchResults: setExternalSearchResults,
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
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState(null);
  const [isNumberSearchOpen, setIsNumberSearchOpen] = useState(false);

  // Synchroniser les résultats externes avec les résultats locaux
  useEffect(() => {
    if (externalSearchResults?.length > 0) {
      setLocalSearchResults(externalSearchResults);
    }
  }, [externalSearchResults]);

  const handleSearch = async (query) => {
    console.log('📌 handleSearch appelée avec:', query);

    if (typeof query === 'string') {
      if (query.length < 3) return;
      setIsLoading(true);
      setSearchQuery(query);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const formatDuplicateWarning = (duplicates) => {
    return Object.entries(duplicates).map(([number, count]) => ({
      number,
      count,
      text: `#${number} (${count} fois)`
    }));
  };

  const handleSearchByNumber = async (setId, number) => {
    console.log('🔢 Recherche par numéro déclenchée:', { setId, number });
    setIsLoading(true);
    setDuplicateWarnings(null);
    try {
      setFilterGame('Lorcana');
      setSearchQuery('');
      window.lastSearchWasById = true;

      const response = await fetchCardByNumber(setId, number);
      console.log('📥 Résultats fetchCardByNumber:', response);

      if (response.cards && response.cards.length > 0) {
        console.log('✅ Mise à jour des résultats de recherche par numéro:', response.cards[0]);
        setLocalSearchResults(response.cards);
        setExternalSearchResults(response.cards);

        // Gérer les doublons s'il y en a
        if (Object.keys(response.duplicates).length > 0) {
          setDuplicateWarnings(formatDuplicateWarning(response.duplicates));
        }
      } else {
        console.log('❌ Aucun résultat trouvé pour la recherche par numéro');
        setLocalSearchResults([]);
        setExternalSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Error during search by number:', error);
      setLocalSearchResults([]);
      setExternalSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.lastSearchWasById) {
      console.log('🔄 Skip de la recherche car dernière recherche par ID');
      return;
    }

    if (!searchQuery || searchQuery.length < 3 || filterGame !== 'Lorcana') {
      console.log('⏭️ Recherche par nom ignorée:', 
        { query: searchQuery, length: searchQuery?.length, game: filterGame });
      return;
    }

    const doSearch = async () => {
      console.log('🔄 Recherche par nom déclenchée avec :', searchQuery);
      const results = await fetchLorcanaData(
        searchQuery,
        filterSet,
        null,
        null,
        selectedRarities,
        showSetResults
      );
      console.log('📦 Résultats fetchLorcanaData:', results?.length || 0, 'résultats trouvés');
      setLocalSearchResults(results);
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
        onSearchByNumber={handleSearchByNumber}
        isLoading={isLoading}
        isNumberSearchOpen={isNumberSearchOpen}
        setIsNumberSearchOpen={setIsNumberSearchOpen}
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
        isDisabled={isNumberSearchOpen}
      />

      {duplicateWarnings && duplicateWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Numéros en double détectés</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <span className="font-medium">Cartes répétées :</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {duplicateWarnings.map((warning) => (
                    <span 
                      key={warning.number}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {warning.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
        {console.log('🎯 Rendu des résultats:', {
          hasLorcanaComponent: !!LorcanaComponent,
          localSearchResults,
          resultCount: localSearchResults?.length,
          firstResult: localSearchResults?.[0]
        })}
        {LorcanaComponent ? (
          <LorcanaComponent
            results={localSearchResults}
            setSelectedCard={setSelectedCard}
            groupBySet={showSetResults}
            handleAddCardsToPortfolio={() => {}}
          />
        ) : (
          <CardResult
            searchResults={localSearchResults}
            setSelectedCard={setSelectedCard}
            groupBySet={showSetResults}
          />
        )}
      </div>
    </div>
  );
}
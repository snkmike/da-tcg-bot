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

  const handleSearchByNumber = async (setId, number) => {
    console.log('🔢 Recherche par numéro déclenchée:', { setId, number });
    setIsLoading(true);
    try {
      // Préparer l'environnement pour éviter les effets secondaires
      setFilterGame('Lorcana');
      setSearchQuery('');
      window.lastSearchWasById = true;

      // Faire la recherche
      const results = await fetchCardByNumber(setId, number);
      console.log('📥 Résultats fetchCardByNumber:', results);        if (results && Array.isArray(results) && results.length > 0) {
        console.log('✅ Mise à jour des résultats de recherche par numéro:', results[0]);
        setLocalSearchResults(results);
        setExternalSearchResults(results);
      } else {
        console.log('❌ Aucun résultat trouvé pour la recherche par numéro');
        setLocalSearchResults([]);
        setExternalSearchResults([]);
      }    } catch (error) {
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
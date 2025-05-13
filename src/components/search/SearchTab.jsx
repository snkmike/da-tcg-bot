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
  filterKey,
  handleAddCardsToPortfolio
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState(null);
  const [isNumberSearchOpen, setIsNumberSearchOpen] = useState(false);
  const [sortKey, setSortKey] = useState('alpha');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (externalSearchResults?.length > 0) {
      setLocalSearchResults(externalSearchResults);
    }
  }, [externalSearchResults]);

  // On n'a plus besoin de la fonction formatDuplicateWarning car on formate directement les doublons plus bas

  const handleSearchByNumber = async (setId, number) => {
    console.log('🔢 Recherche par numéro déclenchée:', { setId, number });
    setIsLoading(true);
    setDuplicateWarnings(null);
    try {
      setFilterGame('Lorcana');
      setSearchQuery('');
      window.lastSearchWasById = true;

      // Traiter les numéros et séparer les foils
      const processedNumbers = number.map(n => {
        const num = n.trim();
        return {
          number: num.replace(/F$/i, ''), // Retire le F à la fin
          isFoil: num.endsWith('F') || num.endsWith('f'),
          original: num // Garder la valeur originale pour la détection des doublons
        };
      });

      // Compter séparément les versions normales et foil
      const duplicates = processedNumbers.reduce((acc, current) => {
        // Ne pas utiliser current.number qui a déjà eu le F retiré
        // Utiliser original qui conserve le F s'il était présent
        acc[current.original] = (acc[current.original] || 0) + 1;
        return acc;
      }, {});

      // Ne garder que les vrais doublons et les trier
      const realDuplicates = Object.entries(duplicates)
        .filter(([_, count]) => count > 1)
        // Trier d'abord par numéro, puis par F
        .sort((a, b) => {
          const numA = parseInt(a[0].replace(/F$/i, ''));
          const numB = parseInt(b[0].replace(/F$/i, ''));
          if (numA !== numB) return numA - numB;
          // Si même numéro, mettre les non-foil en premier
          return a[0].endsWith('F') ? 1 : -1;
        })
        .reduce((acc, [num, count]) => {
          acc[num] = {
            count: count,
            text: `#${num} (${count} fois)`
          };
          return acc;
        }, {});

      // Passer les numéros originaux pour conserver les F
      const response = await fetchCardByNumber(setId, processedNumbers.map(n => n.original));
      console.log('📥 Résultats fetchCardByNumber:', response);

      if (response.error) {
        console.error('❌ Erreur de recherche:', response.error);
        setLocalSearchResults([]);
        setExternalSearchResults([]);
      } else if (response.cards && response.cards.length > 0) {
        // Créer une Map pour dédupliquer les cartes par numéro
        const uniqueCards = new Map();
        
        // Pour chaque numéro recherché
        processedNumbers.forEach(({ number, isFoil }) => {
          const matchingCards = response.cards.filter(card => card.collector_number === number);
          if (matchingCards.length > 0) {
            const card = matchingCards[0];
            const key = card.collector_number;
            // Créer une clé unique qui inclut l'état foil
            const uniqueKey = `${key}${isFoil ? 'F' : ''}`;
            // Ajouter la carte avec sa version spécifique
            uniqueCards.set(uniqueKey, {
              ...card,
              id: isFoil ? `${card.id}_foil` : card.id,
              isFoil: isFoil,
              price: isFoil ? card.prices?.usd_foil : card.prices?.usd || null
            });
          }
        });

        const filteredCards = Array.from(uniqueCards.values());
        console.log('✅ Cartes filtrées:', filteredCards);
        setLocalSearchResults(filteredCards);
        setExternalSearchResults(filteredCards);

        // Créer les alertes de doublons à partir des infos de response.duplicates
        if (Object.keys(response.duplicates).length > 0) {
          const warnings = Object.entries(response.duplicates).map(([number, info]) => ({
            number,
            ...info
          }));
          setDuplicateWarnings(warnings);
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

  const handleSearch = async (query) => {
    if (typeof query === 'string') {
      if (query.length < 3) return;
      setIsLoading(true);
      setSearchQuery(query);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    if (window.lastSearchWasById) {
      console.log('🔄 Skip de la recherche car dernière recherche par ID');
      return;
    }

    if (!searchQuery || searchQuery.length < 3 || filterGame !== 'Lorcana') {
      console.log('⏭️ Recherche par nom ignorée:', { query: searchQuery, length: searchQuery?.length, game: filterGame });
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
    <div className="space-y-6">
      <SearchBox
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        filterGame={filterGame}
        setFilterGame={setFilterGame}
        isLoading={isLoading}
        isNumberSearchOpen={isNumberSearchOpen}
        setIsNumberSearchOpen={(isOpen) => {
          setIsNumberSearchOpen(isOpen);
          if (!isOpen) {
            // Reset les doublons quand on retourne à la recherche par nom
            setDuplicateWarnings(null);
            setLocalSearchResults([]);
            setExternalSearchResults([]);
            window.lastSearchWasById = false;
          }
        }}
        handleSearchByNumber={handleSearchByNumber}
      />

      {/* Filtres - masqués en mode recherche par numéro */}
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
        sortKey={sortKey}
        setSortKey={setSortKey}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        isDisabled={isNumberSearchOpen}
      />

      {/* Zone de résultats */}
      <div className="bg-white rounded-lg shadow-sm">
        {filterGame === 'Lorcana' ? (
          <LorcanaComponent
            results={localSearchResults}
            setSelectedCard={setSelectedCard}
            groupBySet={showSetResults}
            handleAddCardsToPortfolio={handleAddCardsToPortfolio}
            sortKey={sortKey}
            sortOrder={sortOrder}
            duplicateWarnings={duplicateWarnings}
          />
        ) : showSetResults ? (
          <SetResult
            searchResults={localSearchResults}
            setSelectedCard={setSelectedCard}
          />
        ) : (
          <CardResult
            searchResults={localSearchResults}
            setSelectedCard={setSelectedCard}
          />
        )}
      </div>
    </div>
  );
}
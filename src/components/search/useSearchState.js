// useSearchState.js
// Hook pour la gestion de l'état de recherche

import { useState } from 'react';

export function useSearchState() {
  // États de recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByNumber, setSearchByNumber] = useState('');
  const [isNumberSearch, setIsNumberSearch] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSearchTime, setLastSearchTime] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // États pour les filtres
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedExpansion, setSelectedExpansion] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [sortKey, setSortKey] = useState('alpha');
  const [sortOrder, setSortOrder] = useState('asc');
  const [groupBySet, setGroupBySet] = useState(false);

  // États pour les données de référence
  const [games, setGames] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const [pricesCache, setPricesCache] = useState({});

  // Source de données actuelle (extensible pour d'autres sources)
  const [dataSource, setDataSource] = useState('cardtrader');

  // Fonction de réinitialisation des filtres
  const resetFilters = () => {
    setSelectedGame(null);
    setSelectedExpansion(null);
    setSearchTerm('');
    setSearchByNumber('');
    setIsNumberSearch(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRarities([]);
    setSortKey('alpha');
    setSortOrder('asc');
    setResults([]);
    setPricesCache({});
    setError('');
  };

  return {
    // États de recherche
    searchTerm,
    setSearchTerm,
    searchByNumber,
    setSearchByNumber,
    isNumberSearch,
    setIsNumberSearch,
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    lastSearchTime,
    setLastSearchTime,
    showAdvancedFilters,
    setShowAdvancedFilters,
    
    // États pour les filtres
    selectedGame,
    setSelectedGame,
    selectedExpansion,
    setSelectedExpansion,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedRarities,
    setSelectedRarities,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    groupBySet,
    setGroupBySet,
    
    // États pour les données de référence
    games,
    setGames,
    expansions,
    setExpansions,
    pricesCache,
    setPricesCache,
    dataSource,
    setDataSource,
    
    // Fonctions utilitaires
    resetFilters
  };
}

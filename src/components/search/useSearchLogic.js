// useSearchLogic.js
// Hook pour la logique de recherche

import { useCallback, useEffect } from 'react';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';
import { extractCollectorNumber, validateNumberSearch, findCardsByNumber } from './searchUtils';

export function useSearchLogic(state) {
  const {
    searchTerm,
    searchByNumber,
    selectedGame,
    selectedExpansion,
    minPrice,
    maxPrice,
    selectedRarities,
    sortKey,
    sortOrder,
    dataSource,
    expansions,
    setResults,
    setLoading,
    setError,
    setLastSearchTime,
    setPricesCache,
    setGames,
    setExpansions
  } = state;

  // Charger les données de référence au montage
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        if (dataSource === 'cardtrader') {
          const [gamesData, expansionsData] = await Promise.all([
            cardTraderAPI.getGames(),
            cardTraderAPI.getExpansions()
          ]);
          
          setGames(gamesData || []);
          setExpansions(expansionsData || []);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données de référence:', error);
      }
    };

    loadReferenceData();
  }, [dataSource, setGames, setExpansions]);

  // Fonction de recherche principale
  const handleSearch = useCallback(async (isAdvanced = false) => {
    if (!searchTerm.trim() && !isAdvanced) {
      setError('Veuillez entrer un terme de recherche');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setPricesCache({});

    try {
      let searchResults = [];
      
      if (dataSource === 'cardtrader') {
        if (selectedExpansion?.value) {
          // Si une extension est sélectionnée, chercher dans ses blueprints
          const allBlueprints = await cardTraderAPI.getBlueprints(selectedExpansion.value);
          
          // Filtrer par nom si un terme de recherche est fourni
          searchResults = allBlueprints.filter(bp => {
            const nameMatch = !searchTerm.trim() || 
              bp.name?.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch;
          });
        } else if (searchTerm.trim()) {
          // Recherche par nom : parcourir les blueprints des extensions disponibles
          const searchTermLower = searchTerm.toLowerCase();
          const maxResultsPerExpansion = 20;
          const maxExpansionsToSearch = 10;
          
          // Filtrer les extensions par jeu si sélectionné
          let expansionsToSearch = expansions;
          if (selectedGame?.value) {
            expansionsToSearch = expansions.filter(exp => exp.game_id === selectedGame.value);
          }
          
          // Limiter le nombre d'extensions à parcourir pour éviter trop d'appels API
          expansionsToSearch = expansionsToSearch.slice(0, maxExpansionsToSearch);
          
          // Chercher dans les blueprints de chaque extension
          const searchPromises = expansionsToSearch.map(async (expansion) => {
            try {
              const blueprints = await cardTraderAPI.getBlueprints(expansion.id);
              return blueprints
                .filter(bp => bp.name?.toLowerCase().includes(searchTermLower))
                .slice(0, maxResultsPerExpansion)
                .map(bp => ({ ...bp, expansion_name: expansion.name_en }));
            } catch (error) {
              console.warn(`❌ Erreur lors de la recherche dans l'extension ${expansion.name_en}:`, error);
              return [];
            }
          });
          
          const allResults = await Promise.all(searchPromises);
          searchResults = allResults.flat().slice(0, 100); // Limiter le total à 100 résultats
        }
      }

      setResults(searchResults);
      setLastSearchTime(Date.now());
      
    } catch (error) {
      console.error('❌ Erreur de recherche:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedGame, selectedExpansion, minPrice, maxPrice, selectedRarities, sortKey, sortOrder, dataSource, expansions, setResults, setLoading, setError, setLastSearchTime, setPricesCache]);

  // Fonction de recherche par numéro
  const handleSearchByNumber = useCallback(async () => {
    const validation = validateNumberSearch(searchByNumber, selectedExpansion);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setPricesCache({});

    try {
      console.log(`🔍 Recherche par numéro dans l'extension ${selectedExpansion.label}...`);
      
      // Récupérer tous les blueprints de l'extension sélectionnée
      const allBlueprints = await cardTraderAPI.getBlueprints(selectedExpansion.value);
      console.log(`📦 ${allBlueprints.length} blueprints récupérés`);
      
      // Debug: Analyser la structure des premiers blueprints
      if (allBlueprints.length > 0) {
        console.log("🔧 Structure du premier blueprint:", {
          id: allBlueprints[0].id,
          name: allBlueprints[0].name,
          editable_properties: allBlueprints[0].editable_properties?.map(p => ({
            name: p.name,
            possible_values: p.possible_values?.slice(0, 3) // Limiter pour le debug
          })),
          fixed_properties: allBlueprints[0].fixed_properties
        });
      }
      
      // Parser les numéros recherchés
      const searchNumbers = searchByNumber.split(',').map(n => n.trim());
      
      // Analyser tous les blueprints pour comprendre la structure des collector_numbers
      const blueprintsWithNumbers = allBlueprints
        .map(bp => {
          const collectorNumber = extractCollectorNumber(bp);
          return {
            blueprint: bp,
            collectorNumber: collectorNumber,
            hasCollectorNumber: collectorNumber !== null
          };
        })
        .filter(item => item.hasCollectorNumber);
      
      console.log(`📋 ${blueprintsWithNumbers.length} blueprints avec collector_number sur ${allBlueprints.length} total`);
      
      // Rechercher les cartes
      const { searchResults, notFoundNumbers } = findCardsByNumber(blueprintsWithNumbers, searchNumbers);
      
      // Ajouter les métadonnées
      const resultsWithMetadata = searchResults.map(result => ({
        ...result,
        expansion_name: selectedExpansion.label
      }));
      
      setResults(resultsWithMetadata);
      setLastSearchTime(Date.now());
      
      // Messages informatifs
      if (resultsWithMetadata.length > 0) {
        console.log(`✅ ${resultsWithMetadata.length} carte(s) trouvée(s) sur ${searchNumbers.length} recherchée(s)`);
      }
      
      if (notFoundNumbers.length > 0) {
        let errorMessage = `⚠️ Numéros non trouvés dans ${selectedExpansion.label}: ${notFoundNumbers.join(', ')}`;
        
        if (blueprintsWithNumbers.length === 0) {
          errorMessage += `\n📝 Cette extension ne semble pas avoir de numéros de collection dans CardTrader.`;
        } else {
          const sampleNumbers = blueprintsWithNumbers
            .slice(0, 20)
            .map(item => item.collectorNumber)
            .join(', ');
          errorMessage += `\n📝 Exemples de numéros disponibles: ${sampleNumbers}${blueprintsWithNumbers.length > 20 ? '...' : ''}`;
        }
        
        setError(errorMessage);
      } else if (resultsWithMetadata.length === 0) {
        setError(`❌ Aucun résultat trouvé pour les numéros: ${searchNumbers.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur de recherche par numéro:', error);
      setError(`Erreur lors de la recherche par numéro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchByNumber, selectedExpansion, setLoading, setError, setResults, setPricesCache, setLastSearchTime]);

  return {
    handleSearch,
    handleSearchByNumber
  };
}

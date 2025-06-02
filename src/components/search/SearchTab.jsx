// SearchTab.jsx
// Page de recherche générique multi-sources
// Fusion et généralisation de CardTraderSearchTab et SearchTab existant

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Search, RotateCcw, Filter } from 'lucide-react';
import Select from 'react-select';
import SearchResult from './SearchResult';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';

export default function SearchTab({ handleAddCardsToPortfolio }) {
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
  }, [dataSource]);

  // Options pour les selects
  const gameOptions = games.map(game => ({
    value: game.id,
    label: game.name
  }));

  const expansionOptions = expansions
    .filter(exp => !selectedGame || exp.game_id === selectedGame.value)
    .map(exp => ({
      value: exp.id,
      label: exp.name
    }));

  const rarityOptions = [
    { value: 'common', label: 'Commune' },
    { value: 'uncommon', label: 'Peu commune' },
    { value: 'rare', label: 'Rare' },
    { value: 'super_rare', label: 'Super rare' },
    { value: 'legendary', label: 'Légendaire' },
    { value: 'enchanted', label: 'Enchantée' }
  ];

  const sortOptions = [
    { value: 'alpha', label: 'Alphabétique' },
    { value: 'number', label: 'Numéro' },
    { value: 'price', label: 'Prix' }
  ];
  // Fonction de recherche
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
          });        } else if (searchTerm.trim()) {
          // Recherche par nom : parcourir les blueprints des extensions disponibles
          // Note: L'API marketplace ne supporte PAS la recherche par nom
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
  }, [searchTerm, selectedGame, selectedExpansion, minPrice, maxPrice, selectedRarities, sortKey, sortOrder, dataSource, expansions]);
  // Validation de la recherche par numéro
  const validateNumberSearch = () => {
    if (!selectedExpansion) {
      setError('Veuillez d\'abord sélectionner une extension pour la recherche par numéro');
      return false;
    }
    
    if (!searchByNumber.trim()) {
      setError('Veuillez entrer au moins un numéro de collection');
      return false;
    }
    
    // Valider le format des numéros (permet: 1, 123, 001, 123F, etc.)
    const numbers = searchByNumber.split(',').map(n => n.trim());
    const invalidNumbers = numbers.filter(n => !/^\d+[a-zA-Z]*$/i.test(n));
    
    if (invalidNumbers.length > 0) {
      setError(`Format invalide pour: ${invalidNumbers.join(', ')}. Utilisez le format: 1,2,3,123F`);
      return false;
    }
    
    return true;
  };
  // Fonction pour extraire le numéro de collection d'un blueprint CardTrader - REFACTORISÉE
  const extractCollectorNumber = (blueprint) => {
    // IMPORTANT: Dans CardTrader, les blueprints n'ont PAS de collector_number direct
    // Les numéros de collection sont spécifiques aux produits, pas aux blueprints
    // Un blueprint peut avoir plusieurs collector_numbers selon les réimpressions
    
    // 1. Chercher dans les editable_properties (structure la plus courante)
    if (blueprint.editable_properties && Array.isArray(blueprint.editable_properties)) {
      for (const property of blueprint.editable_properties) {
        if (property.name === 'collector_number' && property.possible_values?.length > 0) {
          // Retourner la première valeur possible
          return property.possible_values[0];
        }
      }
    }
    
    // 2. Chercher dans les fixed_properties (moins courant)
    if (blueprint.fixed_properties?.collector_number) {
      return blueprint.fixed_properties.collector_number;
    }
    
    // 3. Chercher directement dans le blueprint (très rare)
    if (blueprint.collector_number) {
      return blueprint.collector_number;
    }
    
    // 4. Fallback: CardTrader n'a peut-être pas de collector_number pour ce blueprint
    return null;
  };

  // Fonction de recherche par numéro COMPLÈTEMENT REFACTORISÉE pour CardTrader
  const handleSearchByNumber = useCallback(async () => {
    if (!validateNumberSearch()) {
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
      const searchResults = [];
      const notFoundNumbers = [];
      const debugInfo = [];
      
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
      
      // Pour chaque numéro recherché
      searchNumbers.forEach(numberInput => {
        console.log(`🔎 Recherche du numéro: "${numberInput}"`);
        
        const cleanNumber = numberInput.trim();
        let foundItem = null;
        
        // Stratégie 1: Correspondance exacte (sensible à la casse)
        foundItem = blueprintsWithNumbers.find(item => 
          item.collectorNumber === cleanNumber
        );
        
        // Stratégie 2: Correspondance insensible à la casse
        if (!foundItem) {
          foundItem = blueprintsWithNumbers.find(item => 
            item.collectorNumber?.toLowerCase() === cleanNumber.toLowerCase()
          );
        }
        
        // Stratégie 3: Correspondance partielle (numéro sans lettres)
        if (!foundItem) {
          const numericPart = cleanNumber.replace(/[^0-9]/g, '');
          if (numericPart) {
            foundItem = blueprintsWithNumbers.find(item => {
              const itemNumericPart = item.collectorNumber?.replace(/[^0-9]/g, '');
              return itemNumericPart === numericPart;
            });
          }
        }
        
        // Stratégie 4: Correspondance avec padding (001 = 1)
        if (!foundItem && /^\d+$/.test(cleanNumber)) {
          const paddedNumber = cleanNumber.padStart(3, '0');
          foundItem = blueprintsWithNumbers.find(item => {
            const itemPadded = item.collectorNumber?.replace(/[^0-9]/g, '').padStart(3, '0');
            return itemPadded === paddedNumber;
          });
        }
        
        if (foundItem) {
          console.log(`✅ Trouvé: ${foundItem.blueprint.name} (numéro: ${foundItem.collectorNumber})`);
          
          searchResults.push({
            ...foundItem.blueprint,
            searched_number: numberInput,
            actual_collector_number: foundItem.collectorNumber,
            expansion_name: selectedExpansion.label
          });
        } else {
          console.warn(`❌ Numéro "${numberInput}" non trouvé`);
          notFoundNumbers.push(numberInput);
          
          // Debug: Afficher quelques collector_numbers disponibles
          const sampleNumbers = blueprintsWithNumbers
            .slice(0, 10)
            .map(item => item.collectorNumber)
            .filter(Boolean);
          
          debugInfo.push(`Numéros disponibles (échantillon): ${sampleNumbers.join(', ')}`);
        }
      });
      
      setResults(searchResults);
      setLastSearchTime(Date.now());
      
      // Messages informatifs améliorés
      if (searchResults.length > 0) {
        console.log(`✅ ${searchResults.length} carte(s) trouvée(s) sur ${searchNumbers.length} recherchée(s)`);
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
      } else if (searchResults.length === 0) {
        setError(`❌ Aucun résultat trouvé pour les numéros: ${searchNumbers.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur de recherche par numéro:', error);
      setError(`Erreur lors de la recherche par numéro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchByNumber, selectedExpansion]);
  // Gestion des touches clavier
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isNumberSearch) {
        handleSearchByNumber();
      } else {
        handleSearch();
      }
    }
  };

  // Gestion des touches clavier pour la recherche par numéro
  const handleNumberKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchByNumber();
    }
  };

  // Réinitialiser les filtres
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

  // Calculer les statistiques de recherche
  const calculateSearchStats = () => {
    if (results.length === 0) return null;

    const stats = {
      total: results.length,
      withPrices: Object.keys(pricesCache).length,
      avgPrice: 0
    };

    if (stats.withPrices > 0) {
      const prices = Object.values(pricesCache).map(p => p.min * 1.1);
      stats.avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    return stats;
  };

  const searchStats = calculateSearchStats();

  // Styles personnalisés pour React Select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': { borderColor: '#3b82f6' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': { backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff' }
    })
  };

  // Composant pour les filtres avancés
  const FilterSection = ({ children, title }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      {children}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Recherche de cartes</h1>
          <p className="text-gray-600">Recherchez et gérez vos cartes de collection</p>
        </div>        {/* Interface de recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Sélecteurs de jeu et extension */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FilterSection title="Jeu">
              <Select
                value={selectedGame}
                onChange={setSelectedGame}
                options={gameOptions}
                placeholder="Sélectionner un jeu..."
                isClearable
                styles={selectStyles}
              />
            </FilterSection>

            <FilterSection title="Extension">
              <Select
                value={selectedExpansion}
                onChange={setSelectedExpansion}
                options={expansionOptions}
                placeholder="Sélectionner une extension..."
                isClearable
                isDisabled={!selectedGame}
                styles={selectStyles}
              />
            </FilterSection>          </div>

          {/* Bouton de basculement entre recherche par nom et par numéro */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsNumberSearch(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !isNumberSearch 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔤 Recherche par nom
            </button>
            <button
              onClick={() => setIsNumberSearch(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isNumberSearch 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔢 Recherche par numéro
            </button>
          </div>

          {/* Interface de recherche adaptative */}
          {isNumberSearch ? (
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchByNumber}
                  onChange={(e) => setSearchByNumber(e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex: 1,2,3,4F (F pour foil)"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedExpansion}
                />
                {!selectedExpansion && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Sélectionnez d'abord une extension</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearchByNumber}
                disabled={loading || !selectedExpansion}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Search size={20} />
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          ) : (
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Rechercher une carte..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Search size={20} />
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          )}

          {/* Aide contextuelle pour la recherche par numéro */}
          {isNumberSearch && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Aide :</strong> Entrez un ou plusieurs numéros séparés par des virgules. 
                Ajoutez "F" après le numéro pour rechercher la version foil (ex: 1,2,3F,10).
                {!selectedExpansion && (
                  <span className="block mt-1 text-blue-600 font-medium">
                    ⚠️ Vous devez d'abord sélectionner une extension pour utiliser cette fonction.
                  </span>
                )}
              </p>
            </div>          )}

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
              onClick={resetFilters}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
            >
              <RotateCcw size={16} />
              Réinitialiser
            </button>
          </div>          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FilterSection title="Raretés">
                  <Select
                    value={selectedRarities}
                    onChange={setSelectedRarities}
                    options={rarityOptions}
                    placeholder="Sélectionner des raretés..."
                    isMulti
                    styles={selectStyles}
                  />
                </FilterSection>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FilterSection title="Prix min (€)">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FilterSection>

                <FilterSection title="Prix max (€)">
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="999.99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FilterSection>

                <FilterSection title="Trier par">
                  <Select
                    value={sortOptions.find(opt => opt.value === sortKey)}
                    onChange={(option) => setSortKey(option.value)}
                    options={sortOptions}
                    styles={selectStyles}
                  />
                </FilterSection>

                <FilterSection title="Ordre">
                  <Select
                    value={{ value: sortOrder, label: sortOrder === 'asc' ? 'Croissant' : 'Décroissant' }}
                    onChange={(option) => setSortOrder(option.value)}
                    options={[
                      { value: 'asc', label: 'Croissant' },
                      { value: 'desc', label: 'Décroissant' }
                    ]}
                    styles={selectStyles}
                  />
                </FilterSection>
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
                  onClick={() => handleSearch(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques de recherche */}
        {searchStats && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <span>📊 <strong>{searchStats.total}</strong> cartes trouvées</span>
              <span>💰 <strong>{searchStats.withPrices}</strong> avec prix</span>
              {searchStats.avgPrice > 0 && (
                <span>📈 Prix moyen: <strong>{searchStats.avgPrice.toFixed(2)}€</strong></span>
              )}
              {lastSearchTime && (
                <span>🕒 Dernière recherche: {new Date(lastSearchTime).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Résultats de recherche */}
        {results.length > 0 && (
          <SearchResult
            results={results}
            groupBySet={groupBySet}
            handleAddCardsToPortfolio={handleAddCardsToPortfolio}
            sortKey={sortKey}
            sortOrder={sortOrder}
            pricesCache={pricesCache}
            dataSource={dataSource}
          />
        )}
      </div>
    </div>
  );
}
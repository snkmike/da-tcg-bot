// SearchTab.jsx
// Page de recherche générique multi-sources - Version refactorisée
// Fusion et généralisation de CardTraderSearchTab et SearchTab existant

import React from 'react';
import SearchInterface from './SearchInterface';
import SearchAdvancedFilters from './SearchAdvancedFilters';
import SearchStats from './SearchStats';
import SearchResult from './SearchResult';
import { useSearchState } from './useSearchState';
import { useSearchLogic } from './useSearchLogic';

export default function SearchTab({ handleAddCardsToPortfolio }) {
  // Utilisation des hooks personnalisés pour la gestion d'état et la logique
  const state = useSearchState();
  const { handleSearch, handleSearchByNumber } = useSearchLogic(state);

  // Calculer les options pour les selects
  const gameOptions = state.games.map(game => ({
    value: game.id,
    label: game.name
  }));

  const expansionOptions = state.expansions
    .filter(exp => !state.selectedGame || exp.game_id === state.selectedGame.value)
    .map(exp => ({
      value: exp.id,
      label: exp.name
    }));

  // Gestion des touches clavier
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (state.isNumberSearch) {
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Recherche de cartes</h1>
          <p className="text-gray-600">Recherchez et gérez vos cartes de collection</p>
        </div>

        {/* Interface de recherche */}
        <SearchInterface
          // État de recherche
          searchTerm={state.searchTerm}
          setSearchTerm={state.setSearchTerm}
          searchByNumber={state.searchByNumber}
          setSearchByNumber={state.setSearchByNumber}
          isNumberSearch={state.isNumberSearch}
          setIsNumberSearch={state.setIsNumberSearch}
          loading={state.loading}
          
          // Données de référence
          gameOptions={gameOptions}
          expansionOptions={expansionOptions}
          selectedGame={state.selectedGame}
          setSelectedGame={state.setSelectedGame}
          selectedExpansion={state.selectedExpansion}
          setSelectedExpansion={state.setSelectedExpansion}
          
          // Handlers
          onSearch={() => handleSearch()}
          onSearchByNumber={handleSearchByNumber}
          onKeyPress={handleKeyPress}
          onNumberKeyPress={handleNumberKeyPress}
        />

        {/* Filtres avancés */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SearchAdvancedFilters
            // État d'affichage
            showAdvancedFilters={state.showAdvancedFilters}
            setShowAdvancedFilters={state.setShowAdvancedFilters}
            loading={state.loading}
            
            // États des filtres
            selectedRarities={state.selectedRarities}
            setSelectedRarities={state.setSelectedRarities}
            minPrice={state.minPrice}
            setMinPrice={state.setMinPrice}
            maxPrice={state.maxPrice}
            setMaxPrice={state.setMaxPrice}
            sortKey={state.sortKey}
            setSortKey={state.setSortKey}
            sortOrder={state.sortOrder}
            setSortOrder={state.setSortOrder}
            groupBySet={state.groupBySet}
            setGroupBySet={state.setGroupBySet}
            
            // Handlers
            onResetFilters={state.resetFilters}
            onApplyFilters={() => handleSearch(true)}
          />
        </div>

        {/* Statistiques de recherche */}
        <SearchStats 
          results={state.results}
          pricesCache={state.pricesCache}
          lastSearchTime={state.lastSearchTime}
        />

        {/* Messages d'erreur */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">❌ {state.error}</p>
          </div>
        )}

        {/* Résultats de recherche */}
        {state.results.length > 0 && (
          <SearchResult
            results={state.results}
            groupBySet={state.groupBySet}
            handleAddCardsToPortfolio={handleAddCardsToPortfolio}
            sortKey={state.sortKey}
            sortOrder={state.sortOrder}
            pricesCache={state.pricesCache}
            dataSource={state.dataSource}
          />
        )}
      </div>
    </div>
  );
}

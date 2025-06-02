// SearchInterface.jsx
// Interface de recherche principale avec basculement nom/numéro

import React from 'react';
import { Search } from 'lucide-react';
import { SetFilter } from '../filters';

export default function SearchInterface({
  // État de recherche
  searchTerm,
  setSearchTerm,
  searchByNumber,
  setSearchByNumber,
  isNumberSearch,
  setIsNumberSearch,
  loading,
  
  // Données de référence
  gameOptions,
  expansionOptions,
  selectedGame,
  setSelectedGame,
  selectedExpansion,
  setSelectedExpansion,
  
  // Handlers
  onSearch,
  onSearchByNumber,
  onKeyPress,
  onNumberKeyPress
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Sélecteurs de jeu et extension */}
      <div className="mb-3">
        <SetFilter
          gameOptions={gameOptions}
          expansionOptions={expansionOptions}
          selectedGame={selectedGame}
          selectedExpansion={selectedExpansion}
          onGameChange={setSelectedGame}
          onExpansionChange={setSelectedExpansion}
          showGroupBySet={false}
        />
      </div>      {/* Basculement entre recherche par nom et par numéro */}
      <div className="flex items-center  mb-3">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setIsNumberSearch(false)}
            className={`transition-colors hover:text-blue-600 ${
              !isNumberSearch 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-500'
            }`}
          >
          Recherche par nom
          </button>
          
          <button
            onClick={() => setIsNumberSearch(!isNumberSearch)}
            className="mx-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title={`Basculer vers ${isNumberSearch ? 'la recherche par nom' : 'la recherche par numéro'}`}
          >
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isNumberSearch ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l4-4" />
            </svg>
          </button>
          
          <button
            onClick={() => setIsNumberSearch(true)}
            className={`transition-colors hover:text-blue-600 ${
              isNumberSearch 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-500'
            }`}
          >
            Recherche par numéro
          </button>
        </div>
      </div>

      {/* Interface de recherche adaptative */}
      {isNumberSearch ? (
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchByNumber}
              onChange={(e) => setSearchByNumber(e.target.value)}
              onKeyPress={onNumberKeyPress}
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
            onClick={onSearchByNumber}
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
              onKeyPress={onKeyPress}
              placeholder="Rechercher une carte..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={onSearch}
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
        </div>
      )}
    </div>
  );
}

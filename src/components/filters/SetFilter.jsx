import React from 'react';
import Select from 'react-select';
import { getCustomSelectStyles } from './utils';

/**
 * Composant de filtre pour la sélection de jeu et d'extension
 * Supporte deux modes d'utilisation :
 * 1. Mode simple avec extensions uniquement (pour compatibilité avec l'ancien usage)
 * 2. Mode complet avec jeux et extensions (pour SearchTab)
 */
export default function SetFilter({
  // Nouveau mode (jeux + extensions)
  gameOptions = [],
  expansionOptions = [],
  selectedGame,
  selectedExpansion,
  onGameChange,
  onExpansionChange,
  gameLabel = "Jeu",
  expansionLabel = "Extension",
  
  // Ancien mode (extensions uniquement) - pour compatibilité
  filterSet,
  setFilterSet,
  availableSets = [],
  showSetResults,
  setShowSetResults,
  isDisabled = false,
  filterKey,
  
  // Options communes
  showGroupBySet = false,
  groupBySet = false,
  onGroupBySetChange
}) {
  const selectStyles = getCustomSelectStyles();

  // Mode jeux + extensions (nouveau)
  if (gameOptions.length > 0 || onGameChange) {
    return (
      <div className="space-y-4">
        {/* Sélecteurs de jeu et extension */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélecteur de jeu */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {gameLabel}
            </label>
            <Select
              value={selectedGame}
              onChange={onGameChange}
              options={gameOptions}
              placeholder={`Sélectionner un ${gameLabel.toLowerCase()}...`}
              isClearable
              styles={selectStyles}
              className="text-sm"
              isDisabled={isDisabled}
            />
          </div>

          {/* Sélecteur d'extension */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {expansionLabel}
            </label>
            <Select
              value={selectedExpansion}
              onChange={onExpansionChange}
              options={expansionOptions}
              placeholder={`Sélectionner une ${expansionLabel.toLowerCase()}...`}
              isClearable
              isDisabled={!selectedGame || expansionOptions.length === 0 || isDisabled}
              styles={selectStyles}
              className="text-sm"
            />
          </div>
        </div>

        {/* Option de groupement par extension */}
        {showGroupBySet && onGroupBySetChange && (
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={groupBySet}
                onChange={(e) => onGroupBySetChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isDisabled}
              />
              Grouper par {expansionLabel.toLowerCase()}
            </label>
          </div>
        )}

        {/* Indication si aucune extension disponible */}
        {selectedGame && expansionOptions.length === 0 && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Aucune extension disponible pour ce jeu
          </div>
        )}
      </div>
    );
  }

  // Mode extension uniquement (ancien) - pour compatibilité
  const setOptions = [
    { value: 'all', label: 'Toutes les extensions' },
    ...availableSets.map(set => ({ value: set, label: set }))
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="set-select" className="block text-sm font-medium text-gray-700 mb-2">
          Extension
        </label>        
        <Select
          inputId="set-select"
          key={filterKey}
          options={setOptions}
          value={setOptions.find(opt => opt.value === filterSet)}
          onChange={option => setFilterSet(option.value)}
          styles={selectStyles}
          isDisabled={isDisabled}
          aria-label="Sélectionner une extension"
          className="text-sm"
        />
      </div>
      
      {setShowSetResults && (
        <div>
          <label className="flex items-center space-x-3 text-sm">
            <input
              id="group-by-set"
              type="checkbox"
              checked={showSetResults}
              onChange={e => setShowSetResults(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
              disabled={isDisabled}
            />
            <span className="font-medium text-gray-700">
              Afficher les résultats groupés par extension
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

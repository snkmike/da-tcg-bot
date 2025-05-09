import { useEffect, useState } from 'react';
import Select from 'react-select';

const gameOptions = [
  { value: 'all', label: 'Jeu *' },
  { value: 'Pokémon', label: 'Pokémon' },
  { value: 'Magic', label: 'Magic' },
  { value: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { value: 'Lorcana', label: 'Lorcana' },
];

export default function SearchBox({ localQuery, setLocalQuery, filterGame, setFilterGame, onSearch, isLoading }) {
  const [searchMode, setSearchMode] = useState('name');
  const [lorcanaSets, setLorcanaSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [noResult, setNoResult] = useState(false);

  useEffect(() => {
    if (filterGame === 'Lorcana' && searchMode === 'number') {
      fetch('https://api.lorcast.com/v0/sets')
        .then(res => res.json())
        .then(data => {
          const options = (data.results || []).map(set => ({
            value: set.code,
            label: set.name
          }));
          console.log("📦 Sets chargés:", options);
          setLorcanaSets(options);
        });
    }
  }, [filterGame, searchMode]);

  useEffect(() => {
    const executeSearch = async () => {
      console.log("🔍 Recherche en cours avec :", { inputValue, selectedSet, searchMode });
      if (filterGame !== 'all' && typeof inputValue === 'string' && inputValue.length > 2) {
        let res;
        if (searchMode === 'name') {
          console.log("🔍 Recherche par nom :", inputValue);
          res = await onSearch(inputValue);
        } else if (searchMode === 'number' && selectedSet && inputValue.length > 0) {
          console.log("🔍 Recherche par numéro :", { set: selectedSet.value, number: inputValue.trim() });
          res = await onSearch({ type: 'number', set: selectedSet.value, number: inputValue.trim() });
        }
        console.log("📥 Résultats reçus:", res);
        setNoResult(Array.isArray(res) && res.length === 0);
        if (Array.isArray(res)) {
          setLocalQuery(inputValue);
          if (typeof window !== 'undefined') {
            console.log("📤 Mise à jour manuelle des résultats depuis SearchBox");
            if (typeof window.setSearchResultsFromSearchBox === 'function') {
              window.setSearchResultsFromSearchBox(res);
            }
          }
        }
      }
    };
    executeSearch();
  }, [inputValue, filterGame, selectedSet]);

  const selectedGame = gameOptions.find(g => g.value === filterGame);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-1">
          <Select
            options={gameOptions}
            value={selectedGame}
            onChange={(option) => setFilterGame(option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div className="md:col-span-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              if (typeof e.target.value === 'string') {
                setInputValue(e.target.value);
              }
            }}
            placeholder={searchMode === 'name' ? "Rechercher une carte" : "Numéro (ex: 207)"}
            className="w-full border rounded p-2"
          />
          {filterGame === "Lorcana" && (
            <>
              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="radio"
                    value="name"
                    checked={searchMode === 'name'}
                    onChange={() => setSearchMode('name')}
                  /> Par nom
                </label>
                <label>
                  <input
                    type="radio"
                    value="number"
                    checked={searchMode === 'number'}
                    onChange={() => setSearchMode('number')}
                  /> Par numéro
                </label>
              </div>
              {searchMode === 'number' && (
                <div className="mt-2">
                  <Select
                    options={lorcanaSets}
                    value={selectedSet}
                    onChange={(option) => setSelectedSet(option)}
                    placeholder="Sélectionner un set Lorcana"
                  />
                </div>
              )}
            </>
          )}
          {noResult && (
            <div className="mt-2 text-red-500 text-sm">Aucune carte trouvée pour cette recherche.</div>
          )}
        </div>
        <div>
          <button
            onClick={async () => {
              let res;
              if (searchMode === 'name') {
                res = await onSearch(inputValue);
              } else if (searchMode === 'number' && selectedSet && inputValue.length > 0) {
                res = await onSearch({ type: 'number', set: selectedSet.value, number: inputValue.trim() });
              }
              setNoResult(Array.isArray(res) && res.length === 0);
            }}
            className="bg-blue-500 text-white py-2 px-4 rounded"
            disabled={isLoading}
          >
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
}

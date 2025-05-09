import { useEffect, useState } from 'react';
import Select from 'react-select';

const gameOptions = [
  { value: 'all', label: 'Jeu *' },
  { value: 'Pokémon', label: 'Pokémon' },
  { value: 'Magic', label: 'Magic' },
  { value: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { value: 'Lorcana', label: 'Lorcana' },
];

export default function SearchBox({ localQuery, setLocalQuery, filterGame, setFilterGame, onSearch, onSearchByNumber, isLoading }) {
  const [inputValue, setInputValue] = useState('');
  const [setId, setSetId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      const executeSearch = async () => {
        console.log("🔍 Recherche en cours avec :", { inputValue });
        if (filterGame !== 'all' && typeof inputValue === 'string' && inputValue.length > 2) {
          setLoading(true);
          try {
            const res = await onSearch(inputValue);
            console.log("📥 Résultats reçus:", res);
            setNoResult(Array.isArray(res) && res.length === 0);
            if (Array.isArray(res)) {
              setLocalQuery(inputValue);
            }
          } catch (error) {
            console.error("❌ Erreur lors de la recherche:", error);
            setNoResult(true);
          } finally {
            setLoading(false);
          }
        }
      };
      executeSearch();
    }, 500);

    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [inputValue, filterGame]);

  const handleSearchByNumberClick = async () => {
    if (!setId || !cardNumber) return;
    setLoading(true);
    try {
      await onSearchByNumber(setId, cardNumber);
      setInputValue(''); // Clear the search input
    } catch (error) {
      console.error('❌ Error during search by number:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = gameOptions.find(g => g.value === filterGame);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
        <div className="md:col-span-1">
          <Select
            options={gameOptions}
            value={selectedGame}
            onChange={(option) => setFilterGame(option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div className="md:col-span-3 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              if (typeof e.target.value === 'string') {
                setInputValue(e.target.value);
              }
            }}
            placeholder="Rechercher une carte"
            className="w-full border rounded p-2"
          />
          {loading && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            </div>
          )}
          {noResult && (
            <div className="mt-2 text-red-500 text-sm">Aucune carte trouvée pour cette recherche.</div>
          )}
        </div>
      </div>
      {filterGame === 'Lorcana' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Set ID (ex: TFC)"
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Numéro (ex: 207)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="md:col-span-1">
            <button
              onClick={handleSearchByNumberClick}
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 disabled:bg-gray-400"
              disabled={!setId || !cardNumber || loading}
            >
              {loading ? 'Recherche...' : '🔍 Rechercher par numéro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

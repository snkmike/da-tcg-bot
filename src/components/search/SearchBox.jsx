import { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchLorcanaSets } from '../../utils/api/fetchLorcanaData';

const gameOptions = [
  { value: 'all', label: 'Jeu *' },
  { value: 'Pokémon', label: 'Pokémon' },
  { value: 'Magic', label: 'Magic' },
  { value: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { value: 'Lorcana', label: 'Lorcana' },
];

export default function SearchBox({ 
  localQuery, 
  setLocalQuery, 
  filterGame, 
  setFilterGame, 
  onSearch, 
  onSearchByNumber, 
  isLoading,
  isNumberSearchOpen,
  setIsNumberSearchOpen
}) {
  const [inputValue, setInputValue] = useState('');
  const [setId, setSetId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [lorcanaSets, setLorcanaSets] = useState([]);

  useEffect(() => {
    if (filterGame === 'Lorcana') {
      const loadSets = async () => {
        const sets = await fetchLorcanaSets();
        setLorcanaSets(sets);
      };
      loadSets();
    }
  }, [filterGame]);

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
      const numbers = cardNumber.split(',').map(n => n.trim()).filter(n => n);
      await onSearchByNumber(setId, numbers);
      setInputValue('');
    } catch (error) {
      console.error('❌ Error during search by number:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = gameOptions.find(g => g.value === filterGame);
  const selectedSet = lorcanaSets.find(s => s.id === setId);
  const setOptions = lorcanaSets.map(set => ({
    value: set.id,
    label: (
      <div className="flex items-center gap-2">
        {set.icon && <img src={set.icon} alt="" className="w-6 h-6 object-contain" />}
        <span>{set.name}</span>
        <span className="text-gray-400 text-sm">({set.id})</span>
      </div>
    )
  }));

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      '&:hover': { borderColor: '#6366f1' },
      padding: '2px 4px',
      opacity: isNumberSearchOpen ? 0.5 : 1,
      pointerEvents: isNumberSearchOpen ? 'none' : 'auto',
    }),
    menu: base => ({ ...base, borderRadius: '0.5rem', zIndex: 10 }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#6366f1' : isFocused ? '#e0e7ff' : 'white',
      color: isSelected ? 'white' : 'black',
      padding: '8px 12px',
    }),
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4 ${isNumberSearchOpen ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="md:col-span-1">
          <Select
            options={gameOptions}
            value={selectedGame}
            onChange={(option) => setFilterGame(option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={customStyles}
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
            disabled={isNumberSearchOpen}
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
        <div>
          <button
            onClick={() => setIsNumberSearchOpen(!isNumberSearchOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors mb-3"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isNumberSearchOpen ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Recherche par numéro de carte
          </button>
          {isNumberSearchOpen && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Extension</label>
                  <Select
                    options={setOptions}
                    value={setOptions.find(opt => opt.value === setId)}
                    onChange={(option) => setSetId(option.value)}
                    styles={{...customStyles, control: base => ({...base})}}
                    placeholder="Sélectionnez une extension..."
                  />
                </div>
                <div className="md:col-span-7 ">
                  <label className="block text-sm text-gray-600 mb-1">Numéro(s)</label>
                  <input
                    type="text"
                    placeholder="Ex: 1,102,45"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">Séparez les numéros par des virgules</div>
                </div>
                <div className="md:col-span-2 pt-6">
                  <button
                    onClick={handleSearchByNumberClick}
                    className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 disabled:bg-gray-400 transition-colors"
                    disabled={!setId || !cardNumber || loading}
                  >
                    {loading ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

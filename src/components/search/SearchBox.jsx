import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Search } from 'lucide-react';
import { fetchLorcanaSets } from '../../utils/api/fetchLorcanaData';

const gameOptions = [
  { value: 'all', label: 'Jeu *' },
  { value: 'Pokémon', label: 'Pokémon' },
  { value: 'Magic', label: 'Magic' },
  { value: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { value: 'Lorcana', label: 'Lorcana' },
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99,102,241,0.5)' : 'none',
    '&:hover': {
      borderColor: '#4f46e5'
    },
    opacity: state.isDisabled ? 0.5 : 1,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#eef2ff' : 'white',
    color: isSelected ? 'white' : '#111827'
  })
};

export default function SearchBox({ 
  searchQuery,
  setSearchQuery,
  filterGame, 
  setFilterGame, 
  isLoading,
  isNumberSearchOpen,
  setIsNumberSearchOpen,
  handleSearchByNumber
}) {
  const [inputValue, setInputValue] = useState('');
  const [setId, setSetId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [noResult, setNoResult] = useState(false);
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      if (filterGame !== 'all' && value.length >= 3) {
        console.log('🔍 Déclenchement de la recherche avec:', value);
        setSearchQuery(value);
      }
    }, 500);

    setDebounceTimeout(timeout);
  };

  return (
    <div className="space-y-3 bg-white p-6 rounded-lg shadow-sm">
      {/* Ligne principale : Jeu | Zone de recherche */}
      <div className="grid grid-cols-[200px,1fr] gap-4 items-center">
        <Select
          options={gameOptions}
          value={gameOptions.find(opt => opt.value === filterGame)}
          onChange={(option) => setFilterGame(option.value)}
          styles={customSelectStyles}
          isSearchable={false}
          placeholder="Sélectionner un jeu"
          isDisabled={isNumberSearchOpen}
        />

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Rechercher une carte par nom..."
            className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              filterGame !== 'Lorcana' || isNumberSearchOpen
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300'
            }`}
            disabled={filterGame !== 'Lorcana' || isNumberSearchOpen}
          />
        </div>
      </div>

      {/* Ligne "Rechercher par numéro" - uniquement si Lorcana est sélectionné */}
      {filterGame === 'Lorcana' && !isNumberSearchOpen && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsNumberSearchOpen(true)}
            className="px-3 py-1.5 text-sm border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          >
            &gt; Rechercher par numéro
          </button>
        </div>
      )}

      {/* Interface de recherche par numéro */}
      {isNumberSearchOpen && filterGame === 'Lorcana' && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Recherche par numéro</h3>
            <button
              onClick={() => {
                setIsNumberSearchOpen(false);
                setInputValue('');
                setSetId('');
                setCardNumber('');
                setNoResult(false);
                // Reset la recherche quand on revient au mode nom
                if (debounceTimeout) {
                  clearTimeout(debounceTimeout);
                }
                setSearchQuery('');
              }}
              className="px-3 py-1.5 text-sm border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
            >
              &lt; Retour à la recherche par nom
            </button>
          </div>

          <div className="flex items-end gap-4">
            <div className="w-64">
              <label className="block text-xs font-medium text-gray-500 mb-1">Extension</label>
              <Select
                options={lorcanaSets.map(set => ({
                  value: set.code,
                  label: `${set.name} (${set.code})`
                }))}
                value={lorcanaSets
                  .filter(set => set.code === setId)
                  .map(set => ({
                    value: set.code,
                    label: `${set.name} (${set.code})`
                  }))[0]}
                onChange={(option) => setSetId(option?.value || '')}
                styles={customSelectStyles}
                placeholder="Sélectionner une extension"
                isClearable
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Numéro(s)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ex: 1, 2, 10, 12, 12F, 15, 18F"
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button 
                  onClick={() => {
                    if (setId && cardNumber) {
                      const numbers = cardNumber.split(',').map(n => n.trim());
                      handleSearchByNumber(setId, numbers);
                    }
                  }}
                  disabled={!setId || !cardNumber || isLoading}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${(!setId || !cardNumber || isLoading)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  {isLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
              <p className="mt-2 text-xs italic text-gray-500">
                Entrez les numéros séparés par des virgules. Ajoutez 'F' pour les versions foil (ex: 12, 12F, 15, 18F).
              </p>
            </div>
          </div>
        </div>
      )}

      {noResult && (
        <div className="text-red-500 text-sm">Aucun résultat trouvé</div>
      )}

      {isLoading && !isNumberSearchOpen && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
}

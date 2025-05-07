import { useEffect } from 'react';
import Select from 'react-select';

const gameOptions = [
  { value: 'all', label: 'Jeu *' },
  { value: 'Pokémon', label: 'Pokémon' },
  { value: 'Magic', label: 'Magic' },
  { value: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { value: 'Lorcana', label: 'Lorcana' },
];

export default function SearchBox({ localQuery, setLocalQuery, filterGame, setFilterGame, onSearch, isLoading }) {
  useEffect(() => {
    if (filterGame !== 'all' && localQuery.length > 2) {
      onSearch(localQuery);
    }
  }, [localQuery, filterGame]);

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
        <div className="md:col-span-3">
          <input
            type="text"
            placeholder="Nom de la carte (ex: Stitch)"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      {filterGame === 'all' && localQuery.length > 2 && (
        <p className="text-red-500 text-sm mt-2">🎴 Merci de choisir un jeu pour lancer la recherche.</p>
      )}
    </div>
  );
}

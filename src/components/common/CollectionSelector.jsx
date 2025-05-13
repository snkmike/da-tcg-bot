import React, { useState } from 'react';
import Select from 'react-select';

export default function CollectionSelector({ collections, selectedCollection, setSelectedCollection, customStyles }) {
  const [allSelected, setAllSelected] = useState(false);
  const options = collections.map(col => ({ value: col.id, label: col.name }));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedCollection(null); // Désélectionner tout
    } else {
      collections.forEach(col => {
        setSelectedCollection(prev => ({ ...prev, id: col.id, name: col.name })); // Simuler un clic manuel
      });
    }
    setAllSelected(!allSelected);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleSelectAll}
        className={`px-3 py-1 rounded transition-colors ${allSelected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
      >
        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
      </button>
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium block mb-1">Choisir une collection :</label>
        <Select
          options={options}
          value={options.find(opt => opt.value === selectedCollection?.id)}
          onChange={(option) => setSelectedCollection({ id: option.value, name: option.label })}
          styles={customStyles}
          placeholder="-- Sélectionnez --"
        />
      </div>
    </div>
  );
}

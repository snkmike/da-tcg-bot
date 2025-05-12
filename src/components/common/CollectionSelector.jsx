import React from 'react';
import Select from 'react-select';

export default function CollectionSelector({ collections, selectedCollection, setSelectedCollection, customStyles }) {
  const options = collections.map(col => ({ value: col.id, label: col.name }));
  return (
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
  );
}

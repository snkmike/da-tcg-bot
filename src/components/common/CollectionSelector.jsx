import React from 'react';
import Select from 'react-select';

export default function CollectionSelector({ collections, selectedCollection, setSelectedCollection, customStyles }) {
  const options = collections.map(col => ({ value: col.id, label: col.name }));

  const handleCollectionChange = (option) => {
    if (!option) {
      setSelectedCollection(null);
      return;
    }
    setSelectedCollection({ id: option.value, name: option.label });
  };

  const defaultStyles = {
    control: (base) => ({
      ...base,
      height: '42px',
      backgroundColor: 'white',
      borderColor: '#E5E7EB',
      '&:hover': {
        borderColor: '#A5B4FC'
      }
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected 
        ? '#4F46E5' 
        : isFocused 
          ? '#EEF2FF' 
          : 'white',
      color: isSelected ? 'white' : '#374151'
    }),
    ...customStyles
  };

  return (
    <div>
      <div className="text-sm  font-medium text-gray-700 mb-1.5">
        Ajouter pour la collection :
      </div>
      <Select
        options={options}
        value={options.find(opt => opt.value === selectedCollection?.id)}
        onChange={handleCollectionChange}
        styles={defaultStyles}
        placeholder="Sélectionner une collection"
        noOptionsMessage={() => "Aucune collection disponible"}
        isClearable
        className="min-w-[250px]"
      />
    </div>
  );
}

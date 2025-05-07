import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Sparkles } from 'lucide-react';
import Select from 'react-select';

export default function LorcanaResults({ results = [], setSelectedCard, handleAddCardsToPortfolio, groupBySet = false }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || '');
    };
    fetchUser();

    const fetchCollections = async () => {
      const { data, error } = await supabase.from('collections').select('name');
      if (data) setCollections(data.map(c => c.name));
    };
    fetchCollections();
  }, []);

  const collectionOptions = collections.map(name => ({ value: name, label: name }));

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#16a34a' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #16a34a' : 'none',
      '&:hover': {
        borderColor: '#16a34a',
      },
      padding: '2px 4px',
      minHeight: '38px',
    }),
    menu: base => ({
      ...base,
      borderRadius: '0.5rem',
      zIndex: 10,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#16a34a' : isFocused ? '#bbf7d0' : 'white',
      color: isSelected ? 'white' : 'black',
      padding: '8px 12px',
    }),
  };

  const toggleCardSelection = (card) => {
    setSelectedCards((prev) => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.filter(c => c.id !== card.id);
      return [...prev, { ...card, quantity: 1, isFoil: false }];
    });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBatchAdd = () => {
    if (!selectedCollection) return showToast('❌ Choisissez une collection');
    if (selectedCards.length === 0) return showToast('❌ Aucune carte sélectionnée');

    const expandedCards = selectedCards.flatMap(card => {
      const { id, quantity = 1, ...rest } = card;
      return Array.from({ length: quantity }, () => ({ ...rest }));
    });

    handleAddCardsToPortfolio(expandedCards, selectedCollection);
    showToast(`✅ ${expandedCards.length} carte(s) ajoutée(s)`);
    setSelectedCards([]);
  };

  const handleSingleAdd = (card) => {
    if (!selectedCollection) return showToast('❌ Choisissez une collection');
    handleAddCardsToPortfolio([{ ...card }], selectedCollection);
    showToast(`✅ Carte ajoutée: ${card.name}`);
  };

  const renderCard = (card, isSelected, selected) => (
    <div
      key={card.id}
      onClick={() => toggleCardSelection(card)}
      className={`relative bg-white border p-3 rounded-lg shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <input
        type="checkbox"
        className="absolute top-2 right-2"
        checked={isSelected}
        onChange={(e) => { e.stopPropagation(); toggleCardSelection(card); }}
      />
      <div>
        <img src={card.image} alt={card.name} className="w-full h-auto object-contain mb-2 rounded" />
        <h3 className="text-sm font-semibold leading-tight truncate">{card.name}</h3>
        <p className="text-xs text-gray-600 truncate">Set: {card.set_name}</p>
        <p className="text-xs text-gray-600">#{card.collector_number} - {card.rarity}</p>
        <div className="text-sm mt-1">
          <span className="text-green-600">${card.price || '-'}</span>
          {card.foil_price && (
            <span className="text-purple-500 ml-2">Foil: ${card.foil_price}</span>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min="1"
            value={selected.quantity || 1}
            onChange={(e) => {
              const qty = parseInt(e.target.value, 10) || 1;
              setSelectedCards((prev) =>
                prev.map(c => c.id === card.id ? { ...c, quantity: qty } : c)
              );
            }}
            className="w-16 text-center border rounded p-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className={`p-1 rounded-full ${selected.isFoil ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            title="Foil"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCards((prev) =>
                prev.map(c => c.id === card.id ? { ...c, isFoil: !c.isFoil } : c)
              );
            }}
          >
            <Sparkles size={16} />
          </button>
        </div>
      )}
      {selectedCards.length === 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleSingleAdd(card); }}
          disabled={!selectedCollection}
          className={`mt-3 text-sm px-3 py-1 rounded ${
            selectedCollection ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          Ajouter à la collection
        </button>
      )}
    </div>
  );

  return (
    <div>
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium block mb-1">Choisir une collection :</label>
          <Select
            options={collectionOptions}
            value={collectionOptions.find(opt => opt.value === selectedCollection)}
            onChange={(option) => setSelectedCollection(option.value)}
            styles={customStyles}
            placeholder="-- Sélectionnez --"
          />
        </div>

        {selectedCards.length > 0 && (
          <button
            onClick={handleBatchAdd}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Ajouter {selectedCards.length} sélection(s)
          </button>
        )}
      </div>

      {groupBySet ? (
        Object.entries(
          results.reduce((acc, card) => {
            const set = card.set_name || 'Set inconnu';
            if (!acc[set]) acc[set] = [];
            acc[set].push(card);
            return acc;
          }, {})
        ).map(([setName, cards]) => (
          <div key={setName} className="mb-8">
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">{setName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {cards.map(card => {
                const selected = selectedCards.find(c => c.id === card.id);
                const isSelected = !!selected;
                return renderCard(card, isSelected, selected);
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {results.map(card => {
            const selected = selectedCards.find(c => c.id === card.id);
            const isSelected = !!selected;
            return renderCard(card, isSelected, selected);
          })}
        </div>
      )}
    </div>
  );
}

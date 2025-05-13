// LorcanaResults.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import useLorcanaCollections from '../../hooks/useLorcanaCollections';
import useCardSelection from '../collection/useCardSelection';
import { getCardUniqueKey } from '../utils/lorcanaCardUtils';
import CollectionSelector from '../common/CollectionSelector';
import Toast from '../common/Toast';
import CardGroup from './CardGroup';
import SearchCardItem from './SearchCardItem';

export default function LorcanaResults({ 
  results = [], 
  setSelectedCard, 
  groupBySet, 
  sortKey = 'alpha', 
  sortOrder = 'asc',
  handleAddCardsToPortfolio,
  duplicateWarnings
}) {
  const { userId, collections } = useLorcanaCollections();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [toast, setToast] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
  const { selectedCards, toggleCardSelection, updateQuantity, toggleFoil, setSelectedCards } = useCardSelection();
  const handleSelectCard = (card, isMultiSelect = false, isShiftSelect = false, currentIndex) => {
    // Vérification de l'état de sélection de la carte en utilisant l'ID exact et l'état de foil
    const isCardSelected = selectedCards.some(c => 
      c.id === card.id && 
      c.isFoil === card.isFoil
    );

    // Si c'est un clic simple (sans Ctrl/Shift)
    if (!isMultiSelect && !isShiftSelect) {
      if (isCardSelected) {
        // Si la carte est déjà sélectionnée, on la désélectionne
        setSelectedCards(prev => prev.filter(c => !(c.id === card.id && c.isFoil === card.isFoil)));
      } else {
        // Si la carte n'est pas sélectionnée, on la sélectionne seule
        setSelectedCards([{
          ...card,
          quantity: 1,
          quantityFoil: card.isFoil ? 1 : 0
        }]);
      }
      setLastSelectedIndex(currentIndex);
      return;
    }

    if (isShiftSelect && lastSelectedIndex !== -1) {
      // Shift selection
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const cardsToSelect = sortedResults.slice(start, end + 1);
      setSelectedCards(prev => {
        if (isMultiSelect) {
          // Add range to existing selection
          const newSelection = [...prev];
          cardsToSelect.forEach(c => {
            if (!newSelection.some(sc => getCardUniqueKey(sc) === getCardUniqueKey(c))) {
              newSelection.push({
                ...c,
                quantity: 1,
                quantityFoil: 0
              });
            }
          });
          return newSelection;
        } else {
          // Replace selection with range
          return cardsToSelect.map(c => ({
            ...c,
            quantity: 1,
            quantityFoil: 0
          }));
        }
      });
    } else {
      // Normal or Ctrl/Cmd selection
      if (!isMultiSelect) {
        const isCardSelected = selectedCards.some(c => getCardUniqueKey(c) === getCardUniqueKey(card));
        if (isCardSelected) {
          // If clicking on a selected card, just remove it
          setSelectedCards(prev => prev.filter(c => getCardUniqueKey(c) !== getCardUniqueKey(card)));
        } else {
          // If clicking on an unselected card, clear selection and select it
          setSelectedCards([{
            ...card,
            quantity: 1,
            quantityFoil: 0
          }]);
        }
      } else {
        // Ctrl/Cmd click
        toggleCardSelection(card);
      }
    }
    setLastSelectedIndex(currentIndex);
  };

  const handleSelectAll = () => {
    if (selectedCards.length === results.length) {
      setSelectedCards([]);
    } else {
      const allCards = results.map(card => ({
        ...card,
        quantity: 1,
        quantityFoil: 0
      }));
      setSelectedCards(allCards);
    }
  };

  const handleAddSelected = () => {
    if (!selectedCollection) {
      setToast('❌ Veuillez sélectionner une collection');
      return;
    }
    
    if (selectedCards.length === 0) {
      setToast('❌ Veuillez sélectionner au moins une carte');
      return;
    }

    handleAddCardsToPortfolio(selectedCards, selectedCollection.id);
    setToast(`✅ ${selectedCards.length} carte${selectedCards.length > 1 ? 's' : ''} ajoutée${selectedCards.length > 1 ? 's' : ''} à la collection`);
    setSelectedCards([]);
  };

  const sortedResults = [...results].sort((a, b) => {
    let valA, valB;
    if (sortKey === 'price') {
      valA = parseFloat(a.price || 0);
      valB = parseFloat(b.price || 0);
    } else if (sortKey === 'number') {
      valA = parseInt(a.collector_number || 0);
      valB = parseInt(b.collector_number || 0);
    } else {
      valA = a.name?.toLowerCase() || '';
      valB = b.name?.toLowerCase() || '';
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });
  const renderCard = (card, index) => {
    // On change la façon dont on détermine si une carte est sélectionnée
    // en utilisant l'ID exact et l'état de foil pour la correspondance
    const isSelected = selectedCards.some(c => 
      c.id === card.id && 
      c.isFoil === card.isFoil
    );
    // Créer une clé unique qui inclut l'index pour gérer les doublons
    const uniqueKey = `${getCardUniqueKey(card)}_${index}`;
    
    return (
      <SearchCardItem
        key={uniqueKey}
        card={card}
        isSelected={isSelected}
        onSelect={(e) => handleSelectCard(card, e.ctrlKey || e.metaKey, e.shiftKey, index)}
        updateQuantity={updateQuantity}
        toggleFoil={toggleFoil}
        selectedCollection={selectedCollection}
      />
    );
  };
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
          <div className="w-full md:w-[300px]">
            <CollectionSelector
              collections={collections}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={handleSelectAll}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCards.length === results.length 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white font-medium min-w-[140px]`}
            >
              {selectedCards.length === results.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            {selectedCards.length > 0 && (
              <button
                onClick={handleAddSelected}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
              >
                Ajouter {selectedCards.length} carte{selectedCards.length > 1 ? 's' : ''} 
                <span className="text-sm">({selectedCollection?.name || 'aucune collection'})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}      {/* Avertissement de doublons si présents */}
        {duplicateWarnings && duplicateWarnings.length > 0 && (
          <div className="bg-yellow-50 border-t border-b border-yellow-200 p-4 mb-4">
            <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Numéros en double détectés</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <div className="flex flex-wrap gap-2">
            {duplicateWarnings.map((warning) => (
              <span 
                key={warning.number}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                {warning.text}
              </span>
            ))}
              </div>
            </div>
          </div>
            </div>
          </div>
        )}

        {groupBySet ? (
          <div className="space-y-6">          {Object.entries(
          sortedResults.reduce((acc, card, index) => {
              const setName = card.set_name || 'Set inconnu';
              if (!acc[setName]) acc[setName] = { cards: [], startIndex: index };
              acc[setName].cards.push({ card, index });
              return acc;
            }, {})
          ).map(([setName, { cards, startIndex }]) => (
            <div key={setName}>
              <h3 className="text-lg font-bold text-indigo-600 mb-2">{setName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cards.map(({ card, index }) => renderCard(card, index))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedResults.map(renderCard)}
        </div>
      )}
    </div>
  );
}

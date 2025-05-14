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
    const isCardSelected = selectedCards.some(c => 
      c.id === card.id && 
      c.isFoil === card.isFoil
    );

    if (!isMultiSelect && !isShiftSelect) {
      if (isCardSelected) {
        setSelectedCards(prev => prev.filter(c => !(c.id === card.id && c.isFoil === card.isFoil)));
      } else {
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
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const cardsToSelect = sortedResults.slice(start, end + 1);
      setSelectedCards(prev => {
        if (isMultiSelect) {
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
          return cardsToSelect.map(c => ({
            ...c,
            quantity: 1,
            quantityFoil: 0
          }));
        }
      });
    } else {
      if (!isMultiSelect) {
        const isCardSelected = selectedCards.some(c => getCardUniqueKey(c) === getCardUniqueKey(card));
        if (isCardSelected) {
          setSelectedCards(prev => prev.filter(c => getCardUniqueKey(c) !== getCardUniqueKey(card)));
        } else {
          setSelectedCards([{
            ...card,
            quantity: 1,
            quantityFoil: 0
          }]);
        }
      } else {
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
    const totalCards = selectedCards.reduce((total, card) => total + (card.quantity || 1), 0);
    setToast(`✅ ${selectedCards.length} carte${selectedCards.length > 1 ? 's' : ''} (${totalCards} au total) ajoutée${selectedCards.length > 1 ? 's' : ''} à la collection "${selectedCollection.name}"`);
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
  });  const renderCard = (card, index) => {
    // Vérifier si la carte est sélectionnée en utilisant l'ID unique
    const selectedCard = selectedCards.find(c => getCardUniqueKey(c) === getCardUniqueKey(card));
    const isSelected = selectedCard !== undefined;
    const uniqueKey = `${getCardUniqueKey(card)}_${index}`;
    
    // Appliquer la quantité de la carte sélectionnée si elle existe
    const cardWithQuantity = selectedCard || card;

    return (
      <SearchCardItem
        key={uniqueKey}
        card={cardWithQuantity}
        isSelected={isSelected}
        onSelect={(e) => handleSelectCard(card, e.ctrlKey || e.metaKey, e.shiftKey, index)}
        updateQuantity={(cardId, newQuantity) => updateQuantity(cardId, newQuantity, card)}
        toggleFoil={toggleFoil}
        selectedCollection={selectedCollection}
      />
    );
  };
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="w-full md:w-[300px] self-end">
            <CollectionSelector
              collections={collections}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
            />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                >
                  Ajouter à la collection
                </button>
              )}
            </div>
            {selectedCards.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-600">
                  {selectedCards.length} carte{selectedCards.length > 1 ? 's' : ''} ({
                  selectedCards.reduce((total, card) => total + (card.quantity || 1), 0)
                  } au total) dans la collection :{' '}
                </span>
                <span className={selectedCollection ? 'font-medium text-gray-900' : 'text-red-500 font-medium'}>
                  {selectedCollection?.name || 'Aucune collection'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      {duplicateWarnings && duplicateWarnings.length > 0 && (
        <div className="bg-yellow-50 border-t border-b border-yellow-200 p-4 mb-4">
          <div className="flex items-start justify-between">
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
              <button
                onClick={() => {
                  // Pour chaque warning, trouver la carte correspondante et mettre à jour sa quantité
                  const updatedCards = duplicateWarnings.map(warning => {
                    const card = results.find(c => c.collector_number === warning.number);
                    if (card) {
                      const matches = warning.text.match(/\((\d+) fois\)/);
                      const quantity = matches ? parseInt(matches[1]) : 1;
                      
                      return {
                        ...card,
                        quantity: quantity,
                        quantityFoil: card.isFoil ? quantity : 0
                      };
                    }
                    return null;
                  }).filter(Boolean);

                  // Mettre à jour selectedCards en préservant les sélections existantes
                  setSelectedCards(prev => {
                    // Créer un nouveau tableau avec les cartes existantes
                    const newSelection = [...prev];
                    
                    // Pour chaque carte mise à jour
                    updatedCards.forEach(updatedCard => {
                      // Trouver si la carte existe déjà dans la sélection
                      const existingIndex = newSelection.findIndex(
                        c => c.collector_number === updatedCard.collector_number
                      );
                      
                      if (existingIndex >= 0) {
                        // Mise à jour de la quantité si la carte existe
                        newSelection[existingIndex] = {
                          ...newSelection[existingIndex],
                          quantity: updatedCard.quantity,
                          quantityFoil: updatedCard.quantityFoil
                        };
                      } else {
                        // Ajout de la nouvelle carte si elle n'existe pas
                        newSelection.push(updatedCard);
                      }
                    });
                    
                    return newSelection;
                  });

                  // Afficher confirmation
                  const totalCards = updatedCards.reduce((sum, card) => sum + card.quantity, 0);
                  setToast(`✅ ${updatedCards.length} carte(s) mise(s) à jour (${totalCards} au total)`);
                }}
                className="flex-shrink-0 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 text-sm font-medium rounded-md transition-colors"
              >
                Appliquer les quantités
              </button>
            </div>
          </div>
        </div>
      )}

      {groupBySet ? (
        <div className="space-y-6">
          {Object.entries(
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {sortedResults.map(renderCard)}
        </div>
      )}
    </div>
  );
}

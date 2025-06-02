// SearchResult.jsx
// Composant générique pour l'affichage des résultats de recherche avec système de sélection
// Généralisation de CardTraderResult pour supporter différentes sources de données

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import useSearchSelection from './useSearchSelection';
import CollectionSelector from '../common/CollectionSelector';
import Toast from '../common/Toast';
import SearchItem from './SearchItem';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';

export default function SearchResult({ 
  results = [], 
  groupBySet = false,
  handleAddCardsToPortfolio,
  sortKey = 'alpha',
  sortOrder = 'asc',
  pricesCache = {},
  dataSource = 'cardtrader' // 'cardtrader', 'lorcana', 'pokemon', etc.
}) {
  // États pour la gestion des sélections et collections
  const [userId, setUserId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [toast, setToast] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);  const { 
    selectedCards, 
    setSelectedCards, 
    toggleCardSelection, 
    updateQuantity, 
    getUniqueKey 
  } = useSearchSelection();

  // États pour les métadonnées (expansions, sets, etc.)
  const [expansions, setExpansions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données utilisateur et collections
  useEffect(() => {
    const loadUserAndCollections = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData?.user?.id;
        setUserId(currentUserId);

        if (currentUserId) {
          const { data: collectionsData, error } = await supabase
            .from('collections')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('❌ Erreur lors du chargement des collections:', error);
          } else {
            setCollections(collectionsData || []);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données utilisateur:', error);
      }
    };

    loadUserAndCollections();
  }, []);

  // Charger les métadonnées selon la source de données
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        if (dataSource === 'cardtrader') {
          const expansionsData = await cardTraderAPI.getExpansions();
          if (Array.isArray(expansionsData)) {
            setExpansions(expansionsData);
          }
        }
        // Ajouter d'autres sources de données ici si nécessaire
      } catch (error) {
        console.error('❌ Erreur lors du chargement des métadonnées:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [dataSource]);

  // Protection contre les résultats non valides
  const validResults = Array.isArray(results) ? results : [];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (validResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Aucune carte trouvée</p>
        <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  // Fonction pour trouver l'expansion par ID (adaptable selon la source)
  const getExpansionById = (expansionId) => {
    return expansions.find(exp => exp.id === expansionId) || null;
  };

  // Gestion de la sélection des cartes
  const handleSelectCard = (card, isMultiSelect = false, isShiftSelect = false, currentIndex) => {
    const isCardSelected = selectedCards.some(c => 
      getUniqueKey(c, dataSource) === getUniqueKey(card, dataSource)
    );

    if (!isMultiSelect && !isShiftSelect) {
      if (isCardSelected) {
        setSelectedCards(prev => prev.filter(c => getUniqueKey(c, dataSource) !== getUniqueKey(card, dataSource)));
      } else {
        const expansion = dataSource === 'cardtrader' ? getExpansionById(card.expansion_id) : null;
        const enhancedCard = {
          ...card,
          quantity: 1,
          quantityFoil: 0,
          expansion: expansion
        };
        setSelectedCards([enhancedCard]);
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
            if (!newSelection.some(sc => getUniqueKey(sc, dataSource) === getUniqueKey(c, dataSource))) {
              const expansion = dataSource === 'cardtrader' ? getExpansionById(c.expansion_id) : null;
              newSelection.push({
                ...c,
                quantity: 1,
                quantityFoil: 0,
                expansion: expansion
              });
            }
          });
          return newSelection;
        } else {
          return cardsToSelect.map(c => {
            const expansion = dataSource === 'cardtrader' ? getExpansionById(c.expansion_id) : null;
            return {
              ...c,
              quantity: 1,
              quantityFoil: 0,
              expansion: expansion
            };
          });
        }
      });
    } else {
      if (!isMultiSelect) {
        if (isCardSelected) {
          setSelectedCards(prev => prev.filter(c => getUniqueKey(c, dataSource) !== getUniqueKey(card, dataSource)));
        } else {
          const expansion = dataSource === 'cardtrader' ? getExpansionById(card.expansion_id) : null;
          const enhancedCard = {
            ...card,
            quantity: 1,
            quantityFoil: 0,
            expansion: expansion
          };
          setSelectedCards([enhancedCard]);
        }
      } else {
        toggleCardSelection(card, dataSource);
      }
    }
    setLastSelectedIndex(currentIndex);
  };

  // Sélectionner/désélectionner toutes les cartes
  const handleSelectAll = () => {
    if (selectedCards.length === validResults.length) {
      setSelectedCards([]);
    } else {
      const allCards = validResults.map(card => {
        const expansion = dataSource === 'cardtrader' ? getExpansionById(card.expansion_id) : null;
        return {
          ...card,
          quantity: 1,
          quantityFoil: 0,
          expansion: expansion
        };
      });
      setSelectedCards(allCards);
    }
  };

  // Adapter la fonction d'ajout selon la source de données
  const handleAddSelected = async () => {
    if (!selectedCollection) {
      setToast('❌ Veuillez sélectionner une collection');
      return;
    }
    
    if (selectedCards.length === 0) {
      setToast('❌ Veuillez sélectionner au moins une carte');
      return;
    }

    try {
      // Convertir les cartes au format attendu par handleAddCardsToPortfolio
      const cardsToAdd = selectedCards.map(card => {
        if (dataSource === 'cardtrader') {
          // Traitement spécifique CardTrader
          const cardId = `cardtrader_${card.id}_${card.expansion_id}_${card.category_id}`;
          const expansion = card.expansion || getExpansionById(card.expansion_id);
          const setCode = expansion?.code || `ct_${card.expansion_id}`;
          const setName = expansion?.name || 'Extension CardTrader';

          const fullName = card.name || 'Nom non disponible';
          let mainName = fullName;
          
          if (fullName.includes(' - ')) {
            const parts = fullName.split(' - ');
            mainName = parts[0];
          }

          const priceData = pricesCache[card.id];
          const cardTraderPrice = priceData ? (priceData.min * 1.1) : 0;

          return {
            id: cardId,
            name: mainName,
            set_code: setCode,
            set_name: setName,
            collector_number: card.fixed_properties?.collector_number || card.id,
            rarity: card.fixed_properties?.lorcana_rarity || card.rarity || 'Non spécifiée',
            image: card.image_url,
            quantity: card.quantity || 1,
            quantityFoil: card.quantityFoil || 0,
            isFoil: false,
            type: card.fixed_properties?.type || 'CardTrader',
            description: card.description || '',
            version: card.version || '',
            game: 'CardTrader',
            source: 'cardtrader',
            cardTraderPrice: cardTraderPrice,
            cardtrader_blueprint_id: card.id,
            cardtrader_expansion_id: card.expansion_id,
            cardtrader_category_id: card.category_id
          };
        } else {
          // Format générique pour d'autres sources
          return {
            ...card,
            quantity: card.quantity || 1,
            quantityFoil: card.quantityFoil || 0,
            source: dataSource
          };
        }
      });

      await handleAddCardsToPortfolio(cardsToAdd, selectedCollection.id);
      
      const totalCards = selectedCards.reduce((total, card) => total + (card.quantity || 1), 0);
      const sourceLabel = dataSource === 'cardtrader' ? 'CardTrader' : dataSource;
      setToast(`✅ ${selectedCards.length} carte${selectedCards.length > 1 ? 's' : ''} ${sourceLabel} (${totalCards} au total) ajoutée${selectedCards.length > 1 ? 's' : ''} à la collection "${selectedCollection.name}"`);
      setSelectedCards([]);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des cartes:', error);
      setToast('❌ Erreur lors de l\'ajout des cartes à la collection');
    }
  };

  // Tri des résultats
  const sortedResults = [...validResults].sort((a, b) => {
    let valA, valB;
    if (sortKey === 'price') {
      valA = 0; // À implémenter selon la source
      valB = 0;
    } else if (sortKey === 'number') {
      valA = parseInt(a.fixed_properties?.collector_number || a.collector_number || a.id || 0);
      valB = parseInt(b.fixed_properties?.collector_number || b.collector_number || b.id || 0);
    } else {
      valA = a.name?.toLowerCase() || '';
      valB = b.name?.toLowerCase() || '';
    }
    return sortOrder === 'asc' ? 
      (typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB) :
      (typeof valA === 'string' ? valB.localeCompare(valA) : valB - valA);
  });

  // Rendu d'une carte individuelle
  const renderCard = (card, index) => {
    const expansion = dataSource === 'cardtrader' ? getExpansionById(card.expansion_id) : null;
    const selectedCard = selectedCards.find(c => getUniqueKey(c, dataSource) === getUniqueKey(card, dataSource));
    const isSelected = selectedCard !== undefined;
    const uniqueKey = `${getUniqueKey(card, dataSource)}_${index}`;
    
    const cardWithQuantity = selectedCard || card;

    return (
      <SearchItem
        key={uniqueKey}
        card={cardWithQuantity}
        expansion={expansion}
        isSelected={isSelected}
        onSelect={(e) => handleSelectCard(card, e.ctrlKey || e.metaKey, e.shiftKey, index)}
        updateQuantity={(cardId, newQuantity) => updateQuantity(cardId, newQuantity, card, dataSource)}
        selectedCollection={selectedCollection}
        priceData={pricesCache[card.id]}
        dataSource={dataSource}
      />
    );
  };

  // Fonction pour grouper par set selon la source
  const getSetName = (card) => {
    if (dataSource === 'cardtrader') {
      const expansion = getExpansionById(card.expansion_id);
      return expansion?.name || 'Extension inconnue';
    }
    return card.set_name || card.expansion?.name || 'Set inconnu';
  };

  const getSourceLabel = () => {
    switch (dataSource) {
      case 'cardtrader': return 'CardTrader';
      case 'lorcana': return 'Lorcana';
      case 'pokemon': return 'Pokémon';
      default: return dataSource;
    }
  };

  return (
    <div className="space-y-4">
      {/* Interface de sélection et d'ajout */}
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
                  selectedCards.length === validResults.length 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white font-medium min-w-[140px]`}
              >
                {selectedCards.length === validResults.length ? 'Tout désélectionner' : 'Tout sélectionner'}
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

      {/* Affichage des notifications */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Affichage des résultats */}
      {groupBySet ? (
        <div className="space-y-6">
          {Object.entries(
            sortedResults.reduce((acc, card, index) => {
              const setName = getSetName(card);
              if (!acc[setName]) acc[setName] = { cards: [], startIndex: index };
              acc[setName].cards.push({ card, index });
              return acc;
            }, {})
          ).map(([setName, { cards, startIndex }]) => (
            <div key={setName}>
              <h3 className="text-lg font-bold text-indigo-600 mb-2">
                {setName} <span className="text-sm font-normal text-orange-600">({getSourceLabel()})</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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

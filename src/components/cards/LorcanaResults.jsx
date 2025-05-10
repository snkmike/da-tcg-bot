// LorcanaResults.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import { supabase } from '../../supabaseClient';
import SearchCardItem from './SearchCardItem';
import useLorcanaCollections from '../../hooks/useLorcanaCollections';

export default function LorcanaResults({ results = [], setSelectedCard, groupBySet, sortKey = 'alpha', sortOrder = 'asc' }) {
  const { userId, collections } = useLorcanaCollections();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [toast, setToast] = useState('');

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

  const collectionOptions = collections.map(col => ({ value: col.id, label: col.name }));

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#16a34a' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #16a34a' : 'none',
      '&:hover': { borderColor: '#16a34a' },
      padding: '2px 4px',
      minHeight: '38px',
    }),
    menu: base => ({ ...base, borderRadius: '0.5rem', zIndex: 10 }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#16a34a' : isFocused ? '#bbf7d0' : 'white',
      color: isSelected ? 'white' : 'black',
      padding: '8px 12px',
    }),
  };

  const getCardUniqueKey = (card) => `${card.id}_${card.collector_number}_${card.set_name}_${card.version || ''}_${card.isFoil}`;

  const toggleCardSelection = (card) => {
    setSelectedCards((prev) => {
      const key = getCardUniqueKey(card);
      const exists = prev.find(c => getCardUniqueKey(c) === key);
      if (exists) {
        return prev.filter(c => getCardUniqueKey(c) !== key);
      } else {
        return [...prev, { ...card, quantity: 1, isFoil: card.isFoil || false }];
      }
    });
  };

  const updateQuantity = (id, qty, card) => {
    setSelectedCards(prev => prev.map(c => getCardUniqueKey(c) === getCardUniqueKey(card) ? { ...c, quantity: qty } : c));
  };

  const toggleFoil = (id, card) => {
    setSelectedCards(prev => prev.map(c => getCardUniqueKey(c) === getCardUniqueKey(card) ? { ...c, isFoil: !c.isFoil } : c));
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBatchAdd = async () => {
    if (!userId) return showToast("❌ Utilisateur non connecté.");
    if (!selectedCollection?.id) return showToast("❌ Choisissez une collection");
    if (selectedCards.length === 0) return showToast("❌ Aucune carte sélectionnée");

    try {
      console.log('🟢 Cartes sélectionnées pour ajout:', selectedCards.map(c => ({
        id: c.id,
        name: c.name,
        set_name: c.set_name,
        collector_number: c.collector_number,
        version: c.version,
        isFoil: c.isFoil,
        quantity: c.quantity
      })));
      for (const card of selectedCards) {
        let cardId, setId, printingId;

        let cardQuery = supabase
          .from('cards')
          .select('id')
          .eq('name', card.name)
          .eq('game', 'Lorcana');
        const { data: existingCard } = await cardQuery.maybeSingle();
        console.log('🔎 Résultat recherche carte:', existingCard);

        if (existingCard) {
          cardId = existingCard.id;
        } else {
          const cardInsert = {
            name: card.name,
            game: 'Lorcana',
            type: card.type || null,
            rarity: card.rarity || null,
            image_url: card.image || null,
            description: card.oracle_text || null
          };
          const { data: newCard } = await supabase.from('cards').insert(cardInsert).select('id').maybeSingle();
          cardId = newCard?.id;
          console.log('🆕 Carte créée:', newCard);
        }

        const { data: existingSet } = await supabase
          .from('sets')
          .select('id')
          .eq('name', card.set_name)
          .eq('game', 'Lorcana')
          .maybeSingle();
        console.log('🔎 Résultat recherche set:', existingSet);

        if (existingSet) {
          setId = existingSet.id;
        } else {
          const { data: newSet } = await supabase.from('sets').insert({
            name: card.set_name,
            game: 'Lorcana',
            release_date: new Date().toISOString()
          }).select('id').maybeSingle();
          setId = newSet?.id;
          console.log('🆕 Set créé:', newSet);
        }

        const { data: existingPrinting } = await supabase
          .from('card_printings')
          .select('id, image_url, version')
          .eq('card_id', cardId)
          .eq('set_id', setId)
          .eq('collector_number', card.collector_number?.toString())
          .eq('version', card.version || null)
          .maybeSingle();
        console.log('🔎 Résultat recherche printing:', existingPrinting);

        if (existingPrinting) {
          printingId = existingPrinting.id;
          card.image = existingPrinting.image_url || card.image;
        } else {
          const printingImage = card.image || null;
          const { data: newPrinting } = await supabase.from('card_printings').insert({
            card_id: cardId,
            set_id: setId,
            collector_number: card.collector_number?.toString(),
            language: 'en',
            image_url: printingImage,
            version: card.version || null
          }).select('id, image_url, version').maybeSingle();
          printingId = newPrinting?.id;
          card.image = newPrinting?.image_url || card.image;
          console.log('🆕 Printing créé:', newPrinting);
        }

        const { data: existingInCollection } = await supabase
          .from('user_collections')
          .select('quantity')
          .eq('user_id', userId)
          .eq('collection_id', selectedCollection.id)
          .eq('card_printing_id', printingId)
          .eq('is_foil', card.isFoil)
          .maybeSingle();
        console.log('🔎 Résultat recherche dans collection:', existingInCollection);

        if (existingInCollection) {
          await supabase
            .from('user_collections')
            .update({
              quantity: existingInCollection.quantity + (card.quantity || 1)
            })
            .eq('user_id', userId)
            .eq('collection_id', selectedCollection.id)
            .eq('card_printing_id', printingId)
            .eq('is_foil', card.isFoil);
          console.log('✏️ Quantité mise à jour');
        } else {
          await supabase.from('user_collections').insert({
            user_id: userId,
            collection_id: selectedCollection.id,
            card_printing_id: printingId,
            quantity: card.quantity || 1,
            is_foil: card.isFoil,
            added_at: new Date().toISOString()
          });
          console.log('➕ Carte ajoutée à la collection');
        }
      }
      showToast(`✅ ${selectedCards.length} carte(s) ajoutée(s)`);
      setSelectedCards([]);
    } catch (error) {
      console.error('Erreur:', error);
      showToast("❌ Erreur lors de l'ajout des cartes");
    }
  };

  const handleSingleAdd = async (card) => {
    setSelectedCards([card]);
    await handleBatchAdd();
  };

  const renderGroup = (cards) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {cards.map(card => {
        const selected = selectedCards.find(c => getCardUniqueKey(c) === getCardUniqueKey(card));
        const isSelected = !!selected;
        return (
          <SearchCardItem
            key={`${card.id || card.name}-${card.collector_number}`}
            card={card}
            isSelected={isSelected}
            selected={selected || {}}
            toggleCardSelection={() => toggleCardSelection(card)}
            updateQuantity={(id, qty) => updateQuantity(id, qty, card)}
            toggleFoil={(id) => toggleFoil(id, card)}
            handleSingleAdd={handleSingleAdd}
            selectedCollection={selectedCollection}
          />
        );
      })}
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
            value={collectionOptions.find(opt => opt.value === selectedCollection?.id)}
            onChange={(option) => setSelectedCollection({ id: option.value, name: option.label })}
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

      {(!sortedResults || sortedResults.length === 0) ? (
        <div className="text-center text-red-500 text-sm mt-4">Aucune carte trouvée.</div>
      ) : groupBySet ? (
        Object.entries(
          sortedResults.reduce((acc, card) => {
            const set = card.set_name || 'Set inconnu';
            if (!acc[set]) acc[set] = [];
            acc[set].push(card);
            return acc;
          }, {})
        ).map(([setName, cards]) => (
          <div key={setName} className="mb-8">
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">{setName}</h3>
            {renderGroup(cards)}
          </div>
        ))
      ) : (
        renderGroup(sortedResults)
      )}
    </div>
  );
}

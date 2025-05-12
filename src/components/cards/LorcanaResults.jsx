// LorcanaResults.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import useLorcanaCollections from '../../hooks/useLorcanaCollections';
import useCardSelection from '../collection/useCardSelection';
import { getCardUniqueKey } from '../utils/lorcanaCardUtils';
import CollectionSelector from '../common/CollectionSelector';
import Toast from '../common/Toast';
import CardGroup from './CardGroup';

export default function LorcanaResults({ results = [], setSelectedCard, groupBySet, sortKey = 'alpha', sortOrder = 'asc' }) {
  const { userId, collections } = useLorcanaCollections();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [toast, setToast] = useState('');

  // Utilisation du hook personnalisé
  const { selectedCards, setSelectedCards, toggleCardSelection, updateQuantity, toggleFoil } = useCardSelection();

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

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBatchAdd = async () => {
    if (!userId) return showToast("❌ Utilisateur non connecté.");
    if (!selectedCollection?.id) return showToast("❌ Choisissez une collection");
    if (selectedCards.length === 0) return showToast("❌ Aucune carte sélectionnée");

    try {
      // On prépare deux lots : normal et foil, pour chaque carte sélectionnée
      let cardsToAdd = [];
      selectedCards.forEach(card => {
        // Ajout normal
        if (card.quantity && card.quantity > 0) {
          cardsToAdd.push({ ...card, isFoil: false, quantity: card.quantity });
        }
        // Ajout foil
        if (card.quantityFoil && card.quantityFoil > 0) {
          cardsToAdd.push({ ...card, isFoil: true, quantity: card.quantityFoil });
        }
      });
      if (cardsToAdd.length === 0) return showToast("❌ Aucune quantité à ajouter");

      // 🟢 Correction: injecte dynamiquement le set_code si absent
      for (let i = 0; i < cardsToAdd.length; i++) {
        if (!cardsToAdd[i].set_code) {
          const { data: setRow } = await supabase
            .from('sets')
            .select('code')
            .eq('name', cardsToAdd[i].set_name)
            .eq('game', 'Lorcana')
            .maybeSingle();
          if (setRow && setRow.code) {
            cardsToAdd[i].set_code = setRow.code;
            console.log('🟢 set_code injecté dynamiquement:', setRow.code, 'pour', cardsToAdd[i].name);
          } else {
            console.warn('⚠️ set_code introuvable pour', cardsToAdd[i].set_name, cardsToAdd[i].name);
          }
        }
      }
      // Log pour vérifier la propagation du set_code
      console.log('🟢 Cartes à ajouter (set_code check):', cardsToAdd.map(c => ({ name: c.name, set_name: c.set_name, set_code: c.set_code, collector_number: c.collector_number })));

      console.log('🟢 Cartes sélectionnées pour ajout:', cardsToAdd.map(c => ({
        id: c.id,
        name: c.name,
        set_name: c.set_name,
        collector_number: c.collector_number,
        version: c.version,
        isFoil: c.isFoil,
        quantity: c.quantity
      })));
      for (const card of cardsToAdd) {
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

        // Always upsert the set with the latest set_code from the card data
        let { data: existingSet } = await supabase
          .from('sets')
          .select('id, code')
          .eq('name', card.set_name)
          .eq('game', 'Lorcana')
          .maybeSingle();
        console.log('🔎 Résultat recherche set:', existingSet);

        if (existingSet) {
          setId = existingSet.id;
          // If code is missing or different, update it
          if (!existingSet.code || existingSet.code !== card.set_code) {
            await supabase.from('sets')
              .update({ code: card.set_code || null })
              .eq('id', setId);
            console.log('✏️ Set code mis à jour:', card.set_code);
          }
        } else {
          const { data: newSet } = await supabase.from('sets').insert({
            name: card.set_name,
            code: card.set_code || null,
            game: 'Lorcana',
            release_date: new Date().toISOString()
          }).select('id').maybeSingle();
          setId = newSet?.id;
          console.log('🆕 Set créé:', newSet);
        }

        // Always insert card_printing with set_code from card data
        const { data: existingPrinting } = await supabase
          .from('card_printings')
          .select('id, image_url, version, set_code')
          .eq('card_id', cardId)
          .eq('set_id', setId)
          .eq('collector_number', card.collector_number?.toString())
          .eq('version', card.version || null)
          .maybeSingle();
        console.log('🔎 Résultat recherche printing:', existingPrinting);

        if (existingPrinting) {
          printingId = existingPrinting.id;
          card.image = existingPrinting.image_url || card.image;
          // If set_code is missing or wrong, update it
          if (!existingPrinting.set_code || existingPrinting.set_code !== card.set_code) {
            await supabase.from('card_printings')
              .update({ set_code: card.set_code || null })
              .eq('id', printingId);
            console.log('✏️ Printing set_code mis à jour:', card.set_code);
          }
        } else {
          const printingImage = card.image || null;
          const { data: newPrinting } = await supabase.from('card_printings').insert({
            card_id: cardId,
            set_id: setId,
            set_code: card.set_code || null,
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
      showToast(`✅ ${cardsToAdd.length} carte(s) ajoutée(s)`);
      setSelectedCards([]);
    } catch (error) {
      console.error('Erreur:', error);
      showToast("❌ Erreur lors de l'ajout des cartes");
    }
  };

  const handleSingleAdd = async (card) => {
    // Ajoute normal et foil si besoin
    let cardsToAdd = [];
    if (card.quantity && card.quantity > 0) {
      cardsToAdd.push({ ...card, isFoil: false, quantity: card.quantity });
    }
    if (card.quantityFoil && card.quantityFoil > 0) {
      cardsToAdd.push({ ...card, isFoil: true, quantity: card.quantityFoil });
    }
    setSelectedCards(cardsToAdd);
    await handleBatchAdd();
  };

  return (
    <div>
      <Toast message={toast} />
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <CollectionSelector
          collections={collections}
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
          customStyles={customStyles}
        />
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
            <CardGroup
              cards={cards}
              selectedCards={selectedCards}
              toggleCardSelection={toggleCardSelection}
              updateQuantity={updateQuantity}
              toggleFoil={toggleFoil}
              handleSingleAdd={handleSingleAdd}
              selectedCollection={selectedCollection}
            />
          </div>
        ))
      ) : (
        <CardGroup
          cards={sortedResults}
          selectedCards={selectedCards}
          toggleCardSelection={toggleCardSelection}
          updateQuantity={updateQuantity}
          toggleFoil={toggleFoil}
          handleSingleAdd={handleSingleAdd}
          selectedCollection={selectedCollection}
        />
      )}
    </div>
  );
}

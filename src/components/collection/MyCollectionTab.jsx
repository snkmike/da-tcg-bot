// Nouveau MyCollectionTab.jsx - composant principal allégé
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import CollectionList from './CollectionList';
import CollectionDetails from './CollectionDetails';
import useCollectionData from './useCollectionData';

export default function MyCollectionTab({ user }) {
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    cards,
    collectionStats,
    fetchCollections,
    fetchCardsForCollection,
    showToast,
    toast
  } = useCollectionData(user);

  useEffect(() => {
    window.handleAddCardsToPortfolio = async (cards, collectionName) => {
      if (!user || !collectionName || !cards || cards.length === 0) return;

      const enrichedCards = cards.map(card => {
        const { id, ...rest } = card;
        return {
          ...rest,
          user_id: user.id,
          collection: collectionName
        };
      });

      const { error } = await supabase.from('cards').insert(enrichedCards);
      if (!error) {
        // Ajouter les prix des cartes dans la table price_history
        const priceEntries = enrichedCards.map(card => ({
          card_printing_id: card.card_printing_id,
          price: Math.random() * 100, // TODO: Remplacer par une API réelle pour récupérer le prix
          date: new Date().toISOString(),
          currency: 'EUR',
          is_foil: card.is_foil
        }));

        const { error: priceError } = await supabase.from('price_history').insert(priceEntries);
        if (priceError) {
          console.error('❌ Erreur lors de l\'ajout des prix dans price_history:', priceError);
        } else {
          console.log('✅ Prix ajoutés dans price_history');
        }

        showToast('✅ Carte ajoutée à la collection avec prix');
      } else {
        console.error('❌ Supabase insert error:', error);
      }
    };
  }, [user]);

  return (
    <div className="p-4">
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          {toast}
        </div>
      )}

      {!selectedCollection ? (
        <CollectionList
          collections={collections}
          collectionStats={collectionStats}
          onSelectCollection={async (col) => {
            console.log('Collection sélectionnée:', col); // Debug
            setSelectedCollection(col);
            await fetchCardsForCollection(col.id); // Utiliser col.id au lieu de col.name
          }}
          onRefresh={fetchCollections}
          onDeleteSuccess={fetchCollections}
          showToast={showToast}
          user={user}
        />
      ) : (
        <CollectionDetails
          collection={selectedCollection}
          cards={cards}
          onBack={() => setSelectedCollection(null)}
          fetchCardsForCollection={fetchCardsForCollection}
        />
      )}
    </div>
  );
}

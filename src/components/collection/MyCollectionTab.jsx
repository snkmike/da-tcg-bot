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
      if (error) {
        console.error('❌ Supabase insert error:', error);
      } else {
        showToast('✅ Carte ajoutée à la collection');
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
            setSelectedCollection(col);
            await fetchCardsForCollection(col.name);
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
        />
      )}
    </div>
  );
}

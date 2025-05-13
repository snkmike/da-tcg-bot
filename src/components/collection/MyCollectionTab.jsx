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
    toast,
    loadingValues
  } = useCollectionData(user);

  // La fonction handleAddCardsToPortfolio est maintenant gérée dans App.jsx

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
          loadingValues={loadingValues}
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

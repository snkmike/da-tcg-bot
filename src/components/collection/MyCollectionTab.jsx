// Modified MyCollectionTab.jsx with enhanced collection list (card count, creation date, value)
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function MyCollectionTab({ user }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cards, setCards] = useState([]);
  const [toast, setToast] = useState('');
  const [collectionStats, setCollectionStats] = useState({});

  useEffect(() => {
    if (user) fetchCollections();
  }, [user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchCollections = async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('name, created_at')
      .eq('user_id', user.id);
    if (!error) {
      setCollections(data);
      data.forEach(col => fetchStats(col.name));
    }
  };

  const fetchStats = async (collectionName) => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('collection', collectionName)
      .eq('user_id', user.id);

    if (!error && data) {
      const count = data.length;
      const value = data.reduce((sum, c) => sum + (c.isFoil ? (parseFloat(c.foil_price) || 0) : (parseFloat(c.price) || 0)), 0);
      setCollectionStats(prev => ({ ...prev, [collectionName]: { count, value } }));
    }
  };

  const fetchCardsForCollection = async (collectionName) => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('collection', collectionName)
      .eq('user_id', user.id);
    if (!error) setCards(data);
  };

  const handleSelectCollection = async (collection) => {
    setSelectedCollection(collection);
    await fetchCardsForCollection(collection.name);
  };

  useEffect(() => {
    if (!selectedCollection) return;
    const channel = supabase
      .channel('realtime:cards')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, (payload) => {
        if (payload.new?.collection === selectedCollection?.name) {
          fetchCardsForCollection(selectedCollection.name);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCollection]);

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

  const groupedCards = cards.reduce((acc, card) => {
    const key = `${card.name}_${card.set_name}_${card.collector_number}_${card.isFoil ? 'foil' : 'nonfoil'}`;
    if (!acc[key]) {
      acc[key] = { ...card, quantity: 1 };
    } else {
      acc[key].quantity += 1;
    }
    return acc;
  }, {});

  return (
    <div className="p-4">
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📚 Ma Collection</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = e.target.collectionName.value.trim();
            if (!name) return;
            const { error } = await supabase.from('collections').insert({ name, user_id: user.id });
            if (!error) {
              fetchCollections();
              showToast(`✅ Collection "${name}" créée`);
            }
            e.target.reset();
          }}
          className="flex gap-2"
        >
          <input
            name="collectionName"
            type="text"
            placeholder="Nouvelle collection"
            className="border px-3 py-1 rounded"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Ajouter
          </button>
        </form>
      </div>

      {!selectedCollection ? (
        <div className="space-y-4">
        {collections.length === 0 ? (
          <p className="text-gray-500">Aucune collection disponible.</p>
        ) : (
          collections.map((col) => {
            const stats = collectionStats[col.name] || { count: 0, value: 0 };
            const date = new Date(col.created_at).toLocaleDateString();
            return (
              <div
                key={col.name}
                onClick={() => handleSelectCollection(col)}
                className="relative bg-white border rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-between p-4"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-800">{col.name}</h3>
                  <p className="text-sm text-gray-500">Ajouté le : {date}</p>
                </div>
    
                <div className="flex items-center gap-4">
                  <p className="text-md text-gray-500">{stats.count} cartes</p>
                  <p className="text-md text-green-700 font-bold">💰 {stats.value.toFixed(2)} €</p>
                  
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!(window.confirm(`Supprimer la collection "${col.name}" ?`))) return;
                      const { error } = await supabase.from('collections').delete().eq('name', col.name).eq('user_id', user.id);
                      if (!error) {
                        fetchCollections();
                        showToast(`🗑️ Collection "${col.name}" supprimée`);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      ) : (
        <div>
          <button
            className="mb-4 text-indigo-600 hover:underline"
            onClick={() => setSelectedCollection(null)}
          >
            ← Retour aux collections
          </button>

          <h3 className="text-lg font-semibold mb-2">{selectedCollection.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {Object.values(groupedCards).map(card => (
              <div key={`${card.name}_${card.set_name}_${card.collector_number}_${card.isFoil}`} className="relative bg-white p-3 border rounded shadow">
                {card.quantity > 1 && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                    x{card.quantity}
                  </div>
                )}
                {card.isFoil && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
                    Foil
                  </div>
                )}
                <img src={card.image} alt={card.name} className="w-full h-auto object-contain mb-2 rounded" />
                <h3 className="text-sm font-semibold truncate">{card.name}</h3>
                <p className="text-xs text-gray-600 truncate">{card.set_name}</p>
                <p className="text-xs text-gray-600">#{card.collector_number} - {card.rarity}</p>
                <p className="text-sm text-green-600">${card.price || '-'}</p>
                {card.foil_price && <p className="text-sm text-purple-500">Foil: ${card.foil_price}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

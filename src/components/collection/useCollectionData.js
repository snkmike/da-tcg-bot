// useCollectionData.js - Hook personnalisé pour les collections utilisateur
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function useCollectionData(user) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cards, setCards] = useState([]);
  const [toast, setToast] = useState('');
  const [collectionStats, setCollectionStats] = useState({});

  useEffect(() => {
    if (user) fetchCollections();
  }, [user]);

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

  return {
    collections,
    selectedCollection,
    setSelectedCollection,
    cards,
    fetchCollections,
    fetchCardsForCollection,
    collectionStats,
    showToast,
    toast
  };
}

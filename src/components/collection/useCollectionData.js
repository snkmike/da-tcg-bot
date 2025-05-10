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
        if (payload.new?.collection === selectedCollection?.id) {
          fetchCardsForCollection(selectedCollection.id);
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
      .select('*')  // Sélectionner tous les champs
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Erreur fetching collections:', error);
      return;
    }
    setCollections(data);
    data.forEach(col => fetchStats(col.id)); // Utiliser l'ID plutôt que le nom
  };

  const fetchStats = async (collectionId) => {
    if (!collectionId) {
      console.error('ID de collection invalide pour les stats');
      return;
    }

    // Modification de la requête pour inclure correctement price_history
    const { data, error } = await supabase
      .from('user_collections')
      .select(`
        quantity,
        is_foil,
        card_printing:card_printing_id!inner (
          id,
          price_histories:price_history(
            price,
            date
          )
        )
      `)
      .eq('collection_id', collectionId)
      .eq('user_id', user.id);

    if (!error && data) {
      const count = data.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      
      const value = data.reduce((sum, item) => {
        // Récupérer le dernier prix de l'historique
        const priceHistories = item.card_printing?.price_histories || [];
        let latestPrice = 0;
        
        if (priceHistories.length > 0) {
          const sortedPrices = priceHistories.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          latestPrice = parseFloat(sortedPrices[0].price) || 0;
        }

        console.log(`Prix pour carte ${item.card_printing.id}:`, {
          priceHistories: item.card_printing?.price_histories,
          latestPrice,
          quantity: item.quantity
        });

        return sum + (latestPrice * (parseInt(item.quantity) || 0));
      }, 0);

      console.log(`📊 Stats détaillées pour collection ${collectionId}:`, {
        count,
        value: value.toFixed(2),
        rawData: data
      });

      setCollectionStats(prev => ({ 
        ...prev, 
        [collectionId]: { 
          count, 
          value: parseFloat(value.toFixed(2)) 
        } 
      }));
    } else {
      console.error('❌ Erreur stats:', error);
    }
  };

  const updatePricesForCollection = async (cardPrintingIds) => {
    if (!cardPrintingIds || cardPrintingIds.length === 0) return;

    try {
      // Récupérer le prix actuel du marché pour chaque carte
      const currentDate = new Date().toISOString();
      const priceUpdates = cardPrintingIds.map(printingId => ({
        card_printing_id: printingId,
        price: Math.random() * 100, // TODO: Remplacer par l'API de prix réelle
        date: currentDate,
        currency: 'EUR'
      }));

      const { error } = await supabase
        .from('price_history')
        .insert(priceUpdates);

      if (error) throw error;
      
      console.log('✅ Prix mis à jour pour', cardPrintingIds.length, 'cartes');
    } catch (error) {
      console.error('❌ Erreur mise à jour prix:', error);
    }
  };

  const updatePricesFromLorcast = async (cards) => {
    try {
      // Récupérer les prix actuels via Lorcast pour toutes les cartes
      for (const card of cards) {
        const response = await fetch(`https://api.lorcast.com/v0/cards/${card.set_code}/${card.collector_number}`);
        if (!response.ok) continue;

        const cardData = await response.json();
        const currentPrice = parseFloat(cardData.prices?.usd || 0);
        const currentFoilPrice = parseFloat(cardData.prices?.usd_foil || 0);

        // Insérer dans price_history si le prix a changé
        if (currentPrice > 0) {
          await supabase.from('price_history').insert({
            card_printing_id: card.card_printing.id,
            price: currentPrice,
            date: new Date().toISOString(),
            currency: 'USD',
            is_foil: false
          });
        }

        if (currentFoilPrice > 0) {
          await supabase.from('price_history').insert({
            card_printing_id: card.card_printing.id,
            price: currentFoilPrice,
            date: new Date().toISOString(),
            currency: 'USD',
            is_foil: true
          });
        }
      }
      
      console.log('✅ Prix mis à jour depuis Lorcast');
    } catch (error) {
      console.error('❌ Erreur mise à jour prix Lorcast:', error);
    }
  };

  const updatePricesForCards = async (cards) => {
    try {
      for (const card of cards) {
        // Récupérer les données Lorcast
        const response = await fetch(`https://api.lorcast.com/v0/cards/${card.set_code}/${card.collector_number}`);
        if (!response.ok) continue;
        
        const lorcastData = await response.json();
        const currentPrice = card.isFoil 
          ? parseFloat(lorcastData.prices?.usd_foil || 0)
          : parseFloat(lorcastData.prices?.usd || 0);

        // Récupérer le dernier prix en BDD
        const { data: latestPriceData } = await supabase
          .from('price_history')
          .select('price')
          .eq('card_printing_id', card.id)
          .eq('is_foil', card.isFoil)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        const lastPrice = latestPriceData?.price || 0;

        // Si le prix a changé, enregistrer le nouveau prix
        if (currentPrice > 0 && currentPrice !== lastPrice) {
          console.log(`💰 Mise à jour prix pour ${card.name}: $${lastPrice} → $${currentPrice}`);
          
          await supabase.from('price_history').insert({
            card_printing_id: card.id,
            price: currentPrice,
            date: new Date().toISOString(),
            currency: 'USD',
            is_foil: card.isFoil
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour prix:', error);
    }
  };

  const fetchCardsForCollection = async (collectionId) => {
    if (!collectionId) {
      console.error('ID de collection manquant');
      return;
    }

    try {
      const selectedCol = collections.find(c => c.id === collectionId);
      if (!selectedCol) {
        throw new Error('Collection non trouvée');
      }

      const { data, error } = await supabase
        .from('user_collections')
        .select(`
          quantity,
          is_foil,
          card_printing:card_printing_id (
            id,
            collector_number,
            set_code,
            image_url,
            version,
            price_histories:price_history(
              price,
              date
            ),
            card:card_id (
              id,
              name,
              rarity,
              type,
              description,
              version,
              image_url
            ),
            set:set_id (
              id,
              name,
              code
            )
          )
        `)
        .eq('collection_id', selectedCol.id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('📦 Raw data from DB:', data);

      if (!data || data.length === 0) {
        console.log('⚠️ Aucune carte trouvée pour cette collection');
        setCards([]);
        return;
      }

      console.log('🟢 Données brutes Supabase:', data);

      const formattedCards = data
        .filter(item => item.card_printing)
        .map(item => {
          if (!item.card_printing.card || !item.card_printing.set) {
            console.warn('❗ Carte incomplète dans user_collections:', item);
            return null;
          }
          const priceHistories = item.card_printing.price_histories || [];
          const latestPrice = priceHistories
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.price || 0;

          const cardObj = {
            id: item.card_printing.id,
            name: item.card_printing.card.name,
            rarity: item.card_printing.card.rarity,
            type: item.card_printing.card.type,
            version: item.card_printing.version || item.card_printing.card.version || item.version || null,
            set_name: item.card_printing.set.name,
            set_code: item.card_printing.set_code || item.card_printing.set.code,
            collector_number: item.card_printing.collector_number,
            image: item.card_printing.image_url || item.card_printing.card.image_url,
            quantity: item.quantity,
            isFoil: item.is_foil,
            price: latestPrice
          };
          console.log('🟢 Carte formatée:', cardObj);
          return cardObj;
        })
        .filter(Boolean);

      console.log('✅ Cartes formatées finales:', formattedCards);

      // Mettre à jour les prix
      await updatePricesForCards(formattedCards);
      
      // Recharger les données avec les nouveaux prix
      await fetchStats(collectionId);

      setCards(formattedCards);

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cartes:', error);
      setCards([]);
    }
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

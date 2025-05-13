// useCollectionData.js - Hook personnalisé pour les collections utilisateur
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function useCollectionData(user) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cards, setCards] = useState([]);
  const [toast, setToast] = useState('');
  const [collectionStats, setCollectionStats] = useState({});

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
              date,
              is_foil
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

      if (!data || data.length === 0) {
        console.log('⚠️ Aucune carte trouvée pour cette collection');
        setCards([]);
        return;
      }

      const processedCards = data.map(item => ({
        ...item.card_printing.card,
        ...item.card_printing,
        quantity: item.quantity,
        isFoil: item.is_foil,
        card_printing_id: item.card_printing.id, // Ajout explicite de card_printing_id
        image: item.card_printing.image_url, // Ajout de l'image
        set_name: item.card_printing.set.name, // Ajout du nom du set
        price: item.card_printing.price_histories.find(p => !p.is_foil)?.price || 0, // Ajout du prix normal
        foil_price: item.card_printing.price_histories.find(p => p.is_foil)?.price || 0, // Ajout du prix foil
      }));

      setCards(processedCards);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cartes:', error);
      setCards([]);
    }
  };

  useEffect(() => {
    if (user) fetchCollections();
  }, [user]);

  useEffect(() => {
    if (!selectedCollection) return;

    // Vérifier si les cartes sont déjà chargées pour éviter les appels répétés
    if (cards.length > 0) {
      console.log('✅ Les cartes sont déjà chargées. Aucun nouvel appel nécessaire.');
      return;
    }

    console.log('🔄 Chargement initial des cartes pour la collection');
    fetchCardsForCollection(selectedCollection.id);
  }, [selectedCollection]); // Removed cards from dependencies

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
    // Correction : reset aussi les stats pour éviter un affichage obsolète
    setCollectionStats({});
    data.forEach(col => fetchStats(col.id)); // Utiliser l'ID plutôt que le nom
  };

  const fetchStats = async (collectionId) => {
    if (!collectionId) {
      console.error('ID de collection invalide pour les stats');
      return;
    }

    try {
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

      if (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        return;
      }

      const value = data.reduce((sum, item) => {
        const priceHistories = item.card_printing?.price_histories || [];
        const latestPrice = priceHistories
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.price || 0;

        return sum + (latestPrice * (item.quantity || 0));
      }, 0);

      setCollectionStats((prev) => ({
        ...prev,
        [collectionId]: {
          count: data.reduce((sum, item) => sum + (item.quantity || 0), 0),
          value: parseFloat(value.toFixed(2)),
        },
      }));
    } catch (error) {
      console.error('Erreur lors du calcul des stats:', error);
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

  const refreshPricesForCollection = async (collectionId) => {
    console.log(`🔄 Rafraîchissement des prix pour la collection ${collectionId}`);
    await fetchCardsForCollection(collectionId);
    console.log(`✅ Rafraîchissement terminé pour la collection ${collectionId}`);
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

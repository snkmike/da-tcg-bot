// updatePricesDaily.js - Script pour mettre à jour les prix des cartes quotidiennement
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient('https://your-supabase-url', 'your-supabase-key');

async function updatePrices() {
  try {
    console.log('🔄 Début de la mise à jour quotidienne des prix');

    // Récupérer toutes les cartes
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, card_printing_id, is_foil');

    if (error) throw error;

    // Mettre à jour les prix pour chaque carte
    const priceUpdates = cards.map(async (card) => {
      const price = Math.random() * 100; // TODO: Remplacer par une API réelle pour récupérer le prix
      const date = new Date().toISOString();

      return {
        card_printing_id: card.card_printing_id,
        price,
        date,
        currency: 'EUR',
        is_foil: card.is_foil,
      };
    });

    const resolvedUpdates = await Promise.all(priceUpdates);

    // Insérer les nouveaux prix dans la table price_history
    const { error: insertError } = await supabase
      .from('price_history')
      .insert(resolvedUpdates);

    if (insertError) throw insertError;

    console.log('✅ Mise à jour des prix terminée avec succès');
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour des prix:', err);
  }
}

// Exécuter la mise à jour
updatePrices();

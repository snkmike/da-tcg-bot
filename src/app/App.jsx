import React, { useEffect, useState } from 'react';
import { useAppState } from './useAppState';
import { renderContent } from './routes';
import Auth from '../components/auth/Auth';
import TabButton from '../components/ui/TabButton';
import { Search, PieChart, Library } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { fetchLorcanaData } from '../utils/api/fetchLorcanaData';

export default function App() {
  const state = useAppState();
  const { user, setUser, activeTab, setActiveTab } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSet, setFilterSet] = useState('all');
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [showSetResults, setShowSetResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filterGame, setFilterGame] = useState('all');
  const [availableSets, setAvailableSets] = useState([]);

  const handleAddCardsToPortfolio = async (cards, collectionId) => {
    console.log('🎯 Début handleAddCardsToPortfolio:', { cards, collectionId });
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId || !collectionId || !cards || cards.length === 0) {
        console.error('❌ Données manquantes:', { userId, collectionId, cardsLength: cards?.length });
        return;
      }

      console.log('📦 Cards to process:', cards);
      
      // Update foil status for all cards
      cards.forEach(card => {
        if (card.id) {
          const isFoil = card.id.endsWith('_foil');
          card.isFoil = isFoil;
        }
      });

      // Now prepare the collection entries
      const enrichedCards = await Promise.all(cards.map(async card => {
        // Clean the UUID as we did before
        const isFoil = card.id.endsWith('_foil');
        const cardUuid = card.id.replace('crd_', '').replace('_foil', '');
        console.log('🔍 Looking for card printing:', { cardUuid, set_code: card.set_code, isFoil });
        
        // Get the card printing ID
        const { data: cardPrintings, error: printingError } = await supabase
          .from('card_printings')
          .select('id')
          .eq('card_id', cardUuid)
          .eq('set_code', card.set_code);

        if (printingError) {
          console.error('❌ Error finding card printing:', printingError);
          return null;
        }

        let cardPrinting = cardPrintings?.[0];

        // If no card printing exists, create it
        if (!cardPrinting) {
          console.log('➕ Creating missing card printing:', { cardUuid, set_code: card.set_code });
          
          // Create card if needed
          // Format the UUID with hyphens if needed
          const formattedUuid = cardUuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
          console.log('🔍 Looking for existing card:', formattedUuid);
          
          const { data: existingCard } = await supabase
            .from('cards')
            .select('id')
            .eq('id', formattedUuid)
            .single();

          if (!existingCard) {
            console.log('➕ Creating new card:', { cardUuid, name: card.name, game: 'Lorcana' });
            const { error: cardError } = await supabase
              .from('cards')
              .insert({
                id: formattedUuid,
                name: card.name,
                rarity: card.rarity,
                type: card.type,
                description: card.oracle_text || card.description,
                version: card.version,
                game: 'Lorcana'
              });

            if (cardError) {
              console.error('❌ Error creating card:', cardError);
              console.error('Failed card data:', {
                id: cardUuid,
                name: card.name,
                rarity: card.rarity,
                type: card.type,
                description: card.oracle_text || card.description,
                version: card.version,
                game: 'Lorcana'
              });
              return null;
            }
          }

          // Get or create set
          const { data: existingSet } = await supabase
            .from('sets')
            .select('id')
            .eq('code', card.set_code)
            .single();

          let setId;
          if (!existingSet) {
            const { data: newSet, error: setError } = await supabase
              .from('sets')
              .insert({
                name: card.set_name,
                code: card.set_code,
                game: 'Lorcana'
              })
              .select('id')
              .single();

            if (setError) {
              console.error('❌ Error creating set:', setError);
              return null;
            }
            setId = newSet.id;
          } else {
            setId = existingSet.id;
          }

          // Create the card printing
          const newCardPrintingId = crypto.randomUUID();
          const { data: newPrinting, error: insertError } = await supabase
            .from('card_printings')
            .insert({
              id: newCardPrintingId,
              collector_number: card.collector_number,
              set_code: card.set_code,
              image_url: card.image,
              card_id: formattedUuid,
              set_id: setId
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('❌ Error creating card printing:', insertError);
            return null;
          }

          cardPrinting = newPrinting;
        }
          
        // Handle the case where the card printing wasn't found but also wasn't created
        if (!cardPrinting) {
          console.error('❌ Failed to get or create card printing:', card);
          return null;
        }
        
        console.log('📦 Traitement de la carte:', card);
        return {
          user_id: userId,
          collection_id: collectionId,
          card_printing_id: cardPrinting.id,
          quantity: card.quantity || 1,
          is_foil: card.isFoil || false
        };
      }));

      const validCards = enrichedCards.filter(card => card !== null);
      
      if (validCards.length === 0) {
        console.error('❌ Aucune carte valide à ajouter');
        return;
      }

      console.log('📥 Cartes à insérer:', validCards);

      // Insérer les cartes dans la collection
      const { error: insertError } = await supabase
        .from('user_collections')
        .insert(validCards);

      if (insertError) {
        console.error('❌ Erreur Supabase:', insertError);
        return;
      }

      // Ajouter les prix dans price_history
      const priceEntries = [];
      
      for (const card of cards) {
        // Clean the UUID as we did before
        const cardUuid = card.id.replace('crd_', '').replace('_foil', '');
        
        // Get the card printing ID for this card
        const { data: cardPrinting } = await supabase
          .from('card_printings')
          .select('id')
          .eq('card_id', cardUuid)
          .eq('set_code', card.set_code)
          .single();

        if (!cardPrinting) continue;

        const date = new Date().toISOString();

        if (card.price) {
          priceEntries.push({
            card_printing_id: cardPrinting.id,
            price: parseFloat(card.price),
            date,
            currency: 'USD',
            is_foil: false
          });
        }
        
        if (card.foil_price) {
          priceEntries.push({
            card_printing_id: cardPrinting.id,
            price: parseFloat(card.foil_price),
            date,
            currency: 'USD',
            is_foil: true
          });
        }
      }

      if (priceEntries.length > 0) {
        const { error: priceError } = await supabase
          .from('price_history')
          .insert(priceEntries);

        if (priceError) {
          console.error('❌ Erreur lors de l\'ajout des prix:', priceError);
        } else {
          console.log('✅ Prix ajoutés dans price_history');
        }
      }

      console.log('✅ Cartes ajoutées avec succès à la collection');
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des cartes:', error);
    }
  };

  useEffect(() => {
    // Ne pas faire de recherche si on vient de faire une recherche par numéro
    if (window.lastSearchWasById) {
      window.lastSearchWasById = false;
      return;
    }

    // Ne rien faire s'il n'y a pas de requête valide
    if (!searchQuery || searchQuery.length < 3 || filterGame !== 'Lorcana') {
      return;
    }
    
    // Ne pas écraser les résultats existants s'ils sont présents
    if (searchResults.length > 0) {
      return;
    }
    
    const doSearch = async () => {
      console.log('🔄 App.jsx - Recherche par nom déclenchée:', searchQuery);
      const results = await fetchLorcanaData(
        searchQuery, filterSet, minPrice, maxPrice, selectedRarities, showSetResults
      );
      console.log('📦 App.jsx - Résultats reçus:', results?.length || 0);
      setSearchResults(results);
    };
    doSearch();
  }, [searchQuery, filterSet, minPrice, maxPrice, selectedRarities, showSetResults, filterGame]);

  useEffect(() => {
    const preloadLorcanaSets = async () => {
      try {
        const res = await fetch('https://api.lorcast.com/v0/sets');
        const json = await res.json();
        const uniqueSets = [...new Set(json.results.map(set => set.name).filter(Boolean))].sort();
        setAvailableSets(uniqueSets);
        //console.log('📦 Sets chargés (preload):', uniqueSets);
      } catch (err) {
        console.error('Erreur chargement sets Lorcana:', err);
        setAvailableSets([]);
      }
    };

    if (filterGame === 'Lorcana') {
      preloadLorcanaSets();
    } else {
      setAvailableSets([]);
    }
  }, [filterGame]);

  if (!user) return <Auth setUser={setUser} />;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">DaTCG Optimizer</h1>
        <button
          className="text-sm underline hover:text-red-300"
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
          }}
        >
          Déconnexion
        </button>
      </header>

      <nav className="bg-white shadow-md">
        <div className="flex">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<PieChart size={18} />} label="Dashboard" />
          <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')} icon={<Search size={18} />} label="Recherche" />
          <TabButton active={activeTab === 'collection'} onClick={() => setActiveTab('collection')} icon={<Library size={18} />} label="Ma Collection" />
        </div>
      </nav>

      <main className="flex-1 p-4 overflow-y-auto">
        {renderContent(activeTab, {
          ...state,
          searchQuery,
          setSearchQuery,
          filterSet,
          setFilterSet,
          minPrice,
          setMinPrice,
          maxPrice,
          setMaxPrice,
          selectedRarities,
          setSelectedRarities,
          showSetResults,
          setShowSetResults,
          filterGame,
          setFilterGame,
          searchResults,
          availableSets,
          filterKey: filterGame,
          handleAddCardsToPortfolio
        })}
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useAppState } from './useAppState';
import { renderContent } from './routes';
import Auth from '../components/auth/Auth';
import TabButton from '../components/ui/TabButton';
import { Search, PieChart, Library, User, Tags, CreditCard } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

export default function App() {
  const state = useAppState();
  const { user, setUser, activeTab, setActiveTab } = state;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;

    if (path === '/mon-compte' || path === '/auth/callback') {
      setActiveTab('mon-compte');
    } else if (path === '/ma-collection') {
      setActiveTab('ma-collection');
    } else if (path === '/listings') { // Added Listings path
      setActiveTab('listings');
    } else if (path === '/recherche') { // Renamed CardTrader to Recherche
      setActiveTab('recherche');
    } else if (path === '/cardtrader-search') { // Redirect old cardtrader-search to recherche
      setActiveTab('recherche');
      navigate('/recherche'); // Redirect old route
    } else if (path === '/' || path === '/tableau-de-bord') {
      setActiveTab('tableau-de-bord'); // Démarrer sur le dashboard par défaut
      navigate('/tableau-de-bord');
    }
  }, [location.pathname, setActiveTab, navigate]);
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
      
      // Séparer les cartes par source (Lorcana vs CardTrader)
      const lorcanaCards = cards.filter(card => !card.source || card.source !== 'cardtrader');
      const cardTraderCards = cards.filter(card => card.source === 'cardtrader');

      console.log('📊 Répartition des cartes:', { 
        lorcana: lorcanaCards.length, 
        cardtrader: cardTraderCards.length 
      });

      const allEnrichedCards = [];

      // Traitement des cartes Lorcana (logique existante)
      if (lorcanaCards.length > 0) {
        console.log('🃏 Traitement des cartes Lorcana...');
        
        lorcanaCards.forEach(card => {
          if (card.id) {
            const isFoil = card.id.endsWith('_foil');
            card.isFoil = isFoil;
          }
        });

        const lorcanaEnrichedCards = await Promise.all(lorcanaCards.map(async card => {
          const isFoil = card.id.endsWith('_foil');
          const cardUuid = card.id.replace('crd_', '').replace('_foil', '');
          console.log('🔍 Looking for Lorcana card printing:', { cardUuid, set_code: card.set_code, isFoil });
          
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

          if (!cardPrinting) {
            console.log('➕ Creating missing Lorcana card printing:', { cardUuid, set_code: card.set_code });
            
            const formattedUuid = cardUuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
            console.log('🔍 Looking for existing card:', formattedUuid);
            
            const { data: existingCard } = await supabase
              .from('cards')
              .select('id')
              .eq('id', formattedUuid)
              .single();

            if (!existingCard) {
              console.log('➕ Creating new Lorcana card:', { cardUuid, name: card.name, game: 'Lorcana' });
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
                return null;
              }
            }

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
            
          if (!cardPrinting) {
            console.error('❌ Failed to get or create Lorcana card printing:', card);
            return null;
          }
          
          console.log('📦 Traitement de la carte Lorcana:', card);
          return {
            user_id: userId,
            collection_id: collectionId,
            card_printing_id: cardPrinting.id,
            quantity: card.quantity || 1,
            is_foil: card.isFoil || false
          };
        }));

        allEnrichedCards.push(...lorcanaEnrichedCards.filter(card => card !== null));
      }

      // Traitement des cartes CardTrader (nouvelle logique)
      if (cardTraderCards.length > 0) {
        console.log('🎴 Traitement des cartes CardTrader...');
          const cardTraderEnrichedCards = await Promise.all(cardTraderCards.map(async card => {
          console.log('🔍 Traitement carte CardTrader:', card);
          
          // Créer un UUID pour la carte CardTrader basé sur ses propriétés uniques
          const cardTraderUuid = crypto.randomUUID();
          
          // Vérifier si la carte existe déjà dans notre base
          const { data: existingCard } = await supabase
            .from('cards')
            .select('id')
            .eq('name', card.name)
            .eq('game', 'CardTrader')
            .single();

          let cardId = cardTraderUuid;
          
          if (!existingCard) {
            console.log('➕ Creating new CardTrader card:', { name: card.name, game: 'CardTrader' });
            const { error: cardError } = await supabase
              .from('cards')
              .insert({
                id: cardTraderUuid,
                name: card.name,
                rarity: card.rarity,
                type: card.type || 'CardTrader',
                description: card.description || '',
                version: card.version || '',
                game: 'CardTrader'
              });

            if (cardError) {
              console.error('❌ Error creating CardTrader card:', cardError);
              return null;
            }
          } else {
            cardId = existingCard.id;
          }

          // Créer ou récupérer le set CardTrader
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
                game: 'CardTrader'
              })
              .select('id')
              .single();

            if (setError) {
              console.error('❌ Error creating CardTrader set:', setError);
              return null;
            }
            setId = newSet.id;
          } else {
            setId = existingSet.id;
          }

          // Créer le card_printing pour CardTrader
          const cardTraderPrintingId = crypto.randomUUID();
          const { data: cardTraderPrinting, error: printingError } = await supabase
            .from('card_printings')
            .insert({
              id: cardTraderPrintingId,
              collector_number: card.collector_number,
              set_code: card.set_code,
              image_url: card.image,
              card_id: cardId,
              set_id: setId
            })
            .select('id')
            .single();

          if (printingError) {
            console.error('❌ Error creating CardTrader card printing:', printingError);
            return null;
          }

          // Ajouter l'historique de prix si la carte a un prix CardTrader
          if (card.cardTraderPrice && card.cardTraderPrice > 0) {
            console.log('💰 Ajout du prix CardTrader:', card.cardTraderPrice);
            const { error: priceError } = await supabase
              .from('price_history')
              .insert({
                card_printing_id: cardTraderPrinting.id,
                price: card.cardTraderPrice,
                date: new Date().toISOString(),
                currency: 'EUR',
                is_foil: card.isFoil || false
              });

            if (priceError) {
              console.error('❌ Error adding CardTrader price:', priceError);
            }
          }

          console.log('📦 Carte CardTrader créée avec succès:', card.name);
          return {
            user_id: userId,
            collection_id: collectionId,
            card_printing_id: cardTraderPrinting.id,
            quantity: card.quantity || 1,
            is_foil: card.isFoil || false
          };
        }));

        allEnrichedCards.push(...cardTraderEnrichedCards.filter(card => card !== null));
      }

      if (allEnrichedCards.length === 0) {
        console.error('❌ Aucune carte valide à ajouter');
        return;
      }

      console.log('📥 Toutes les cartes à insérer:', allEnrichedCards);

      const { error: insertError } = await supabase
        .from('user_collections')
        .insert(allEnrichedCards);

      if (insertError) {
        console.error('❌ Erreur Supabase:', insertError);
        return;
      }

      // Gestion des prix (seulement pour les cartes Lorcana qui ont des prix)
      const priceEntries = [];
      
      for (const card of lorcanaCards) {
        const cardUuid = card.id.replace('crd_', '').replace('_foil', '');
        
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
      console.error('❌ Erreur lors de l\'ajout des cartes:', error);    }
  };  const allTabs = [
    { name: 'tableau-de-bord', label: 'Tableau de Bord', icon: PieChart, path: '/tableau-de-bord' },
    { name: 'recherche', label: 'Recherche', icon: Search, path: '/recherche' },
    { name: 'ma-collection', label: 'Ma Collection', icon: Library, path: '/ma-collection' },
    { name: 'listings', label: 'Listings CardTrader', icon: Tags, path: '/listings' },
    { name: 'mon-compte', label: 'Mon Compte', icon: User, path: '/mon-compte' },
  ];

  const mainNavTabs = allTabs.filter(tab => tab.name !== 'mon-compte');
  const myAccountTabInfo = allTabs.find(tab => tab.name === 'mon-compte');

  if (!user) return <Auth setUser={setUser} />;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white text-gray-700 shadow-md sticky top-0 z-50">
        {/* Row 1: Title, My Account (Pill), Logout (Pill) */}
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TCG Bot</h1>
          <div className="flex items-center space-x-3">
            {myAccountTabInfo && (
              <TabButton
                key={myAccountTabInfo.name}
                label={myAccountTabInfo.label}
                icon={myAccountTabInfo.icon}
                isActive={activeTab === myAccountTabInfo.name}
                onClick={() => {
                  setActiveTab(myAccountTabInfo.name);
                  navigate(myAccountTabInfo.path);
                }}
                isPill={true}
              />
            )}
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                navigate('/');
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
        {/* Row 2: Main Navigation Tabs (Pills) */}
        <nav className="px-4 py-2 flex items-center space-x-2 border-t border-gray-200">
          {mainNavTabs.map(tab => (
            <TabButton
              key={tab.name}
              label={tab.label}
              icon={tab.icon}
              isPill={true}
              isActive={activeTab === tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                navigate(tab.path);
              }}
            />
          ))}
        </nav>
      </header>
      <main className="flex-1 p-4 overflow-auto pt-5">        {renderContent(
          activeTab, 
          { 
            ...state, 
            handleAddCardsToPortfolio
          }, 
          location
        )}
      </main>
    </div>
  );
}

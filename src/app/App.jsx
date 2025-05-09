
import React, { useEffect, useState } from 'react';
import { useAppState } from './useAppState';
import { renderContent } from './routes';
import Auth from '../components/auth/Auth';
import TabButton from '../components/ui/TabButton';
import { Search, Bell, Tag, PieChart, Library } from 'lucide-react';
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

  const handleAddCardsToPortfolio = async (cards, collectionName) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
  
    if (!userId || !collectionName || !cards || cards.length === 0) return;
  
    const enrichedCards = cards.map(card => {
      const { id, ...rest } = card;
      return {
        ...rest,
        user_id: userId,
        collection: collectionName,
      };
    });
  
    const { error } = await supabase.from('cards').insert(enrichedCards);
    if (error) {
      console.error('❌ Supabase insert error:', error);
    } else {
      //console.log(`✅ Ajouté à la collection '${collectionName}':`, enrichedCards);
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
          <TabButton active={activeTab === 'price'} onClick={() => setActiveTab('price')} icon={<PieChart size={18} />} label="Prix" />
          <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<Bell size={18} />} label="Alertes" />
          <TabButton active={activeTab === 'tags'} onClick={() => setActiveTab('tags')} icon={<Tag size={18} />} label="Étiquettes" />
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

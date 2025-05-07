// src/app/useAppState.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { fetchLorcanaData } from '../utils/api/fetchLorcanaData';

const mockCards = [
  { id: 1, name: "Charizard", game: "Pokémon", set: "Base Set", price: 1250 },
  { id: 2, name: "Black Lotus", game: "Magic", set: "Alpha", price: 30000 },
  { id: 3, name: "Dark Magician", game: "Yu-Gi-Oh!", set: "LOB", price: 120 },
  { id: 4, name: "Pikachu", game: "Pokémon", set: "Jungle", price: 45 },
];

export function useAppState() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterGame, setFilterGame] = useState('all');
  const [filterSet, setFilterSet] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSetResults, setShowSetResults] = useState(false);
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [importedCollection, setImportedCollection] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableSets, setAvailableSets] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);

  useEffect(() => {
    const preloadLorcanaSets = async () => {
      try {
        const res = await fetch(`http://localhost:8020/lorcast/cards?q=a`);
        const json = await res.json();
        const uniqueSets = [...new Set(json.results.map(card => card.set?.name).filter(Boolean))].sort();
        setAvailableSets(uniqueSets);
      } catch (err) {
        console.error('Erreur chargement sets Lorcana:', err);
        setAvailableSets([]);
      }
    };

    if (filterGame === 'Lorcana') {
      preloadLorcanaSets();
    } else if (filterGame === 'all') {
      setAvailableSets([]);
    } else {
      const gameSets = [...new Set(mockCards.filter(c => c.game === filterGame).map(c => c.set))].sort();
      setAvailableSets(gameSets);
    }
  }, [filterGame]);

  useEffect(() => {
    const fetch = async () => {
      if (filterGame === 'Lorcana') {
        const results = await fetchLorcanaData(searchQuery, filterSet, minPrice, maxPrice, selectedRarities, showSetResults);
        setSearchResults(results);
      } else {
        if (searchQuery.length > 2) {
          const filtered = mockCards.filter(card => {
            const matchesQuery = card.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGame = filterGame === 'all' || card.game === filterGame;
            const matchesSet = filterSet === 'all' || card.set === filterSet;
            const matchesMin = !minPrice || card.price >= parseFloat(minPrice);
            const matchesMax = !maxPrice || card.price <= parseFloat(maxPrice);
            return matchesQuery && matchesGame && matchesSet && matchesMin && matchesMax;
          });
          setSearchResults(filtered);
        } else {
          setSearchResults([]);
        }
      }
    };
    fetch();
  }, [searchQuery, filterGame, filterSet, minPrice, maxPrice, showSetResults, selectedRarities]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Erreur récupération user:", error);
      } else {
        setUser(data?.user);
        console.log("🧪 User ID détecté:", data?.user?.id);
      }
    });
  }, []);

  return {
    user, setUser,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    filterGame, setFilterGame,
    filterSet, setFilterSet,
    selectedCard, setSelectedCard,
    showSetResults, setShowSetResults,
    userPortfolio, setUserPortfolio,
    importedCollection, setImportedCollection,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    availableSets, setAvailableSets,
    selectedRarities, setSelectedRarities,
    mockCards
  };
}

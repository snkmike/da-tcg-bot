// src/app/useAppState.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const mockCards = [
  { id: 1, name: "Charizard", game: "Pokémon", set: "Base Set", price: 1250 },
  { id: 2, name: "Black Lotus", game: "Magic", set: "Alpha", price: 30000 },
  { id: 3, name: "Dark Magician", game: "Yu-Gi-Oh!", set: "LOB", price: 120 },
  { id: 4, name: "Pikachu", game: "Pokémon", set: "Jungle", price: 45 },
];

export function useAppState() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tableau-de-bord'); // Démarrer sur le dashboard
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [importedCollection, setImportedCollection] = useState([]);
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
    userPortfolio, setUserPortfolio,
    importedCollection, setImportedCollection,
    mockCards
  };
}

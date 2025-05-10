// useLorcanaCollections.js
// Hook personnalisé pour gérer l'utilisateur connecté et récupérer ses collections depuis Supabase

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function useLorcanaCollections() {
  const [userId, setUserId] = useState('');
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchUserAndCollections = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const id = userData?.user?.id || '';
      setUserId(id);

      if (id) {
        const { data: colData } = await supabase.from('collections').select('id, name');
        if (colData) setCollections(colData);
      }
    };

    fetchUserAndCollections();
  }, []);

  return {
    userId,
    collections,
  };
}

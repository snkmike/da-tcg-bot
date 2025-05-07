// src/components/Auth.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function Auth({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
    };
  }, [setUser]);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    let response;
    try {
      if (mode === 'signup') {
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: import.meta.env.VITE_SITE_URL || 'http://localhost:3000'
          }
        });
        if (!response.error) {
          const userId = response.data?.user?.id;
          if (userId) {
            await supabase.from('collections').insert({
              user_id: userId,
              name: 'Ma première collection',
              cards: []
            });
          }
        }
      } else {
        response = await supabase.auth.signInWithPassword({ email, password });
      }

      if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Erreur de connexion : ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{mode === 'signup' ? 'Créer un compte' : 'Connexion'}</h2>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-3 border border-gray-300 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        {loading ? 'Chargement...' : mode === 'signup' ? "S'inscrire" : 'Se connecter'}
      </button>

      <p className="text-sm text-center mt-4">
        {mode === 'signup' ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
        <button
          className="text-indigo-600 hover:underline"
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Connectez-vous' : 'Inscrivez-vous'}
        </button>
      </p>
    </div>
  );
}

// src/app/App.jsx
import React from 'react';
import { useAppState } from './useAppState';
import { renderContent } from './routes';
import Auth from '../components/auth/Auth';
import TabButton from '../components/ui/TabButton';
import { Search, Bell, Tag, PieChart, Library } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function App() {
  const state = useAppState();
  const { user, setUser, activeTab, setActiveTab } = state;

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
        {renderContent(activeTab, state)}
      </main>
    </div>
  );
}
// CollectionList.jsx - Affiche la liste des collections utilisateur
import React from 'react';
import { supabase } from '../../supabaseClient';

export default function CollectionList({
  collections,
  collectionStats,
  onSelectCollection,
  onRefresh,
  onDeleteSuccess,
  showToast,
  user,
  loadingValues
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📚 Ma Collection</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = e.target.collectionName.value.trim();
            if (!name) return;
            const { error } = await supabase.from('collections').insert({ name, user_id: user.id });
            if (!error) {
              onRefresh();
              showToast(`✅ Collection "${name}" créée`);
            }
            e.target.reset();
          }}
          className="flex gap-2"
        >
          <input
            name="collectionName"
            type="text"
            placeholder="Nouvelle collection"
            className="border px-3 py-1 rounded"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Ajouter
          </button>
        </form>
      </div>

      {collections.length === 0 ? (
        <p className="text-gray-500">Aucune collection disponible.</p>
      ) : (
        collections.map((col) => {
          const stats = collectionStats[col.id] || { count: 0, value: 0 };
          const date = new Date(col.created_at).toLocaleDateString();
          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col)}
              className="relative bg-white border rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-between p-4"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-800">{col.name}</h3>
                <p className="text-sm text-gray-500">Ajouté le : {date}</p>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-md text-gray-500">{stats.count || 0} cartes</p>
                {loadingValues[col.id] ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                    <span className="text-gray-500">Calcul...</span>
                  </div>
                ) : (
                  <p className="text-md text-green-700 font-bold">
                    💰 {(stats.value || 0).toFixed(2)}€
                  </p>
                )}

                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!(window.confirm(`Supprimer la collection "${col.name}" ?`))) return;
                    const { error } = await supabase
                      .from('collections')
                      .delete()
                      .eq('id', col.id)
                      .eq('user_id', user.id);
                    if (!error) {
                      onDeleteSuccess();
                      showToast(`🗑️ Collection "${col.name}" supprimée`);
                    }
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

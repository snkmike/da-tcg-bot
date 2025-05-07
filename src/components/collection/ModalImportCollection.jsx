// src/components/ModalImportCollection.jsx
import React, { useState } from 'react';
import { importCollectionFromCSV } from './utils/importCollection';

export default function ModalImportCollection({ onClose, onImport, hideCollectionName }) {
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImportClick = () => {
    if (!file) return;
    importCollectionFromCSV(file, (cards) => {
      onImport(cards, () => {
        setToast('✅ Importation réussie');
        setTimeout(() => {
          setToast('');
          onClose();
        }, 1500);
      });
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">Importer une collection</h2>

        {!hideCollectionName && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom de la collection</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Nom personnalisé (optionnel)"
              disabled
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Fichier CSV</label>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleImportClick}
            disabled={!file}
          >
            Importer
          </button>
        </div>

        {toast && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow mt-4">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';

export default function CreateListingModal({ blueprint, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    price: '',
    quantity: 1,
    description: '',
    condition: 'Near Mint',
    language: 'en',
    foil: false,
    tag: '',
    user_data_field: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const conditions = [
    'Mint',
    'Near Mint',
    'Slightly Played',
    'Moderately Played',
    'Played',
    'Heavily Played',
    'Poor'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        blueprint_id: blueprint.id,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description,
        tag: formData.tag,
        user_data_field: formData.user_data_field,
        properties: {
          condition: formData.condition,
          language: formData.language,
          foil: formData.foil
        }
      };

      const result = await cardTraderAPI.createProduct(productData);
      console.log('✅ Listing créé avec succès:', result);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('❌ Erreur lors de la création du listing:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer un Listing</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900">{blueprint.name}</h3>
          <p className="text-sm text-gray-600">Blueprint ID: {blueprint.id}</p>
          {blueprint.image_url && (
            <img 
              src={blueprint.image_url} 
              alt={blueprint.name}
              className="w-32 h-auto mt-2 rounded"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (EUR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            {/* Langue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Langue
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Foil */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="foil"
              checked={formData.foil}
              onChange={(e) => handleChange('foil', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="foil" className="ml-2 block text-sm text-gray-900">
              Carte Foil
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (visible pour les acheteurs)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez l'état de la carte ou ajoutez des informations utiles..."
            />
          </div>

          {/* Tag (privé) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag (privé, visible seulement par vous)
            </label>
            <input
              type="text"
              value={formData.tag}
              onChange={(e) => handleChange('tag', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Collection personnelle, Achat 2024..."
            />
          </div>

          {/* Données utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Données personnelles (emplacement stockage, référence...)
            </label>
            <input
              type="text"
              value={formData.user_data_field}
              onChange={(e) => handleChange('user_data_field', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Étagère A-2, Boîte Magic 2023..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.price}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Création...' : 'Créer le Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

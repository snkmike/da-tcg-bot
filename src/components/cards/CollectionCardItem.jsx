// CollectionCardItem.jsx
// Version spécialisée de CardItem pour l'affichage dans une collection
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import CardItem from './CardItem';

export default function CollectionCardItem({
  card,
  onUpdate,
  collectionId
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(card.quantity);
  const [isFoil, setIsFoil] = useState(card.isFoil);

  const showToast = (message) => {
    console.log(message);
    // TODO: Implémenter un système de toast global
  };
  const handleUpdate = async () => {
    try {
      const validQuantity = parseInt(quantity, 10);
      if (isNaN(validQuantity) || validQuantity < 1) {
        console.error('Quantité invalide:', quantity);
        showToast("❌ Quantité invalide");
        return;
      }

      const { error } = await supabase
        .from('user_collections')
        .update({
          quantity: validQuantity,
          is_foil: isFoil,
        })
        .match({
          collection_id: collectionId,
          card_printing_id: card.card_printing_id // Utiliser l'ID du printing au lieu de l'ID de la carte
        });

      if (error) throw error;
      
      if (onUpdate) onUpdate();
      showToast(`✅ Carte mise à jour: ${validQuantity} exemplaire(s)`);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showToast("❌ Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    console.log('Données de la carte:', card);
    if (!window.confirm('Voulez-vous vraiment supprimer cette carte de la collection ?')) return;

    if (!card.card_printing_id) {
      console.error('Erreur: card_printing_id est undefined');
      showToast("❌ Erreur: ID de l'impression de la carte manquant");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .match({
          collection_id: collectionId,
          card_printing_id: card.card_printing_id, // Utiliser l'ID du printing
          is_foil: isFoil // Ajouter la distinction foil/non-foil
        });

      if (error) throw error;
      if (onUpdate) onUpdate();
      showToast('🗑️ Carte supprimée de la collection');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast("❌ Erreur lors de la suppression");
    }
  };
  // Contenu spécifique à la collection
  const editingContent = (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center flex-1">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const newValue = parseInt(e.target.value, 10);
              if (newValue && newValue > 0) {
                setQuantity(newValue);
              }
            }}
            className="w-20 text-center border rounded p-1 text-sm"
            onBlur={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!value || value < 1) {
                setQuantity(1);
              }
            }}
          />
          <button
            className={`p-1 ml-2 rounded-full ${isFoil ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity`}
            onClick={() => setIsFoil(!isFoil)}
            title="Foil"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 transition-colors"
        >
          Sauvegarder
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="flex-1 bg-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded hover:bg-gray-400 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
  const viewingContent = (
    <div className="mt-2 flex gap-2">
      <button
        onClick={() => setIsEditing(true)}
        className="flex-1 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
      >
        Modifier
      </button>
      <button
        onClick={handleDelete}
        className="flex-1 bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-700 transition-colors"
      >
        Supprimer
      </button>
    </div>
  );
  return (
    <CardItem
      card={card}
      className="hover:shadow-md"
      topLeftBadge={!isEditing && quantity > 1 && (
        <div className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
          x{quantity}
        </div>
      )}
      topRightBadge={!isEditing && isFoil && (
        <div className="p-1 rounded-full bg-purple-500 text-white shadow flex items-center justify-center">
          <Sparkles size={14} />
        </div>
      )}
    >
      {isEditing ? editingContent : viewingContent}
    </CardItem>
  );
}

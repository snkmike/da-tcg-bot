// CollectionCardItem.jsx
// Version spécialisée de CardItem pour l'affichage dans une collection
import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import CardItem from './CardItem';
import CardDetail from './CardDetail';

export default function CollectionCardItem({
  card,
  onUpdate,
  collectionId
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(card.quantity);
  const [isFoil, setIsFoil] = useState(card.isFoil);
  const [showDetail, setShowDetail] = useState(false);

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

  return (
    <>
      <div className="relative">
        <div className="cursor-pointer transition-all relative">
          <CardItem
            card={card}
            className="relative bg-white rounded-xl overflow-hidden hover:shadow-md transition-all"
            topLeftBadge={!isEditing && quantity > 1 && (
              <div className="absolute top-3 left-3 z-20">
                <div className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow">
                  x{quantity}
                </div>
              </div>
            )}
            topRightBadge={!isEditing && isFoil && (
              <div className="absolute top-2 right-3 z-20">
                <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded shadow-sm">
                  <Sparkles size={10} className="inline mr-1" />
                  Foil
                </span>
              </div>
            )}
          >
            {isEditing ? (
              <div className="mt-3 px-4 pb-4 space-y-3">
                <div className="flex items-center gap-3">
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
                      className="w-24 text-center bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                      onBlur={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!value || value < 1) {
                          setQuantity(1);
                        }
                      }}
                    />
                    <button
                      className={`p-2 ml-2 rounded-lg ${isFoil ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'} hover:opacity-90 transition-all flex items-center gap-1`}
                      onClick={() => setIsFoil(!isFoil)}
                      title="Foil"
                    >
                      <Sparkles size={16} />
                      Foil
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 px-4 pb-4 flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            )}
          </CardItem>

          {/* Bouton détail */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(true);
            }}
            className="absolute top-3 left-3 z-20 p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-sm transition-colors"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {showDetail && (
        <CardDetail
          card={card}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

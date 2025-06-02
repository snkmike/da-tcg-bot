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
  const [showPriceDetail, setShowPriceDetail] = useState(false);

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
  };  return (
    <>
      <div className="relative group">
        <CardItem
          card={card}
          className="relative bg-white rounded-xl overflow-hidden hover:shadow-md transition-all"
          onClick={(e) => {
            setShowPriceDetail(false); // Fermer l'encart prix si ouvert
          }}
          topLeftBadge={!isEditing && quantity > 1 && (
            <div className="absolute top-3 left-3 z-20">
              <div className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow">
                x{quantity}
              </div>
            </div>
          )}
          topRightBadge={!isEditing && isFoil && (
            <div className="absolute top-3 right-3 z-20">
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
            <>
              {/* Structure uniforme : [i] + Actions empilées en haut à gauche */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Bouton info principal */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail(true);
                  }}
                  className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-sm transition-colors"
                  title="Détails de la carte"
                >
                  <Info size={16} />
                </button>
                
                {/* Bouton modification */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-sm transition-colors"
                  title="Modifier"
                >
                  ✏️
                </button>
                
                {/* Bouton suppression */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>

              {/* Prix uniforme : toujours affiché au même endroit si disponible */}
              {(card.price > 0 || card.foil_price > 0) && (
                <div className="flex items-center gap-2 m-4 mt-0">
                  {/* Prix principal arrondi (normal ou foil selon la carte) */}
                  <div className={`${
                    isFoil ? 'bg-purple-600' : 'bg-green-600'
                  } text-white rounded-lg px-3 py-1.5 shadow-sm`}>
                    <div className="text-sm font-bold">
                      {isFoil ? 
                        (card.foil_price > 0 ? `${(Math.round(card.foil_price * 100) / 100).toFixed(2)}€` : `${(Math.round(card.price * 100) / 100).toFixed(2)}€`) :
                        `${(Math.round(card.price * 100) / 100).toFixed(2)}€`
                      }
                    </div>
                  </div>
                  
                  {/* Bouton info prix */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPriceDetail(!showPriceDetail);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-sm transition-colors"
                    title="Détails des prix"
                  >
                    <Info size={14} />
                  </button>
                </div>
              )}

              {/* Encart détaillé des prix */}
              {showPriceDetail && (card.price > 0 || card.foil_price > 0) && (
                <div className="absolute bottom-16 left-3 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-40 min-w-48">
                  <div className="text-xs text-gray-800 font-medium mb-2">💰 Détails Prix Collection</div>
                  <div className="space-y-1 text-xs">
                    {card.price > 0 && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Normal:</span>
                        <span className="font-medium">{card.price.toFixed(2)}€</span>
                      </div>
                    )}
                    {card.foil_price > 0 && (
                      <div className="flex justify-between gap-2">
                        <span className="text-purple-600">Foil:</span>
                        <span className="font-medium text-purple-600">{card.foil_price.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">
                      Quantité: {quantity}x
                      {isFoil && <div className="text-purple-600">Version Foil</div>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardItem>
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

// SearchItem.jsx
// Composant générique pour l'affichage des cartes avec sélection
// Généralisation de CardTraderSearchItem pour supporter différentes sources de données

import React, { useState } from 'react';
import { Check, Info, Sparkles, Zap, Star, Gem } from 'lucide-react';
import CardItem from '../cards/CardItem';
import CardDetail from '../cards/CardDetail';
import { convertBlueprintToCard } from '../../utils/cardTraderUtils';

// Fonction utilitaire pour extraire les traitements spéciaux des propriétés CardTrader
const extractSpecialTreatments = (card) => {
  const treatments = [];
  
  if (!card.editable_properties) return treatments;
  
  // Parcourir les propriétés éditables pour trouver les traitements spéciaux
  for (const property of card.editable_properties) {
    switch (property.name?.toLowerCase()) {
      case 'mtg_foil':
      case 'foil':
        if (property.possible_values?.includes(true)) {
          treatments.push({
            type: 'foil',
            name: 'Foil',
            icon: Sparkles,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            available: true
          });
        }
        break;
        
      case 'reverse':
      case 'reverse_foil':
        if (property.possible_values?.length > 1) {
          treatments.push({
            type: 'reverse',
            name: 'Reverse',
            icon: Zap,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            available: true
          });
        }
        break;
        
      case 'holo':
      case 'holographic':
        if (property.possible_values?.includes(true)) {
          treatments.push({
            type: 'holo',
            name: 'Holo',
            icon: Star,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            available: true
          });
        }
        break;
        
      case 'first_edition':
        if (property.possible_values?.includes(true)) {
          treatments.push({
            type: 'first_edition',
            name: '1st Ed',
            icon: Gem,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            available: true
          });
        }
        break;
        
      case 'signed':
        if (property.possible_values?.includes(true)) {
          treatments.push({
            type: 'signed',
            name: 'Signé',
            icon: '✍️',
            color: 'bg-green-500',
            textColor: 'text-green-600',
            available: true
          });
        }
        break;
        
      case 'altered':
        if (property.possible_values?.includes(true)) {
          treatments.push({
            type: 'altered',
            name: 'Altéré',
            icon: '🎨',
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            available: true
          });
        }
        break;
    }
  }
  
  return treatments;
};

// Fonction pour formater l'affichage des traitements spéciaux
const formatTreatmentBadge = (treatment, size = 'sm') => {
  const IconComponent = treatment.icon;
  const isString = typeof treatment.icon === 'string';
  
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5', 
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };
  
  return (
    <span 
      key={treatment.type}
      className={`${treatment.color} text-white rounded-full ${sizeClasses[size]} font-medium flex items-center gap-1 shadow-sm`}
      title={`${treatment.name} disponible`}
    >
      {isString ? (
        <span className="text-xs">{treatment.icon}</span>
      ) : (
        <IconComponent size={size === 'xs' ? 8 : size === 'sm' ? 10 : 12} />
      )}
      {size !== 'xs' && treatment.name}
    </span>
  );
};

export default function SearchItem({ 
  card, 
  expansion,
  isSelected = false, 
  onSelect, 
  updateQuantity, 
  selectedCollection,
  priceData = null,
  dataSource = 'cardtrader'
}) {
  const initialQuantity = isSelected ? card.quantity || 1 : 1;
  const [localQuantity, setLocalQuantity] = useState(initialQuantity);
  const [showDetail, setShowDetail] = useState(false);
  const [showPriceDetail, setShowPriceDetail] = useState(false);

  // Mettre à jour la quantité locale quand la carte change
  React.useEffect(() => {
    if (isSelected && card.quantity) {
      setLocalQuantity(card.quantity);
    } else if (!isSelected) {
      setLocalQuantity(1);
    }
  }, [isSelected, card.quantity]);

  const handleQuantityChange = (newQuantity) => {
    const val = parseInt(newQuantity, 10);
    if (val > 0) {
      setLocalQuantity(val);
      if (isSelected) {
        updateQuantity(card.id, val, card);
      }
    }
  };

  // Convertir la carte au format unifié selon la source
  const convertToUnifiedFormat = (card, dataSource) => {
    if (dataSource === 'cardtrader') {
      const fullName = card.name || 'Nom non disponible';
      let mainName = fullName;
      let subtitle = '';
      
      if (fullName.includes(' - ')) {
        const parts = fullName.split(' - ');
        mainName = parts[0];
        subtitle = parts.slice(1).join(' - ');
      }
      
      return {
        id: card.id,
        name: mainName,
        subtitle: subtitle,
        image: card.image_url,
        set_name: expansion?.name || 'Extension inconnue',
        collector_number: card.fixed_properties?.collector_number || card.id,
        rarity: card.fixed_properties?.lorcana_rarity || card.rarity || 'Non spécifiée',
        version: card.version,
        price: null, // CardTrader ne fournit pas de prix dans les blueprints
        isFoil: false,
        source: 'cardtrader'
      };
    } else if (dataSource === 'lorcana') {
      return {
        id: card.id,
        name: card.name,
        subtitle: card.subtitle || '',
        image: card.image,
        set_name: card.set_name,
        collector_number: card.collector_number,
        rarity: card.rarity,
        version: card.version || '',
        price: card.price,
        isFoil: card.isFoil || false,
        source: 'lorcana'
      };
    } else {
      // Format générique
      return {
        id: card.id,
        name: card.name,
        subtitle: card.subtitle || '',
        image: card.image || card.image_url,
        set_name: card.set_name || card.expansion?.name || 'Set inconnu',
        collector_number: card.collector_number || card.id,
        rarity: card.rarity || 'Non spécifiée',
        version: card.version || '',
        price: card.price,
        isFoil: card.isFoil || false,
        source: dataSource
      };
    }
  };

  const unifiedCard = convertToUnifiedFormat(card, dataSource);

  // Fonction pour convertir au format CardDetail selon la source
  const convertForDetail = () => {
    if (dataSource === 'cardtrader') {
      return convertBlueprintToCard(card, expansion);
    } else {
      return card; // Pour les autres sources, utiliser directement
    }
  };

  // Fonction pour formater le prix selon la source
  const formatPrice = () => {
    if (dataSource === 'cardtrader' && priceData) {
      return (Math.round(priceData.min * 1.1 * 100) / 100).toFixed(2) + '€';
    } else if (card.price) {
      return card.price + '€';
    }
    return null;
  };

  const getPriceColor = () => {
    if (dataSource === 'cardtrader') {
      return 'bg-green-600';
    } else if (dataSource === 'lorcana') {
      return 'bg-blue-600';
    } else {
      return 'bg-purple-600';
    }
  };

  const getSourceLabel = () => {
    switch (dataSource) {
      case 'cardtrader': return 'CardTrader';
      case 'lorcana': return 'Lorcana';
      case 'pokemon': return 'Pokémon';
      default: return dataSource;
    }
  };

  // Extraire les traitements spéciaux pour CardTrader
  const specialTreatments = dataSource === 'cardtrader' ? extractSpecialTreatments(card) : [];

  return (
    <>      
      <div 
        className={`relative cursor-pointer bg-white shadow-md rounded-xl overflow-hidden group ${
          isSelected ? 'ring-2 ring-blue-500 shadow-blue-100' : 'hover:ring-1 hover:ring-gray-200'
        }`}
        onClick={(e) => {
          setShowPriceDetail(false); // Fermer l'encart prix si ouvert
          onSelect(e);
        }}
      >
        <CardItem card={unifiedCard}>
          {/* Structure uniforme : [i] + Actions empilées en haut à gauche */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-30">
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
          </div>

          {/* Indicateur de sélection en haut à droite */}
          {isSelected && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1.5 shadow-md z-30">
              <Check size={14} />
            </div>
          )}

          {/* Badges de traitements spéciaux en haut à droite (si pas sélectionné) */}
          {!isSelected && specialTreatments.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
              {specialTreatments.slice(0, 3).map(treatment => formatTreatmentBadge(treatment, 'xs'))}
              {specialTreatments.length > 3 && (
                <span className="bg-gray-500 text-white rounded-full text-xs px-1.5 py-0.5 font-medium">
                  +{specialTreatments.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Traitements spéciaux détaillés en bas (toujours visibles) */}
          {specialTreatments.length > 0 && (
            <div className="absolute bottom-16 left-3 right-3 z-20">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600 font-medium mb-1">✨ Variantes disponibles</div>
                <div className="flex flex-wrap gap-1">
                  {specialTreatments.map(treatment => formatTreatmentBadge(treatment, 'xs'))}
                </div>
              </div>
            </div>
          )}

          {/* Prix uniforme : toujours affiché au même endroit si disponible */}
          {(priceData || card.price) && (
            <div className="flex items-center gap-2 m-4 mt-0">
              {/* Prix principal */}
              <div className={`${getPriceColor()} text-white rounded-lg px-3 py-1.5 shadow-sm`}>
                <div className="text-sm font-bold">
                  {formatPrice()}
                </div>
              </div>
              
              {/* Bouton info prix (seulement pour CardTrader avec détails) */}
              {dataSource === 'cardtrader' && priceData && (
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
              )}
            </div>
          )}

          {/* Options de quantité en bas à droite SEULEMENT si sélectionné */}
          {isSelected && (
            <div className="absolute bottom-3 right-3 bg-white shadow-lg rounded-lg p-2 z-20">
              <input
                type="number"
                min="1"
                value={localQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-16 text-center bg-gray-50 border border-gray-200 rounded-lg p-1 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                onClick={(e) => e.stopPropagation()}
                title="Quantité"
              />
            </div>
          )}

          {/* Encart détaillé des prix CardTrader */}
          {dataSource === 'cardtrader' && priceData && showPriceDetail && (
            <div className="absolute bottom-16 left-3 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-40 min-w-48">
              <div className="text-xs text-gray-800 font-medium mb-2">💰 Détails Prix Marché</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-medium">{priceData.min.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Moy:</span>
                  <span className="font-medium">{priceData.avg.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-medium">{priceData.max.toFixed(2)}€</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">
                  <div>{priceData.count} listing{priceData.count > 1 ? 's' : ''}</div>
                  {priceData.availableQuantity && (
                    <div>{priceData.availableQuantity} carte{priceData.availableQuantity > 1 ? 's' : ''} dispo</div>
                  )}
                  {priceData.sellers && (
                    <div>{priceData.sellers} vendeur{priceData.sellers > 1 ? 's' : ''}</div>
                  )}
                </div>
                <div className="text-xs text-blue-600 mt-2 border-t border-gray-200 pt-2">
                  Prix affiché: Min + 10%
                </div>
              </div>
            </div>
          )}
        </CardItem>
      </div>

      {/* Modal de détail */}
      {showDetail && (
        <CardDetail
          card={convertForDetail()}
          source={dataSource}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

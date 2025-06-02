// CreateListingModal.jsx - Modal pour créer un listing sur CardTrader
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';

export default function CreateListingModal({ 
  isOpen, 
  onClose, 
  selectedCards, 
  user,
  onListingsCreated
}) {  const [step, setStep] = useState(1); // 1: Sélection cartes, 2: Configuration prix, 3: Confirmation
  const [cardsToList, setCardsToList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logs, setLogs] = useState([]); // Logs en temps réel pour l'utilisateur
  const [showLogs, setShowLogs] = useState(false); // Affichage du panneau de logs
  const [expansionsCache, setExpansionsCache] = useState(null); // Cache des expansions
  const [blueprintsCache, setBlueprintsCache] = useState({}); // Cache des blueprints par expansion
  const [testMode, setTestMode] = useState(true); // Mode test/production

  // Configuration globale
  const [globalConfig, setGlobalConfig] = useState({
    condition: 'Near Mint',
    language: 'English',
    priceAdjustment: 0, // Pourcentage d'ajustement par rapport au prix marché
    description: ''
  });
  // États disponibles
  const conditions = ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];
  const languages = ['English', 'French', 'German', 'Spanish', 'Italian', 'Japanese'];

  // Fonction pour ajouter un log en temps réel
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };
  // Fonction pour nettoyer les logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Fonction pour réinitialiser la modal
  const resetModal = () => {
    setStep(1);
    setError('');
    setSuccess('');
    setLogs([]);
    setShowLogs(false);
    setExpansionsCache(null);
    setBlueprintsCache({});
  };

  // Réinitialiser la modal à l'ouverture
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedCards?.length > 0) {
      // Initialiser les cartes à lister avec les prix par défaut
      const initialCards = selectedCards.map(card => ({
        ...card,
        listingPrice: parseFloat(card.price || 0).toFixed(2),
        quantity: card.quantity || 1,
        condition: globalConfig.condition,
        language: globalConfig.language,
        selected: true
      }));
      setCardsToList(initialCards);
    }
  }, [isOpen, selectedCards, globalConfig.condition, globalConfig.language]);

  const handleCardToggle = (cardIndex) => {
    setCardsToList(prev => prev.map((card, index) => 
      index === cardIndex ? { ...card, selected: !card.selected } : card
    ));
  };

  const handleCardPriceChange = (cardIndex, newPrice) => {
    setCardsToList(prev => prev.map((card, index) => 
      index === cardIndex ? { ...card, listingPrice: newPrice } : card
    ));
  };

  const handleCardQuantityChange = (cardIndex, newQuantity) => {
    setCardsToList(prev => prev.map((card, index) => 
      index === cardIndex ? { ...card, quantity: Math.max(1, parseInt(newQuantity) || 1) } : card
    ));
  };

  const applyGlobalPriceAdjustment = () => {
    setCardsToList(prev => prev.map(card => {
      const basePrice = parseFloat(card.price || 0);
      const adjustedPrice = basePrice * (1 + globalConfig.priceAdjustment / 100);
      return { ...card, listingPrice: adjustedPrice.toFixed(2) };
    }));
  };

  const getTotalValue = () => {
    return cardsToList
      .filter(card => card.selected)
      .reduce((total, card) => total + (parseFloat(card.listingPrice) * card.quantity), 0)
      .toFixed(2);
  };

  const getSelectedCount = () => {
    return cardsToList.filter(card => card.selected).length;
  };  // Fonction pour rechercher le blueprint_id d'une carte avec cache
  const findBlueprintId = async (card) => {
    try {
      console.log(`🔍 Recherche blueprint pour: ${card.name} (${card.set_name})`);
      
      // Récupérer les expansions (utiliser le cache si disponible)
      let expansions = expansionsCache;
      if (!expansions) {
        console.log(`📡 Récupération des expansions...`);
        expansions = await cardTraderAPI.getExpansions();
        setExpansionsCache(expansions);
      }
      
      // Recherche de l'extension par nom ou code
      const expansion = expansions.find(exp => {
        const expName = exp.name?.toLowerCase() || '';
        const expCode = exp.code?.toLowerCase() || '';
        const cardSetName = card.set_name?.toLowerCase() || '';
        const cardSetCode = card.set_code?.toLowerCase() || '';
        
        return expName.includes(cardSetName) || 
               cardSetName.includes(expName) ||
               expCode === cardSetCode ||
               (expCode && cardSetCode && expCode.includes(cardSetCode));
      });
      
      if (!expansion) {
        throw new Error(`Extension non trouvée: ${card.set_name} (${card.set_code})`);
      }
      
      console.log(`📦 Extension trouvée: ${expansion.name} (ID: ${expansion.id})`);
      
      // Récupérer les blueprints (utiliser le cache si disponible)
      let blueprints = blueprintsCache[expansion.id];
      if (!blueprints) {
        console.log(`📡 Récupération des blueprints pour ${expansion.name}...`);
        blueprints = await cardTraderAPI.getBlueprints(expansion.id);
        setBlueprintsCache(prev => ({ ...prev, [expansion.id]: blueprints }));
      }
        // Recherche du blueprint par nom et numéro de collection
      let blueprint = blueprints.find(bp => {
        const bpName = bp.name?.toLowerCase() || '';
        const cardName = card.name?.toLowerCase() || '';
        const collectorMatch = bp.collector_number === card.collector_number;
        
        return bpName === cardName && collectorMatch;
      });
      
      if (!blueprint) {
        // Recherche alternative 1: Sans le numéro de collection (exact match)
        blueprint = blueprints.find(bp => {
          const bpName = bp.name?.toLowerCase() || '';
          const cardName = card.name?.toLowerCase() || '';
          return bpName === cardName;
        });
        
        if (blueprint) {
          console.log(`⚠️ Blueprint trouvé sans correspondance de numéro: ${blueprint.id}`);
        }
      }
      
      if (!blueprint) {
        // Recherche alternative 2: Recherche partielle (contient le nom)
        blueprint = blueprints.find(bp => {
          const bpName = bp.name?.toLowerCase() || '';
          const cardName = card.name?.toLowerCase() || '';
          return bpName.includes(cardName) || cardName.includes(bpName);
        });
        
        if (blueprint) {
          console.log(`⚠️ Blueprint trouvé par recherche partielle: ${blueprint.name} (ID: ${blueprint.id})`);
        }
      }
      
      if (!blueprint) {
        // Recherche alternative 3: Recherche fuzzy (similarité)
        const fuzzyBlueprint = blueprints.find(bp => {
          const bpName = bp.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
          const cardName = card.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
          return bpName === cardName;
        });
        
        if (fuzzyBlueprint) {
          console.log(`⚠️ Blueprint trouvé par recherche fuzzy: ${fuzzyBlueprint.name} (ID: ${fuzzyBlueprint.id})`);
          blueprint = fuzzyBlueprint;
        }
      }
      
      if (!blueprint) {
        
        throw new Error(`Blueprint non trouvé: ${card.name} #${card.collector_number} dans ${expansion.name}`);
      }
      
      console.log(`🎯 Blueprint trouvé: ${blueprint.name} (ID: ${blueprint.id})`);
      return blueprint.id;
      
    } catch (error) {
      console.error(`❌ Erreur recherche blueprint pour ${card.name}:`, error);
      throw error;
    }
  };

  // Fonction pour valider les données avant envoi
  const validateCardData = (card) => {
    const errors = [];
    
    if (!card.listingPrice || parseFloat(card.listingPrice) <= 0) {
      errors.push('Prix invalide');
    }
    
    if (!card.quantity || card.quantity < 1) {
      errors.push('Quantité invalide');
    }
    
    if (!card.condition) {
      errors.push('État non spécifié');
    }
    
    if (!card.language) {
      errors.push('Langue non spécifiée');
    }
    
    return errors;
  };

  // Fonction pour mapper les langues vers les codes CardTrader
  const mapLanguageToCode = (language) => {
    const languageMap = {
      'English': 'en',
      'French': 'fr', 
      'German': 'de',
      'Spanish': 'es',
      'Italian': 'it',
      'Japanese': 'jp'
    };
    return languageMap[language] || 'en';
  };
  const handleCreateListings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    clearLogs();
    setShowLogs(true);

    try {
      const selectedCards = cardsToList.filter(card => card.selected);
      
      if (selectedCards.length === 0) {
        throw new Error('Aucune carte sélectionnée');
      }

      addLog(`🚀 Début création de ${selectedCards.length} listing(s)`, 'info');
      console.log(`🚀 Début création de ${selectedCards.length} listing(s)`);
      
      const results = [];
      let processedCount = 0;
      
      for (const card of selectedCards) {
        processedCount++;
        const cardLog = `📋 [${processedCount}/${selectedCards.length}] ${card.name}`;
        addLog(cardLog, 'info');
        console.log(`\n${cardLog}`);
        
        try {
          // 1. Validation des données
          addLog(`⚡ Validation des données...`, 'info');
          const validationErrors = validateCardData(card);
          if (validationErrors.length > 0) {
            throw new Error(`Données invalides: ${validationErrors.join(', ')}`);
          }
          addLog(`✅ Validation réussie`, 'success');
            // 2. Recherche du blueprint_id
          let blueprintId = card.blueprint_id;
          if (!blueprintId) {
            addLog(`🔍 Recherche blueprint CardTrader...`, 'info');
            try {
              blueprintId = await findBlueprintId(card);
              addLog(`🎯 Blueprint trouvé: ${blueprintId}`, 'success');
            } catch (blueprintError) {
              if (testMode) {
                addLog(`⚠️ Blueprint non trouvé, utilisation ID temporaire pour test`, 'warning');
                console.log(`⚠️ Erreur blueprint pour ${card.name}:`, blueprintError.message);
                blueprintId = 999999; // ID temporaire pour test uniquement
              } else {
                addLog(`❌ Blueprint non trouvé - impossible de créer le listing`, 'error');
                console.error(`❌ Blueprint manquant pour ${card.name}:`, blueprintError.message);
                throw new Error(`Blueprint non trouvé pour ${card.name}: ${blueprintError.message}`);
              }
            }
          }
            // 3. Validation de l'ID blueprint pour mode production
          if (!testMode && (!blueprintId || blueprintId === 999999)) {
            throw new Error(`Blueprint invalide en mode production: ${blueprintId}. Impossible de créer le listing.`);
          }
          
          // 4. Préparation des données pour CardTrader
          const productData = {
            blueprint_id: blueprintId,
            price: parseFloat(card.listingPrice), // Prix en euros
            quantity: parseInt(card.quantity),
            user_data_field: `Collection: ${card.set_name} | Ref: ${card.collector_number}`,
            properties: {
              condition: card.condition,
              language: mapLanguageToCode(card.language),
              mtg_foil: card.foil || false,
              signed: false,
              altered: false
            }
          };
          
          if (globalConfig.description) {
            productData.description = globalConfig.description;
          }
          
          addLog(`📤 Préparation données API...`, 'info');
          console.log(`📤 Données préparées:`, productData);
          
          // 5. Création du listing sur CardTrader
          addLog(`🚀 Création listing CardTrader...`, 'info');
          
          let result;
          if (testMode) {
            // Mode test - simulation de l'appel API
            console.log(`🧪 MODE TEST - Simulation création listing`);
            result = {
              id: Math.floor(Math.random() * 1000000),
              price: { cents: Math.round(parseFloat(card.listingPrice) * 100), currency: 'EUR' },
              quantity: card.quantity,
              blueprint_id: blueprintId,
              properties: productData.properties,
              created_at: new Date().toISOString()
            };
            addLog(`🧪 Mode test - Listing simulé: ID ${result.id}`, 'info');
          } else {
            // Mode production - Appel API réel
            console.log(`🚀 MODE PRODUCTION - Création listing réelle`);
            result = await cardTraderAPI.createProduct(productData);
            addLog(`🎯 Mode production - Listing créé: ID ${result.id}`, 'success');
          }
          
          addLog(`✅ Listing créé: ID ${result.id}`, 'success');
          console.log(`✅ Listing créé (simulé):`, result);
          results.push({ 
            card: card.name, 
            success: true, 
            data: result,
            productData
          });
          
        } catch (cardError) {
          addLog(`❌ Erreur: ${cardError.message}`, 'error');
          console.error(`❌ Erreur pour ${card.name}:`, cardError);
          results.push({ 
            card: card.name, 
            success: false, 
            error: cardError.message 
          });
        }
      }

      // 5. Affichage des résultats
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      const summaryMessage = `📊 Terminé: ${successCount} succès, ${failCount} échecs`;
      addLog(summaryMessage, successCount > 0 ? 'success' : 'error');
      console.log(summaryMessage);
      
      if (successCount > 0) {
        setSuccess(`✅ ${successCount} listing(s) créé(s) avec succès${failCount > 0 ? ` (${failCount} échec(s))` : ''}`);
        if (onListingsCreated) onListingsCreated(results);
      }
      
      if (failCount > 0) {
        const failedCards = results.filter(r => !r.success).map(r => r.card).join(', ');
        setError(`❌ ${failCount} listing(s) ont échoué: ${failedCards}`);
      }

    } catch (error) {
      const errorMessage = `💥 Erreur générale: ${error.message}`;
      addLog(errorMessage, 'error');
      console.error(`💥 Erreur générale:`, error);
      setError(`Erreur lors de la création des listings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={24} />
              <div>
                <h2 className="text-xl font-bold">Créer des listings</h2>
                <p className="text-blue-100 text-sm">
                  Étape {step}/3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full ${
                  stepNum <= step ? 'bg-white' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sélectionnez les cartes à mettre en vente
                </h3>
                <p className="text-gray-600">
                  {getSelectedCount()} carte(s) sélectionnée(s) sur {cardsToList.length}
                </p>
              </div>

              {/* Configuration globale */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Configuration par défaut</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      État
                    </label>
                    <select
                      value={globalConfig.condition}
                      onChange={(e) => setGlobalConfig(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Langue
                    </label>
                    <select
                      value={globalConfig.language}
                      onChange={(e) => setGlobalConfig(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languages.map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ajustement prix (%)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={globalConfig.priceAdjustment}
                        onChange={(e) => setGlobalConfig(prev => ({ ...prev, priceAdjustment: parseFloat(e.target.value) || 0 }))}
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        step="0.1"
                      />
                      <button
                        type="button"
                        onClick={applyGlobalPriceAdjustment}
                        className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des cartes */}
              <div className="space-y-3">
                {cardsToList.map((card, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${
                      card.selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleCardToggle(index)}
                        className={`p-2 rounded-lg transition-colors ${
                          card.selected 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {card.selected ? <CheckCircle size={20} /> : <Eye size={20} />}
                      </button>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{card.name}</h4>
                          <p className="text-sm text-gray-600">{card.set_name}</p>
                          <p className="text-xs text-gray-500">#{card.collector_number}</p>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Prix unitaire</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={card.listingPrice}
                              onChange={(e) => handleCardPriceChange(index, e.target.value)}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              step="0.01"
                              min="0"
                              disabled={!card.selected}
                            />
                            <span className="text-sm text-gray-600">€</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                          <input
                            type="number"
                            value={card.quantity}
                            onChange={(e) => handleCardQuantityChange(index, e.target.value)}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            max={card.quantity || 1}
                            disabled={!card.selected}
                          />
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-bold text-gray-900">
                            {(parseFloat(card.listingPrice) * card.quantity).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuration des listings
                </h3>
                <p className="text-gray-600">
                  Configurez les paramètres pour vos {getSelectedCount()} carte(s)
                </p>
              </div>

              {/* Résumé */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-green-900">Résumé du listing</h4>
                    <p className="text-green-700">{getSelectedCount()} cartes sélectionnées</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">{getTotalValue()}€</p>
                    <p className="text-sm text-green-700">Valeur totale</p>
                  </div>
                </div>
              </div>

              {/* Description globale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={globalConfig.description}
                  onChange={(e) => setGlobalConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Description pour vos listings..."
                />
              </div>

              {/* Cartes sélectionnées */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cartes à lister</h4>
                <div className="space-y-2">
                  {cardsToList.filter(card => card.selected).map((card, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{card.name}</p>
                        <p className="text-sm text-gray-600">{card.set_name} • {card.condition} • {card.language}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{card.quantity} × {card.listingPrice}€</p>
                        <p className="text-sm text-gray-600">{(parseFloat(card.listingPrice) * card.quantity).toFixed(2)}€ total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmation
                </h3>
                <p className="text-gray-600">
                  Vérifiez vos paramètres avant de créer les listings
                </p>
              </div>

              {/* Messages d'erreur/succès */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-green-800">{success}</p>
                  </div>
                </div>
              )}

              {/* Résumé final */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Résumé final</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Cartes sélectionnées:</p>
                    <p className="text-blue-900">{getSelectedCount()}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Valeur totale:</p>
                    <p className="text-blue-900 font-bold">{getTotalValue()}€</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">État par défaut:</p>
                    <p className="text-blue-900">{globalConfig.condition}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Langue:</p>
                    <p className="text-blue-900">{globalConfig.language}</p>
                  </div>
                </div>
              </div>              {!success && (
                <div className={`border rounded-lg p-4 ${testMode ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`flex-shrink-0 mt-0.5 ${testMode ? 'text-blue-600' : 'text-red-600'}`} size={16} />
                      <div className={`text-sm ${testMode ? 'text-blue-800' : 'text-red-800'}`}>
                        <p className="font-medium mb-2">
                          {testMode ? '🧪 Mode Test - Validation CardTrader' : '🚀 Mode Production - API CardTrader'}
                        </p>
                        <div className="space-y-1">
                          <p>• <strong>Blueprint ID:</strong> Recherche automatique des cartes CardTrader</p>
                          <p>• <strong>Validation:</strong> Vérification des prix, quantités et propriétés</p>
                          <p>• <strong>Mapping:</strong> Conversion des langues et conditions</p>
                          <p>• <strong>Logs temps réel:</strong> Suivi du processus étape par étape</p>
                          {testMode ? (
                            <p className="mt-2 text-blue-700 italic">Mode simulation - Aucun listing ne sera créé réellement</p>
                          ) : (
                            <p className="mt-2 text-red-700 font-medium">⚠️ Mode production - Les listings seront créés sur CardTrader !</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestMode(!testMode)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        testMode 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {testMode ? 'Passer en Production' : 'Passer en Test'}
                    </button>
                  </div>
                </div>
              )}

              {/* Panneau de logs en temps réel */}
              {logs.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-700">Logs temps réel</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogs(!showLogs)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    >
                      {showLogs ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showLogs ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  
                  {showLogs && (
                    <div className="p-3 max-h-64 overflow-y-auto">
                      <div className="space-y-1 font-mono text-sm">
                        {logs.map((log, index) => (
                          <div
                            key={index}
                            className={`flex gap-2 ${
                              log.type === 'error' ? 'text-red-600' :
                              log.type === 'success' ? 'text-green-600' :
                              log.type === 'warning' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}
                          >
                            <span className="text-gray-400">[{log.timestamp}]</span>
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                      {logs.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={clearLogs}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Effacer les logs
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={16} />
            <span>Total: {getTotalValue()}€</span>
          </div>
          
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Précédent
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={getSelectedCount() === 0}
              >
                Suivant
              </button>            ) : (
              <button
                type="button"
                onClick={handleCreateListings}
                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2 ${
                  testMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={loading || getSelectedCount() === 0}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {testMode ? 'Test en cours...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    {testMode ? '🧪 Tester les listings' : '🚀 Créer les listings'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

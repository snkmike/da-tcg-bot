import React, { useState, useEffect } from 'react';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';
import { 
  Package, 
  List, 
  CreditCard, 
  TrendingUp, 
  Eye, 
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  DollarSign,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import CollectionList from '../collection/CollectionList';
import useCollectionData from '../collection/useCollectionData';
import CreateListingModal from './CreateListingModal';

export default function ListingsTab({ user }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour le modal de création de listing
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCardsForListing, setSelectedCardsForListing] = useState([]);
  
  // Collection data hook
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    cards,
    collectionStats,
    fetchCollections,
    fetchCardsForCollection,
    showToast,
    toast,
    loadingValues
  } = useCollectionData(user);

  // Load user's existing listings
  const loadUserProducts = async () => {
    setLoading(true);
    try {
      const products = await cardTraderAPI.getUserProducts();
      console.log('📦 User products received:', products);
      
      if (Array.isArray(products)) {
        setListings(products);
      } else {
        console.error('❌ Products data is not an array:', products);
        setListings([]);
      }
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Impossible de charger vos listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };
  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadUserProducts();
      fetchCollections();
    }
  }, [user]);

  // Handle collection selection for listing creation
  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    setActiveSection('collection-detail');
    console.log('📦 Collection sélectionnée pour listing:', collection);
  };

  // Navigation sections redesigned
  const sections = [
    { 
      id: 'overview', 
      name: 'Vue d\'ensemble', 
      icon: TrendingUp, 
      description: 'Tableau de bord de vos listings et performances'
    },
    { 
      id: 'collections', 
      name: 'Collections', 
      icon: Package, 
      description: 'Créer des listings à partir de vos collections',
      count: collections.length 
    },
    { 
      id: 'individual', 
      name: 'Cartes individuelles', 
      icon: CreditCard, 
      description: 'Listings de cartes à l\'unité',
      count: 0,
      comingSoon: true
    },
    { 
      id: 'lists', 
      name: 'Listes personnalisées', 
      icon: List, 
      description: 'Listings basés sur des listes de cartes',
      count: 0,
      comingSoon: true
    }
  ];

  // Statistics for overview
  const getOverviewStats = () => {
    const totalListings = listings.length;
    const totalValue = listings.reduce((sum, listing) => sum + (listing.price_cents / 100), 0);
    const activeCollections = collections.length;
    
    return {
      totalListings,
      totalValue: totalValue.toFixed(2),
      activeCollections,
      avgPrice: totalListings > 0 ? (totalValue / totalListings).toFixed(2) : '0.00'
    };
  };
  // Overview section component
  const renderOverviewSection = () => {
    const stats = getOverviewStats();
    
    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Listings actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalListings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Valeur totale</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalValue}€</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Collections</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCollections}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Prix moyen</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgPrice}€</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSection('collections')}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Package className="text-blue-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Vendre une collection</p>
                  <p className="text-sm text-gray-600">Créer un listing complet</p>
                </div>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
            </button>

            <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CreditCard className="text-gray-400" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-600">Carte individuelle</p>
                  <p className="text-sm text-gray-500">Bientôt disponible</p>
                </div>
              </div>
              <ArrowRight className="text-gray-300" size={20} />
            </button>

            <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <List className="text-gray-400" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-600">Liste personnalisée</p>
                  <p className="text-sm text-gray-500">Bientôt disponible</p>
                </div>
              </div>
              <ArrowRight className="text-gray-300" size={20} />
            </button>
          </div>
        </div>

        {/* Recent Listings */}
        {listings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Listings récents</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Voir tout
              </button>
            </div>
            
            <div className="space-y-4">
              {listings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">{listing.name_en}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Qté: {listing.quantity}</span>
                      <span>Prix: {(listing.price_cents / 100).toFixed(2)}€</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // Collections section component
  const renderCollectionsSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mes Collections</h2>
              <p className="text-gray-600 mt-1">
                Sélectionnez une collection pour créer un listing de vente
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {collections.length} collection{collections.length !== 1 ? 's' : ''} disponible{collections.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <CollectionList
            collections={collections}
            collectionStats={collectionStats}
            loadingValues={loadingValues}
            onSelectCollection={handleCollectionSelect}
            onRefresh={fetchCollections}
            onDeleteSuccess={fetchCollections}
            showToast={showToast}
            user={user}
          />
        </div>
      </div>
    );
  };
  // Collection detail section component
  const renderCollectionDetailSection = () => {
    if (!selectedCollection) return null;

    // Fonction pour sélectionner toutes les cartes
    const selectAllCards = () => {
      setSelectedCardsForListing([...cards]);
    };

    // Fonction pour désélectionner toutes les cartes
    const clearSelection = () => {
      setSelectedCardsForListing([]);
    };

    // Fonction pour basculer la sélection d'une carte
    const toggleCardSelection = (card) => {
      setSelectedCardsForListing(prev => {
        const isSelected = prev.some(c => c.card_printing_id === card.card_printing_id && c.isFoil === card.isFoil);
        if (isSelected) {
          return prev.filter(c => !(c.card_printing_id === card.card_printing_id && c.isFoil === card.isFoil));
        } else {
          return [...prev, card];
        }
      });
    };

    // Calculer les statistiques des cartes sélectionnées
    const selectedStats = {
      count: selectedCardsForListing.length,
      totalValue: selectedCardsForListing.reduce((sum, card) => sum + (parseFloat(card.price || 0) * (card.quantity || 1)), 0).toFixed(2),
      totalQuantity: selectedCardsForListing.reduce((sum, card) => sum + (card.quantity || 1), 0)
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Collection: {selectedCollection.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Sélectionnez les cartes à mettre en vente
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCollection(null);
                setActiveSection('collections');
                setSelectedCardsForListing([]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Retour aux collections
            </button>
          </div>
          
          {/* Statistiques de sélection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Sélection actuelle</h3>
                <div className="flex items-center gap-6 text-sm text-blue-700">
                  <span>{selectedStats.count} carte(s) sélectionnée(s)</span>
                  <span>{selectedStats.totalQuantity} unité(s) au total</span>
                  <span className="font-bold">{selectedStats.totalValue}€ de valeur</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors text-sm"
                  disabled={selectedStats.count === 0}
                >
                  Tout désélectionner
                </button>
                <button
                  onClick={selectAllCards}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  disabled={cards.length === 0}
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={() => {
                    if (selectedCardsForListing.length > 0) {
                      setShowCreateModal(true);
                    } else {
                      showToast('❌ Veuillez sélectionner au moins une carte');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  disabled={selectedStats.count === 0}
                >
                  <ShoppingCart size={16} />
                  Créer listing ({selectedStats.count})
                </button>
              </div>
            </div>
          </div>

          {/* Liste des cartes avec sélection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cartes de la collection ({cards.length})
              </h3>
              <div className="text-sm text-gray-600">
                Cliquez sur une carte pour la sélectionner
              </div>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune carte dans cette collection</h3>
                <p className="text-gray-600">Ajoutez des cartes à votre collection pour créer des listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cards.map((card, index) => {
                  const isSelected = selectedCardsForListing.some(c => 
                    c.card_printing_id === card.card_printing_id && c.isFoil === card.isFoil
                  );
                  
                  return (
                    <div
                      key={`${card.card_printing_id}-${card.isFoil}-${index}`}
                      onClick={() => toggleCardSelection(card)}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Indicateur de sélection */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 bg-green-600 text-white rounded-full">
                          <CheckCircle size={16} />
                        </div>
                      )}

                      {/* Image de la carte */}
                      {card.image && (
                        <div className="mb-3">
                          <img
                            src={card.image}
                            alt={card.name}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Informations de la carte */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {card.name}
                        </h4>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>{card.set_name}</p>
                          <p>#{card.collector_number}</p>
                          {card.isFoil && <p className="text-purple-600 font-medium">✨ Foil</p>}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-gray-600">Qté: </span>
                            <span className="font-medium">{card.quantity}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              {parseFloat(card.price || 0).toFixed(2)}€
                            </p>
                            <p className="text-xs text-gray-500">
                              {(parseFloat(card.price || 0) * card.quantity).toFixed(2)}€ total
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  // Coming soon section component
  const renderComingSoonSection = (sectionName, icon, description) => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-16">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {React.createElement(icon, { size: 32, className: "text-gray-400" })}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {sectionName}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">En développement</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏪 Mes Listings</h1>
          <p className="text-gray-600">
            Gérez vos annonces de vente et créez de nouveaux listings
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id || 
                  (activeSection === 'collection-detail' && section.id === 'collections');
                
                return (
                  <button
                    key={section.id}
                    onClick={() => !section.comingSoon && setActiveSection(section.id)}
                    disabled={section.comingSoon}
                    className={`
                      flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-colors relative
                      ${isActive 
                        ? 'border-blue-500 text-blue-600 bg-blue-50' 
                        : section.comingSoon
                          ? 'border-transparent text-gray-400 cursor-not-allowed'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{section.name}</span>
                    {section.count > 0 && (
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full font-medium
                        ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}
                      `}>
                        {section.count}
                      </span>
                    )}
                    {section.comingSoon && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                        Bientôt
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Section Description */}
          <div className="px-6 py-4 bg-gray-50">
            <p className="text-gray-600 text-sm">
              {activeSection === 'collection-detail' 
                ? 'Configuration du listing pour la collection sélectionnée'
                : sections.find(s => s.id === activeSection)?.description
              }
            </p>
          </div>
        </div>

        {/* Content Area */}
        {activeSection === 'overview' && renderOverviewSection()}
        {activeSection === 'collections' && renderCollectionsSection()}
        {activeSection === 'collection-detail' && renderCollectionDetailSection()}
        {activeSection === 'individual' && renderComingSoonSection(
          'Cartes individuelles', 
          CreditCard, 
          'Créez des listings pour vendre des cartes à l\'unité avec prix et conditions personnalisés.'
        )}
        {activeSection === 'lists' && renderComingSoonSection(
          'Listes personnalisées', 
          List, 
          'Organisez vos cartes en listes thématiques et créez des listings groupés.'        )}
      </div>

      {/* Modal de création de listing */}
      {showCreateModal && (
        <CreateListingModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCardsForListing([]);
          }}
          selectedCards={selectedCardsForListing}
          user={user}
          onListingsCreated={(createdListings) => {
            console.log('Listings créés:', createdListings);
            setShowCreateModal(false);
            setSelectedCardsForListing([]);
            // Recharger les listings existants
            loadUserProducts();
            // Retourner à la section overview
            setActiveSection('overview');
            showToast('Listings créés avec succès!', 'success');
          }}
        />
      )}
    </div>
  );
}

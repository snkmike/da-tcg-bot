import React, { useState, useEffect } from 'react';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';
import CreateListingModal from './CreateListingModal';
import CardTraderTest from './CardTraderTest';

export default function ListingsTab() {
  const [message, setMessage] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [expansions, setExpansions] = useState([]);  const [selectedGame, setSelectedGame] = useState('');
  const [selectedExpansion, setSelectedExpansion] = useState('');
  const [blueprints, setBlueprints] = useState([]);
  const [loadingBlueprints, setLoadingBlueprints] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);

  // Test connection to CardTrader API
  const handleTestConnection = async () => {
    setMessage('Test de connexion à l\'API CardTrader...');
    try {
      const appInfo = await cardTraderAPI.getAppInfo();
      setMessage(`✅ Connexion réussie ! App ID: ${appInfo.id}`);
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setMessage(`❌ Erreur de connexion : ${error.message}`);
    }
  };
  // Load games from CardTrader
  const loadGames = async () => {
    try {
      const gamesData = await cardTraderAPI.getGames();
      console.log('🎮 Games data received:', gamesData);
      
      // Ensure gamesData is an array
      if (Array.isArray(gamesData)) {
        setGames(gamesData);
      } else {
        console.error('❌ Games data is not an array:', gamesData);
        setError('Format de données incorrect pour les jeux');
        setGames([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des jeux:', error);
      setError('Impossible de charger les jeux');
      setGames([]);
    }
  };
  // Load expansions when game is selected
  const loadExpansions = async (gameId) => {
    try {
      const expansionsData = await cardTraderAPI.getExpansions();
      console.log('🔧 Expansions data received:', expansionsData);
      
      // Ensure expansionsData is an array
      if (Array.isArray(expansionsData)) {
        // Filter expansions by game_id
        const filteredExpansions = expansionsData.filter(exp => exp.game_id === parseInt(gameId));
        setExpansions(filteredExpansions);
      } else {
        console.error('❌ Expansions data is not an array:', expansionsData);
        setExpansions([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des extensions:', error);
      setExpansions([]);
    }
  };
  // Load blueprints when expansion is selected
  const loadBlueprints = async (expansionId) => {
    setLoadingBlueprints(true);
    try {
      const blueprintsData = await cardTraderAPI.getBlueprints(expansionId);
      console.log('🎴 Blueprints data received:', blueprintsData);
      
      // Ensure blueprintsData is an array
      if (Array.isArray(blueprintsData)) {
        setBlueprints(blueprintsData);
      } else {
        console.error('❌ Blueprints data is not an array:', blueprintsData);
        setBlueprints([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blueprints:', error);
      setBlueprints([]);
    } finally {
      setLoadingBlueprints(false);
    }
  };

  // Handle game selection
  const handleGameChange = (gameId) => {
    setSelectedGame(gameId);
    setSelectedExpansion('');
    setExpansions([]);
    setBlueprints([]);
    if (gameId) {
      loadExpansions(gameId);
    }
  };

  // Handle expansion selection
  const handleExpansionChange = (expansionId) => {
    setSelectedExpansion(expansionId);
    setBlueprints([]);
    if (expansionId) {
      loadBlueprints(expansionId);
    }
  };  // Load user's products (listings)
  const loadUserProducts = async () => {
    setLoading(true);
    try {
      const products = await cardTraderAPI.getUserProducts();
      console.log('📦 User products received:', products);
      
      // Ensure products is an array
      if (Array.isArray(products)) {
        setListings(products);
      } else {
        console.error('❌ Products data is not an array:', products);
        setListings([]);
      }
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Impossible de charger vos listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle listing deletion
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce listing ?')) {
      return;
    }
    
    try {
      await cardTraderAPI.deleteProduct(listingId);
      setMessage('✅ Listing supprimé avec succès !');
      loadUserProducts(); // Refresh listings
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage(`❌ Erreur lors de la suppression : ${error.message}`);
    }
  };

  // Handle listing editing
  const handleEditListing = (listing) => {
    // For now, we'll show the listing data in an alert
    // Later this could open an edit modal
    alert(`Édition du listing:\nNom: ${listing.name_en}\nQuantité: ${listing.quantity}\nPrix: ${listing.price_cents / 100} ${listing.price_currency}`);
  };
  useEffect(() => {
    loadGames();
    loadUserProducts();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Listings CardTrader</h1>
        
        {/* CardTrader API Test */}
        <CardTraderTest />
        
        {/* Connection Test Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test de Connexion API</h2>
          <button
            onClick={handleTestConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Tester la connexion CardTrader
          </button>
          {message && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>

        {/* Games and Expansions Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sélection de Jeu et Extension</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Games Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jeu</label>
              <select
                value={selectedGame}
                onChange={(e) => handleGameChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >                <option value="">Sélectionner un jeu...</option>
                {Array.isArray(games) && games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.display_name || game.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expansions Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extension</label>
              <select
                value={selectedExpansion}
                onChange={(e) => handleExpansionChange(e.target.value)}
                disabled={!selectedGame || expansions.length === 0}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >                <option value="">Sélectionner une extension...</option>
                {Array.isArray(expansions) && expansions.map((expansion) => (
                  <option key={expansion.id} value={expansion.id}>
                    {expansion.name} ({expansion.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blueprints Section */}
        {selectedExpansion && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Cartes Disponibles
              {loadingBlueprints && <span className="text-sm text-gray-500 ml-2">(Chargement...)</span>}
            </h2>
            
            {loadingBlueprints ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(blueprints) && blueprints.slice(0, 12).map((blueprint) => (
                  <div key={blueprint.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">{blueprint.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">ID: {blueprint.id}</p>
                    {blueprint.image_url && (
                      <img 
                        src={blueprint.image_url} 
                        alt={blueprint.name}
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}                    <button 
                      onClick={() => {
                        setSelectedBlueprint(blueprint);
                        setShowCreateModal(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                    >
                      Créer un Listing
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {blueprints.length > 12 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Affichage de 12 cartes sur {blueprints.length} disponibles
              </p>
            )}
          </div>
        )}

        {/* User Listings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes Listings Actuels</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun listing trouvé</p>
          ) : (            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(listings) && listings.map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{listing.name_en}</h3>
                  <p className="text-sm text-gray-600 mb-1">Quantité: {listing.quantity}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    Prix: {listing.price_cents / 100} {listing.price_currency}
                  </p>
                  {listing.description && (
                    <p className="text-sm text-gray-500 mb-2">{listing.description}</p>
                  )}                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditListing(listing)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDeleteListing(listing.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}        </div>

        {/* Create Listing Modal */}
        {showCreateModal && selectedBlueprint && (
          <CreateListingModal
            blueprint={selectedBlueprint}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedBlueprint(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setSelectedBlueprint(null);
              loadUserProducts(); // Refresh listings
            }}
          />
        )}
      </div>
    </div>
  );
}

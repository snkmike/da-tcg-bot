import React, { useState, useEffect } from 'react';

export default function ListingsTab() {
  const [message, setMessage] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTestPublish = async () => {
    console.log('📤 Tentative de publication de l\'annonce de test...');
    setMessage('Tentative de publication de l\'annonce de test...');
    try {
      const ebayAccessToken = localStorage.getItem('ebayAccessToken'); 
      console.log('🔑 Token d\'accès eBay récupéré:', ebayAccessToken ? 'Présent' : 'Absent');

      if (!ebayAccessToken) {
        const errorMsg = 'Token d\'accès eBay non trouvé. Veuillez vous connecter à eBay via l\'onglet "Mon Compte".';
        console.error('❌', errorMsg);
        setMessage(errorMsg);
        return;
      }

      console.log('📤 Envoi de la requête à /api/ebay/create-listing avec le payload suivant:');
      console.log({
        token: ebayAccessToken,
        item: {
          title: 'Carte de Test TCG - Ne Pas Enchérir',
          description: 'Ceci est une description de test pour une carte TCG.',
          price: 9.99,
          categoryId: '183454',
        },
      });

      const response = await fetch('/api/ebay/create-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: ebayAccessToken,
          item: {
            title: 'Carte de Test TCG - Ne Pas Enchérir',
            description: 'Ceci est une description de test pour une carte TCG.',
            price: 9.99,
            categoryId: '183454',
          },
        }),
      });

      console.log('📨 Réponse brute du serveur:', response);
      const result = await response.json();
      console.log('📦 Résultat JSON:', result);

      if (response.ok && result.success) {
        const successMsg = `✅ Annonce de test (simulation) : ${result.message}`;
        const listingUrl = `https://www.sandbox.ebay.com/itm/${result.listingId}`;
        console.log(successMsg);
        setMessage(`${successMsg}\nConsultez votre annonce ici : ${listingUrl}`);
      } else {
        const errorMsg = `⚠️ Échec de la publication de l'annonce de test : ${result.message || 'Erreur inconnue'}`;
        console.error('❌', errorMsg);
        setMessage(errorMsg);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la tentative de publication :', error);
      setMessage(`Erreur lors de la tentative de publication : ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const ebayAccessToken = localStorage.getItem('ebayAccessToken');
        if (!ebayAccessToken) {
          throw new Error('Token d\'accès eBay non trouvé. Veuillez vous connecter à eBay via l\'onglet "Mon Compte".');
        }

        const response = await fetch('/api/ebay/get-listings', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${ebayAccessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des annonces eBay.');
        }

        const data = await response.json();
        setListings(data.listings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Mes Annonces eBay</h2>
      <p className="mb-4">
        Cette section vous permettra de gérer vos annonces de cartes sur eBay.
      </p>
      <button
        onClick={handleTestPublish}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Tester la publication d'une annonce eBay
      </button>
      {message && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded">
          <p>{message}</p>
        </div>
      )}
      {loading && <p>Chargement des annonces...</p>}
      {error && <p className="text-red-500">Erreur : {error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg mb-2 truncate" title={listing.title}>{listing.title}</h3>
              <p className="text-gray-600 mb-2">Prix : {listing.price ? `${listing.price} ${listing.currency || 'USD'}` : 'Non spécifié'}</p>
              {listing.viewUrl && (
                <a
                  href={listing.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Voir l'annonce
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

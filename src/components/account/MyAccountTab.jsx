import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Ensure this environment variable is set in your .env file (e.g., VITE_EBAY_CLIENT_ID=YourEbayClientId)
const EBAY_CLIENT_ID = import.meta.env.VITE_EBAY_CLIENT_ID;
const EBAY_REDIRECT_URI = 'https://dev.tcgbot.local:3000/auth/callback'; // Must match eBay app config and backend
const EBAY_AUTH_URL = `https://auth.sandbox.ebay.com/oauth2/authorize?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(EBAY_REDIRECT_URI)}&scope=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory`;

function MyAccountTab() {
  const [ebayAccessToken, setEbayAccessToken] = useState(localStorage.getItem('ebayAccessToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authCode = params.get('code');
    const authError = params.get('error');

    if (authError) {
      setError(`eBay authorization failed: ${params.get('error_description') || authError}`);
      navigate('/my-account', { replace: true }); // Clear URL params
      return;
    }

    if (authCode && !ebayAccessToken && !isLoading) {
      setIsLoading(true);
      setError(null);
      console.log('Authorization code received:', authCode);

      fetch('/api/ebay/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode }),
      })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response from server', details: res.statusText }));
          throw new Error(errorData.error || `Server error: ${res.status}`, { cause: errorData });
        }
        return res.json();
      })
      .then((data) => {
        if (data.access_token) {
          console.log('Access token received:', data.access_token);
          localStorage.setItem('ebayAccessToken', data.access_token);
          setEbayAccessToken(data.access_token);
          // Optionally store refresh token, expiry, etc.
          // localStorage.setItem('ebayRefreshToken', data.refresh_token);
          // localStorage.setItem('ebayTokenExpiry', Date.now() + (data.expires_in * 1000));
        } else {
          throw new Error(data.error_description || data.error || 'Failed to retrieve access token');
        }
      })
      .catch((err) => {
        console.error('Token exchange error:', err);
        setError(`Failed to exchange authorization code for token: ${err.message}. ${err.cause?.details ? `Details: ${err.cause.details}` : ''}`);
        localStorage.removeItem('ebayAccessToken'); // Clear any stale token
      })
      .finally(() => {
        setIsLoading(false);
        navigate('/my-account', { replace: true }); // Clear URL params like ?code=...
      });
    }
  }, [location, navigate, ebayAccessToken, isLoading]);

  const handleEbayAuth = () => {
    if (!EBAY_CLIENT_ID) {
      setError("eBay Client ID is not configured. Please check your application setup.");
      return;
    }
    setIsLoading(true);
    setError(null);
    // Redirect to eBay authorization page
    window.location.href = EBAY_AUTH_URL;
  };

  const handleEbayLogout = () => {
    localStorage.removeItem('ebayAccessToken');
    // localStorage.removeItem('ebayRefreshToken');
    // localStorage.removeItem('ebayTokenExpiry');
    setEbayAccessToken(null);
    setError(null);
    console.log('Logged out from eBay integration');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">My Account</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-medium mb-3">eBay Integration</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {isLoading && <p>Loading eBay authorization...</p>}
        {!ebayAccessToken && !isLoading && (
          <div>
            <p className="mb-4">Connect your eBay account to list cards and manage your sales.</p>
            <button
              onClick={handleEbayAuth}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={!EBAY_CLIENT_ID}
            >
              Authorize with eBay
            </button>
            {!EBAY_CLIENT_ID && <p className="text-xs text-red-500 mt-1">eBay integration is not configured.</p>}
          </div>
        )}
        {ebayAccessToken && !isLoading && (
          <div>
            <p className="text-green-600 font-semibold mb-4">Successfully connected to eBay!</p>
            <button
              onClick={handleEbayLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Logout from eBay
            </button>
            {/* You can add more eBay related info or actions here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAccountTab;

import React, { useEffect, useState } from 'react';
import { cardTraderAPI } from '../../utils/api/cardTraderAPI';

export default function CardTraderTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Starting CardTrader API test...');
        const appInfo = await cardTraderAPI.getAppInfo();
        console.log('✅ CardTrader API test successful:', appInfo);
        setStatus(`✅ Connected! App: ${appInfo.name} (ID: ${appInfo.id})`);
      } catch (err) {
        console.error('❌ CardTrader API test failed:', err);
        setError(err.message);
        setStatus('❌ Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 mb-4">
      <h3 className="font-bold text-lg mb-2">CardTrader API Test</h3>
      <p className="mb-2">{status}</p>
      {error && (
        <div className="text-red-600 text-sm">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
}

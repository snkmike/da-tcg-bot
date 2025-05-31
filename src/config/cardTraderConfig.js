// CardTrader API Configuration
// This file centralizes the CardTrader API configuration

// Try multiple sources for the API token
const getCardTraderToken = () => {
  // Debug all possible environment variable sources
  console.log('🔍 Checking all environment sources:');
  console.log('  process.env keys:', Object.keys(process.env).filter(k => k.includes('CARDTRADER')));
  console.log('  import.meta.env keys:', import.meta.env ? Object.keys(import.meta.env).filter(k => k.includes('CARDTRADER')) : 'undefined');
  
  // Try different environment variable patterns
  const token = 
    process.env.REACT_APP_CARDTRADER_API_TOKEN ||
    import.meta.env?.VITE_CARDTRADER_API_TOKEN ||
    import.meta.env?.REACT_APP_CARDTRADER_API_TOKEN ||
    // Fallback to hardcoded token for development (NOT recommended for production)
    'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJjYXJkdHJhZGVyLXByb2R1Y3Rpb24iLCJzdWIiOiJhcHA6MTUxNjgiLCJhdWQiOiJhcHA6MTUxNjgiLCJleHAiOjQ5MDQzNDU4NzMsImp0aSI6IjQ4ZjU3ZjVjLWRkYzItNGZhMS04NTlmLTA2YjBiNjgxZWNiYSIsImlhdCI6MTc0ODY3MjI3MywibmFtZSI6IlNuZWFrcnNtaWtlIEFwcCAyMDI1MDUwODA4NDA0NCJ9.GjTkfihedKQ0Wr5HCNv_FMmgI9cmSg0ecHj_9dQ__RegRRH1SK3x14Nxt09qeyUTVprDbSEIGjjhKQ9f5FWdR25IA0YodLsb-guARhl5D6BdsS5J_0xqHC40_tfo69Q0gvUqyWmw7fKPwtUpzil3G_9oENRJkzxG7PcLLfEEFyrRkyZlsWm60r2hLh3mJoEupCICZyKbtJZaPha0JH9AM8bJ3daiXUez8YU7gw2WWFLI7xOfzcvNgtS_tcwr0XYZGHbfxd6PEC7NH4FOo65kQea5JVN6yYGfNePQ6BIfOcbPwP-DOTIVT3tRpTfXj28j3aruFGJcIMjBoeNgcppDWQ';
  
  console.log('🎯 Selected token source:', token ? (token.length > 20 ? `[${token.substring(0, 20)}...]` : '[SHORT_TOKEN]') : '[NO_TOKEN]');
  
  return token;
};

export const cardTraderConfig = {
  apiToken: getCardTraderToken(),
  baseURL: 'https://api.cardtrader.com/api/v2'
};

export default cardTraderConfig;

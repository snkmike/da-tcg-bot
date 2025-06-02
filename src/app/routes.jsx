import React from 'react';
import DashboardTab from '../components/dashboard/DashboardTab';
import MyCollectionTab from '../components/collection/MyCollectionTab';
import MyAccountTab from '../components/account/MyAccountTab';
import ListingsTab from '../components/listings/ListingsTab'; // Import ListingsTab
import SearchTab from '../components/search/SearchTab'; // Import unified Search

export function renderContent(activeTab, state, location) { 
  const {
    handleAddCardsToPortfolio,
    userPortfolio,
    user
  } = state;
  // Handle specific routes first
  if (location && (location.pathname === '/mon-compte' || location.pathname === '/auth/callback')) {
    return <MyAccountTab />;
  }
  switch (activeTab) {
    case 'ma-collection': // French
      return <MyCollectionTab user={user} />;    case 'tableau-de-bord': // French
      return <DashboardTab portfolio={userPortfolio} />;
    case 'listings': // Add case for ListingsTab
      return <ListingsTab {...state} />;    case 'recherche': // Add case for Search (formerly CardTrader Search)
      return <SearchTab handleAddCardsToPortfolio={handleAddCardsToPortfolio} />;
    case 'mon-compte': // French (already handled by path check, but good for consistency)
      return <MyAccountTab />;    default:
      if (location && location.pathname === '/') {
        return <DashboardTab portfolio={userPortfolio} />;
      }
      return null;
  }
}

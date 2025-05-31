import React from 'react';
import SearchTab from '../components/search/SearchTab';
import DashboardTab from '../components/dashboard/DashboardTab';
import MyCollectionTab from '../components/collection/MyCollectionTab';
import LorcanaResults from '../components/cards/LorcanaResults';
import MyAccountTab from '../components/account/MyAccountTab';
import ListingsTab from '../components/listings/ListingsTab'; // Import ListingsTab

export function renderContent(activeTab, state, location) { 
  const {
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    filterGame, setFilterGame,
    filterSet, setFilterSet,
    selectedCard, setSelectedCard,
    showSetResults, setShowSetResults,
    setMinPrice, setMaxPrice,
    availableSets,
    handleAddCardsToPortfolio,
    selectedRarities, setSelectedRarities,
    mockCards,
    userPortfolio,
    user,
    filterKey
  } = state;

  const LorcanaComponentWrapper = (props) => (
    <LorcanaResults
      {...props}
      handleAddCardsToPortfolio={handleAddCardsToPortfolio}
    />
  );

  // Handle specific routes first
  if (location && (location.pathname === '/mon-compte' || location.pathname === '/auth/callback')) {
    return <MyAccountTab />;
  }

  switch (activeTab) {
    case 'recherche': // French
      return (
        <SearchTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          filterGame={filterGame}
          setFilterGame={setFilterGame}
          filterSet={filterSet}
          setFilterSet={setFilterSet}
          setSelectedCard={setSelectedCard}
          showSetResults={showSetResults}
          setShowSetResults={setShowSetResults}
          mockSets={[]}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          LorcanaComponent={filterGame === 'Lorcana' ? LorcanaComponentWrapper : null}
          availableSets={availableSets}
          handleAddCardsToPortfolio={handleAddCardsToPortfolio}
          selectedRarities={selectedRarities}
          setSelectedRarities={setSelectedRarities}
          filterKey={filterKey}
        />
      );
    case 'ma-collection': // French
      return <MyCollectionTab user={user} />;    case 'tableau-de-bord': // French
      return <DashboardTab portfolio={userPortfolio} />;
    case 'listings': // Add case for ListingsTab
      return <ListingsTab {...state} />;
    case 'mon-compte': // French (already handled by path check, but good for consistency)
      return <MyAccountTab />;
    default:
      if (location && location.pathname === '/') {
        return (
          <SearchTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            filterGame={filterGame}
            setFilterGame={setFilterGame}
            filterSet={filterSet}
            setFilterSet={setFilterSet}
            setSelectedCard={setSelectedCard}
            showSetResults={showSetResults}
            setShowSetResults={setShowSetResults}
            mockSets={[]}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            LorcanaComponent={filterGame === 'Lorcana' ? LorcanaComponentWrapper : null}
            availableSets={availableSets}
            handleAddCardsToPortfolio={handleAddCardsToPortfolio}
            selectedRarities={selectedRarities}
            setSelectedRarities={setSelectedRarities}
            filterKey={filterKey}
          />
        );
      }
      return null;
  }
}

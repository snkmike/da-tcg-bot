import React from 'react';
import SearchTab from '../components/search/SearchTab';
import PriceTab from '../components/price/PriceTab';
import AlertsTab from '../components/alerts/AlertsTab';
import TagsTab from '../components/tags/TagsTab';
import DashboardTab from '../components/dashboard/DashboardTab';
import MyCollectionTab from '../components/collection/MyCollectionTab';
import LorcanaResults from '../components/cards/LorcanaResults';

export function renderContent(activeTab, state) {
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

  switch (activeTab) {
    case 'search':
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
    case 'price':
      return <PriceTab selectedCard={selectedCard || searchResults[0] || mockCards[0]} />;
    case 'collection':
      return <MyCollectionTab user={user} />;
    case 'alerts':
      return <AlertsTab />;
    case 'tags':
      return <TagsTab cards={mockCards} />;
    case 'dashboard':
      return <DashboardTab portfolio={userPortfolio} />;
    default:
      return null;
  }
}

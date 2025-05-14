# DA TCG Bot Context


## Project Overview
A React web application for managing Trading Card Game (TCG) collections, with a focus on Disney Lorcana cards.

## Development Status Indicators
🟩 - Current Development (Lorcana features)
🟨 - In Progress
🟥 - Future Development
⬛ - Completed

## Key Features

### Search Page
- Game selection:
  - Multiple TCG support (🟥)
  - Enhanced features for Lorcana (🟩)

- Lorcana specific dual search mode:
  - Name search with live results and debounce (⬛)
  - Number search with format "1,2F,3" (F for foil variants) (⬛)
  - Auto-switching between modes (⬛)
- Advanced filtering:
  - By game (focused on Lorcana) (⬛)
  - By set with visual selection (⬛)
  - By rarity with multi-select (⬛)
  - By price range (⬛)
- Sort options:
  - Alphabetical (⬛)
  - By number (⬛)
  - By price (⬛)
- Duplicate detection system:
  - Detection for number search (⬛)
  - Separate tracking for foil variants (🟩)
- Visual features:
  - Foil effect on cards (⬛)
  - Loading states (⬛)
  - Error handling (⬛)
- Multi-selection capabilities:
  - Single click (⬛)
  - Ctrl+click for multiple (⬛)
  - Shift+click for range (⬛)

### Collection Management (🟨)
- Collection organization:
  - Multiple collections support (⬛)
  - Quick add to collection (⬛)
  - Quantity management (🟨)
  - Foil/non-foil tracking (🟨)
- Collection view:
  - Grid layout with card images (⬛)
  - List view with details (⬛)
  - Collection statistics (🟨)
- Import/Export:
  - CSV import (🟥)
  - CSV export (🟥)
  - Backup/Restore (🟥)

### Card Details (⬛)
- Comprehensive card information:
  - Name and number (⬛)
  - Set information (⬛)
  - Rarity indicator (⬛)
  - Price data (⬛)
  - Foil/non-foil variants (⬛)
  - Card image display (⬛)
  - Card details tooltip (🟥)
  - Price history visualization:
    - Interactive chart with normal/foil prices (⬛)
    - Time period filtering (⬛)
    - Price trend analysis (🟨)

### Set Results (🟨)
- Set management:
  - Group cards by set (⬛)
  - Set statistics display (🟨)
  - Set completion tracking (🟨)
- Price analytics:
  - Average price tracking (🟥)
  - Price history graphs (🟥)
  - Market trends (🟥)
- Performance features:
  - Set value calculation (🟥)
  - Top cards identification (🟥)
  - Investment opportunities (🟥)

## Technical Stack
- React 
- Tailwind CSS
- React Select
- API integration with lorcast.com

## Code Organization

### Root Structure
- `src/` - Source code root
- `public/` - Static assets and manifest files
- `server/` - Backend services and proxies
- `db/` - Database migrations and schemas
- Configuration Files
  - `tailwind.config.js` - Tailwind CSS configuration
  - `postcss.config.js` - PostCSS configuration
  - `package.json` - Project dependencies and scripts
  - `justtcg-proxy.mjs` - JustTCG API proxy service

### Frontend Organization (`/src`)

#### App Core (`/src/app`)
- 🏰 `App.jsx` - Main application component with Lorcana routing
- 🏰 `routes.jsx` - Application routing with Lorcana specific routes
- 🏰 `tabsState.js` - Tab management for Lorcana interfaces
- 🏰 `useAppState.js` - Global application state including Lorcana

#### Components (`/src/components`)
- `/alerts`
  - `AlertsTab.jsx` - Price alerts management UI
- `/auth`
  - `Auth.jsx` - Authentication components
- `/cards`
  - `CardGroup.jsx` - Groups of cards display
  - `CardItem.jsx` - Individual card display
  - `CardResult.jsx` - Search results container
  - `CardSearchResult.jsx` - Individual search result
  - `CollectionCardItem.jsx` - Collection-specific card display
  - 🏰 `LorcanaResults.jsx` - Lorcana-specific results handling
  - `SearchCardItem.jsx` - Search-specific card display
  - `SetResult.jsx` - Set results container
  - `SetSearchResult.jsx` - Individual set result
- `/collection`
  - `CollectionDetails.jsx` - Collection detail view
  - `CollectionList.jsx` - Collections list view
  - `ModalImportCollection.jsx` - Import interface
  - `MyCollectionTab.jsx` - Collection management tab
  - `groupCards.js` - Card grouping utilities
  - `useCardSelection.js` - Card selection hook
  - `useCollectionData.js` - Collection data management
- `/common`
  - `CollectionSelector.jsx` - Collection picker component
  - `Toast.jsx` - Notification system
- `/dashboard`
  - `DashboardTab.jsx` - Main dashboard view
- `/price`
  - `PriceTab.jsx` - Price tracking interface
- `/search`
  - 🏰 `SearchBox.jsx` - Main search interface with Lorcana features
  - 🏰 `SearchFilters.jsx` - Search filtering options for Lorcana
  - 🏰 `SearchTab.jsx` - Search container and logic for Lorcana
- `/tags`
  - `TagsTab.jsx` - Tag management system
- `/ui`
  - `TabButton.jsx` - Reusable tab component

#### Utilities and Services
- `/utils`
  - `/api`
    - 🏰 `fetchLorcanaData.js` - Lorcana API integration
  - 🏰 `lorcanaCardUtils.js` - Card data manipulation (appears in both /utils and /src/utils)
  - `fetchJustTCGPrices.js` - Price fetching utilities
  - `importCollection.js` - Collection import logic

#### Data Management
- `/data`
  - `mockCards.js` - Test data for cards
  - `mockSets.js` - Test data for sets
- `/hooks`
  - 🏰 `useLorcanaCollections.js` - Collection management hook

### Backend Organization
- `/server`
  - 🏰 `lorcast-proxy.mjs` - Proxy for Lorcast API
  - 🏰 `updatePricesDaily.js` - Price update service for Lorcana

### Database
- `/db`
  - `BasedeDonnee.csv` - Database backup
  - `/migrations` - SQL migration files
    - Table modifications
    - Schema updates
    - Data structure changes

## Key Functionalities
- Card search supports both name and number searches
- Number search format: "1,2,3F" (F suffix for foil versions)
- Duplicate detection handles normal and foil versions separately
- Card selection supports single, multi (Ctrl) and range (Shift) selection

## Conventions
- Component names use PascalCase
- Utility functions use camelCase
- CSS uses Tailwind classes
- State management uses React hooks
// CardTrader API Service
import { cardTraderConfig } from '../../config/cardTraderConfig.js';

// Use local proxy instead of direct API calls to avoid CORS issues
const BASE_URL = 'http://localhost:8021/cardtrader';
const API_TOKEN = cardTraderConfig.apiToken;

class CardTraderAPI {  constructor() {
    this.baseURL = BASE_URL;
    this.token = API_TOKEN;
    
    if (!this.token) {
      console.warn('⚠️ CardTrader API token not found in environment variables');
    }
  }  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error:`, error);
      throw error;
    }
  }  // Test the API connection
  async getAppInfo() {
    return this.makeRequest('/info');
  }

  // Get all games
  async getGames() {
    return this.makeRequest('/games');
  }

  // Get all expansions
  async getExpansions() {
    return this.makeRequest('/expansions');
  }

  // Get all categories (optional: filter by game_id)
  async getCategories(gameId = null) {
    const endpoint = gameId ? `/categories?game_id=${gameId}` : '/categories';
    return this.makeRequest(endpoint);
  }  // Get blueprints for a specific expansion
  async getBlueprints(expansionId) {
    return this.makeRequest(`/blueprints/export?expansion_id=${expansionId}`);
  }// Get user's products (listings)
  async getUserProducts(expansionId = null, blueprintId = null) {
    return this.makeRequest('/products/export');
  }

  // Create a new product listing
  async createProduct(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  // Update an existing product
  async updateProduct(productId, productData) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  }

  // Delete a product
  async deleteProduct(productId) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
  }

  // Search marketplace products
  async searchMarketplaceProducts(params) {
    const queryParams = new URLSearchParams(params).toString();
    return this.makeRequest(`/marketplace/products?${queryParams}`);
  }

  // Get cart status
  async getCart() {
    return this.makeRequest('/cart');
  }

  // Add product to cart
  async addToCart(productData) {
    return this.makeRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  // Remove product from cart
  async removeFromCart(productData) {
    return this.makeRequest('/cart/remove', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  // Purchase cart
  async purchaseCart() {
    return this.makeRequest('/cart/purchase', {
      method: 'POST'
    });
  }
}

export const cardTraderAPI = new CardTraderAPI();

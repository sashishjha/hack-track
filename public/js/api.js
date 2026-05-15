/**
 * API Communication Module
 * Handles all requests to the backend
 */

const API = {
  BASE_URL: 'http://localhost:5000/api',

  /**
   * Get all hackathons
   */
  async getHackathons(filter = 'all', search = '', limit = 100, page = 1) {
    try {
      const params = new URLSearchParams({ filter, search, limit, page });
      const url = `${this.BASE_URL}/hackathons?${params}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      return { success: false, error: err.message, data: [] };
    }
  },

  /**
   * Get single hackathon details
   */
  async getHackathon(id) {
    try {
      const response = await fetch(`${this.BASE_URL}/hackathons/${id}`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (err) {
      console.error('Error fetching hackathon:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Refresh/Update hackathon data from sources
   */
  async refreshData() {
    try {
      console.log('🔄 Refreshing data...');
      const response = await fetch(`${this.BASE_URL}/hackathons/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      console.log('✅ Data refreshed:', result);
      return result;
    } catch (err) {
      console.error('Error refreshing data:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Add new hackathon
   */
  async addHackathon(hackathonData) {
    try {
      const response = await fetch(`${this.BASE_URL}/hackathons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathon: hackathonData })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (err) {
      console.error('Error adding hackathon:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete hackathon
   */
  async deleteHackathon(id) {
    try {
      const response = await fetch(`${this.BASE_URL}/hackathons/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (err) {
      console.error('Error deleting hackathon:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.BASE_URL.replace('/api', '')}/api/health`);
      return await response.json();
    } catch (err) {
      console.error('Backend unavailable:', err);
      return { status: 'error' };
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}

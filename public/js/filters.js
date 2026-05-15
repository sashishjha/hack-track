/**
 * Filter and search functionality
 * Legacy support for original filter logic
 */

// This file provides additional filter utilities
// Most logic is now handled by main.js and API calls

const FilterUtils = {
  /**
   * Filter hackathons by category
   */
  filterByCategory(hackathons, category) {
    if (category === 'all') return hackathons;
    return hackathons.filter(h => h.category === category);
  },

  /**
   * Filter hackathons by search query
   */
  filterBySearch(hackathons, query) {
    if (!query) return hackathons;
    
    const q = query.toLowerCase();
    return hackathons.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.platform.toLowerCase().includes(q) ||
      (h.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  },

  /**
   * Filter by deadline (upcoming)
   */
  filterUpcoming(hackathons) {
    const now = new Date();
    return hackathons.filter(h => {
      if (!h.deadline) return true;
      return new Date(h.deadline) > now;
    });
  },

  /**
   * Filter by deadline (closed)
   */
  filterClosed(hackathons) {
    const now = new Date();
    return hackathons.filter(h => {
      if (!h.deadline) return false;
      return new Date(h.deadline) < now;
    });
  },

  /**
   * Filter by remote participation
   */
  filterRemote(hackathons) {
    return hackathons.filter(h => h.remote === true);
  },

  /**
   * Filter by prize range
   */
  filterByPrizeRange(hackathons, minPrize, maxPrize) {
    return hackathons.filter(h => {
      const prize = parseInt(h.prizeRange) || 0;
      return prize >= minPrize && prize <= maxPrize;
    });
  },

  /**
   * Sort hackathons by field
   */
  sortBy(hackathons, field, order = 'asc') {
    const sorted = [...hackathons];
    const isAsc = order === 'asc';

    return sorted.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterUtils;
}

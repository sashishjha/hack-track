/**
 * Main application logic
 * Handles UI interactions and data rendering
 */

class HackTracker {
  constructor() {
    this.hackathons = [];
    this.filtered = [];
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.init();
  }

  /**
   * Initialize the app
   */
  async init() {
    console.log('🚀 Initializing HackTracker...');
    
    // Check backend health
    const health = await API.healthCheck();
    if (health.status !== 'ok') {
      console.warn('⚠️ Backend not responding - using local data only');
    }

    // Load initial data
    await this.loadHackathons();
    this.setupEventListeners();
    console.log('✅ App initialized');
  }

  /**
   * Load hackathons from backend
   */
  async loadHackathons(filter = 'all', search = '') {
    try {
      const result = await API.getHackathons(filter, search);
      
      if (result.success) {
        this.hackathons = result.data || [];
        this.filtered = this.hackathons;
        this.updateUI();
        this.updateStats();
        return true;
      } else {
        console.error('Error loading hackathons:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error in loadHackathons:', err);
      return false;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns?.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e.target.dataset.filter));
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));

    // Update button (if exists)
    const updateBtn = document.getElementById('updateBtn');
    updateBtn?.addEventListener('click', () => this.handleUpdate());
  }

  /**
   * Handle filter changes
   */
  async handleFilter(filter) {
    console.log('Filtering by:', filter);
    this.currentFilter = filter;

    // Update button states
    document.querySelectorAll('.filter-btn')?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // Load filtered data
    await this.loadHackathons(filter, this.currentSearch);
  }

  /**
   * Handle search
   */
  async handleSearch(query) {
    console.log('Searching for:', query);
    this.currentSearch = query;

    if (query.length === 0) {
      await this.loadHackathons(this.currentFilter);
    } else {
      await this.loadHackathons('all', query);
    }
  }

  /**
   * Handle data refresh
   */
  async handleUpdate() {
    console.log('🔄 Updating hackathon data...');
    const updateBtn = document.getElementById('updateBtn');
    
    if (updateBtn) {
      updateBtn.disabled = true;
      updateBtn.textContent = 'Updating...';
    }

    const result = await API.refreshData();

    if (updateBtn) {
      updateBtn.disabled = false;
      updateBtn.textContent = '🔄 Update';
    }

    // Reload data
    await this.loadHackathons(this.currentFilter, this.currentSearch);
    
    // Show toast notification
    this.showNotification('✅ Data updated successfully!');
  }

  /**
   * Update UI with hackathons
   */
  updateUI() {
    const container = document.querySelector('.cards-grid');
    if (!container) return;

    if (this.hackathons.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">No hackathons found</p>';
      return;
    }

    container.innerHTML = this.hackathons.map(h => this.createCard(h)).join('');
  }

  /**
   * Create hackathon card HTML
   */
  createCard(hackathon) {
    const deadline = hackathon.deadline ? new Date(hackathon.deadline).toLocaleDateString() : 'N/A';
    const tags = (hackathon.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

    return `
      <div class="card" data-cat="${hackathon.category}" data-id="${hackathon.id}">
        <div class="card-top">
          <div class="card-badges">
            <span class="badge badge-${hackathon.category}">${hackathon.category}</span>
            <span class="badge badge-ai">${hackathon.aiAllowed ? '✅ AI Allowed' : '❌ No AI'}</span>
            ${hackathon.remote ? '<span class="badge badge-open">Remote</span>' : ''}
          </div>
        </div>
        <div>
          <div class="card-title">
            <a href="${hackathon.url}" target="_blank">${hackathon.name}</a>
          </div>
          <div class="card-org">${hackathon.platform}</div>
        </div>
        <div class="card-desc">${hackathon.description}</div>
        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-key">Prize</span>
            <span class="meta-val prize">${hackathon.prizeRange}</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">Deadline</span>
            <span class="meta-val">${deadline}</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">Platform</span>
            <span class="meta-val">${hackathon.platform}</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">Participants</span>
            <span class="meta-val">${hackathon.participants || 'Unknown'}</span>
          </div>
        </div>
        <div class="card-tags">${tags}</div>
        <a class="card-link" href="${hackathon.url}" target="_blank">
          Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    `;
  }

  /**
   * Update statistics
   */
  updateStats() {
    const openCount = this.hackathons.filter(h => h.category === 'open').length;
    const totalCount = this.hackathons.length;

    const openCountEl = document.getElementById('openCount');
    const totalCountEl = document.getElementById('totalCount');

    if (openCountEl) openCountEl.textContent = openCount;
    if (totalCountEl) totalCountEl.textContent = totalCount;

    // Update last updated time
    const timestamp = new Date().toLocaleTimeString();
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = new Date().toLocaleDateString() + ' ' + timestamp;
    }
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg2);
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HackTracker();
});

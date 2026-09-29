/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - VIEW ROUTER
 * Version: 2.4.2
 */

const Router = {
  /**
   * Navigate to a target application page
   */
  navigate(page, params = {}) {
    // 1. Enforce authentication guard
    if (!appState.isLoggedIn && page !== 'login') {
      page = 'login';
    }

    // 2. Enforce vehicle selection guard
    if (appState.isLoggedIn && !appState.currentVehicle && page !== 'vehicles' && page !== 'login') {
      page = 'vehicles';
    }

    appState.currentPage = page;

    // Hide all view containers
    const views = [
      'view-login',
      'view-vehicles',
      'view-dashboard',
      'view-trips',
      'view-excel',
      'view-vehicle-data',
      'view-settings',
      'view-renewals',
      'view-invoice-studio'
    ];

    views.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // Header visibility
    const header = document.getElementById('app-header');
    if (header) {
      if (page === 'login' || page === 'vehicles') {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
        this.updateHeader();
      }
    }

    // Show target view
    const targetEl = document.getElementById(`view-${page}`);
    if (targetEl) {
      targetEl.classList.remove('hidden');
    }

    // Trigger page-specific lifecycle hook
    switch (page) {
      case 'vehicles':
        if (typeof VehicleList !== 'undefined') VehicleList.render();
        break;
      case 'dashboard':
        if (typeof Dashboard !== 'undefined') Dashboard.render();
        break;
      case 'trips':
        if (typeof Trips !== 'undefined') Trips.render();
        break;
      case 'excel':
        if (typeof ExcelView !== 'undefined') ExcelView.render();
        break;
      case 'vehicle-data':
        if (typeof VehicleData !== 'undefined') VehicleData.render();
        break;
      case 'settings':
        if (typeof Settings !== 'undefined') Settings.render();
        break;
      case 'renewals':
        if (typeof Renewals !== 'undefined') Renewals.render();
        break;
      case 'invoice-studio':
        // Ensure invoice studio frame has source loaded
        const frame = document.getElementById('invoice-studio-frame');
        if (frame && !frame.src) {
          frame.src = 'invoice-studio/index.html';
        }
        break;
    }

    // Close slide-over menu if open
    this.closeMenu();
  },

  /**
   * Update header badges and labels
   */
  updateHeader() {
    const vEl = document.getElementById('header-vehicle-badge');
    if (vEl) {
      vEl.textContent = appState.currentVehicle ? `🚚 ${appState.currentVehicle}` : 'No Vehicle Selected';
    }

    const uEl = document.getElementById('header-user-badge');
    if (uEl) {
      uEl.textContent = appState.currentUser ? `${appState.currentUser.name} (${appState.currentUser.role})` : 'Guest';
    }

    const dName = document.getElementById('drawer-user-name');
    if (dName) {
      dName.textContent = appState.currentUser ? appState.currentUser.name : 'Administrator';
    }
    const dRole = document.getElementById('drawer-user-role');
    if (dRole) {
      dRole.textContent = appState.currentUser ? (appState.currentUser.role === 'Admin' ? 'ADMIN' : 'USER') : 'ADMIN';
    }

    // Settings menu item visibility (Available to both Admin and Rudra)
    const settingsBtn = document.getElementById('menu-btn-settings');
    if (settingsBtn) {
      settingsBtn.classList.remove('hidden');
    }

    // Refresh renewal notification badges in header & menu
    if (typeof Renewals !== 'undefined' && Renewals.updateNotificationBadges) {
      Renewals.updateNotificationBadges();
    }
  },

  /**
   * Menu toggle handlers
   */
  openMenu() {
    const drawer = document.getElementById('menu-drawer');
    const backdrop = document.getElementById('menu-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    }
  },

  closeMenu() {
    const drawer = document.getElementById('menu-drawer');
    const backdrop = document.getElementById('menu-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}


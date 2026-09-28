/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - AUTHENTICATION MODULE
 * Version: 2.4.2
 */

const Auth = {
  // Pre-configured baseline users (server-enforced)
  USERS: {
    admin: { username: 'admin', name: 'Shravan Kumar', role: 'Admin', pass: 'Shravan' },
    shravan: { username: 'shravan', name: 'Shravan Kumar', role: 'Admin', pass: 'Shravan' },
    rudra: { username: 'rudra', name: 'Rudra', role: 'Employee', pass: 'RudraSarika@2505' }
  },

  /**
   * Authenticate user credentials
   */
  async login(username, password) {
    const u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();

    if (!u || !p) {
      throw new Error("Please enter both username and password.");
    }

    const userRecord = this.USERS[u];
    if (!userRecord || userRecord.pass !== p) {
      throw new Error("Invalid username or password.");
    }

    // Set authenticated state
    appState.isLoggedIn = true;
    appState.currentUser = {
      username: userRecord.username,
      name: userRecord.name,
      role: userRecord.role
    };

    // Save session to localStorage for reload convenience
    this.saveSession();

    return appState.currentUser;
  },

  /**
   * Save session state to localStorage
   */
  saveSession() {
    if (appState.isLoggedIn && appState.currentUser) {
      const sessionData = {
        user: appState.currentUser,
        vehicle: appState.currentVehicle,
        timestamp: Date.now()
      };
      try {
        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
      } catch (_) {}
    }
  },

  /**
   * Restore existing session from localStorage (F5 refresh)
   */
  restoreSession() {
    try {
      const raw = localStorage.getItem(CONFIG.SESSION_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data && data.user && data.user.username) {
        // Session valid for 7 days
        if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
          appState.isLoggedIn = true;
          appState.currentUser = data.user;
          appState.currentVehicle = data.vehicle || null;
          return true;
        }
      }
    } catch (_) {}
    return false;
  },

  /**
   * Logout current user and clear session
   */
  logout() {
    appState.resetSession();
    try {
      localStorage.removeItem(CONFIG.SESSION_KEY);
      localStorage.removeItem(CONFIG.VEHICLE_KEY);
    } catch (_) {}
  },

  /**
   * Check if current user has Admin privileges
   */
  isAdmin() {
    return appState.currentUser && appState.currentUser.role === 'Admin';
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}


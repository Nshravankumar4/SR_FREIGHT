/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - AUTHENTICATION MODULE
 * Version: 2.4.2
 */

const Auth = {
  // Configured baseline accounts
  USERS: {
    admin: {
      username: 'admin',
      name: 'Administrator',
      role: 'Admin',
      passwords: ['Shravan', 'Shravan@1']
    },
    shravan: {
      username: 'admin',
      name: 'Administrator',
      role: 'Admin',
      passwords: ['Shravan', 'Shravan@1']
    },
    rudra: {
      username: 'rudra',
      name: 'Rudra',
      role: 'Employee',
      passwords: ['RudraSarika@2505', 'Rudra', 'EShravan@2']
    }
  },

  /**
   * Switch selected user card on login UI (Admin vs Rudra)
   */
  selectUser(user) {
    const norm = String(user || 'admin').trim().toLowerCase();
    const isRudra = norm === 'rudra';

    const adminBtn = document.getElementById('userBtnAdmin');
    const rudraBtn = document.getElementById('userBtnRudra');
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    const errBox = document.getElementById('login-error-msg');

    if (errBox) errBox.classList.add('hidden');

    if (userInput) {
      userInput.value = isRudra ? 'rudra' : 'admin';
    }

    if (adminBtn && rudraBtn) {
      if (isRudra) {
        adminBtn.className = 'user-switch-card flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition cursor-pointer';
        rudraBtn.className = 'user-switch-card active flex items-center gap-3 p-3 rounded-xl border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 text-left transition shadow-xs cursor-pointer';
      } else {
        adminBtn.className = 'user-switch-card active flex items-center gap-3 p-3 rounded-xl border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 text-left transition shadow-xs cursor-pointer';
        rudraBtn.className = 'user-switch-card flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition cursor-pointer';
      }
    }

    if (passInput) {
      passInput.placeholder = isRudra ? 'Enter password for Rudra' : 'Enter password for Admin';
      passInput.value = '';
      passInput.focus();
    }
  },

  /**
   * Toggle password input visibility (text <-> password)
   */
  togglePasswordVisibility() {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('togglePasswordBtn');
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.textContent = '🙈';
    } else {
      input.type = 'password';
      if (btn) btn.textContent = '👁️';
    }
  },

  /**
   * Authenticate user credentials
   */
  async login(username, password) {
    let u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();

    if (!u || !p) {
      throw new Error("Please enter password to sign in.");
    }

    if (u === 'admin1' || u === 'administrator') u = 'admin';
    if (u === 'sarika' || u === 'user') u = 'rudra';

    const userRecord = this.USERS[u];
    if (!userRecord) {
      throw new Error("Invalid user account selected.");
    }

    // Check custom password from localStorage or master baseline passwords
    const customPass = localStorage.getItem(`lorry_custom_${u}_pass`);
    const validPasswords = [...userRecord.passwords];
    if (customPass) {
      validPasswords.unshift(customPass);
    }

    if (!validPasswords.includes(p)) {
      throw new Error("Invalid password. Please check and try again.");
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
   * Update user password securely
   */
  updatePassword(targetUser, newPassword) {
    const u = String(targetUser || '').trim().toLowerCase();
    const p = String(newPassword || '').trim();

    if (!p || p.length < 4) {
      return { success: false, message: "Password must be at least 4 characters." };
    }

    if (u !== 'admin' && u !== 'rudra') {
      return { success: false, message: "Invalid user account." };
    }

    // Role check: Only admin can update admin password or other accounts
    if (u === 'admin' && !this.isAdmin()) {
      return { success: false, message: "Permission Denied: Only Admin can change Administrator password." };
    }

    try {
      localStorage.setItem(`lorry_custom_${u}_pass`, p);
      if (this.USERS[u]) {
        this.USERS[u].passwords.unshift(p);
      }
      return { success: true, message: `Password for ${u.toUpperCase()} updated successfully!` };
    } catch (err) {
      return { success: false, message: "Failed to save password: " + err.message };
    }
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
   * Complete Authoritative & Foolproof Logout
   */
  logout() {
    // 1. Stop background poller immediately
    try {
      if (typeof App !== 'undefined' && App.stopBackgroundPoller) {
        App.stopBackgroundPoller();
      }
    } catch (_) {}

    // 2. Close any open drawers or modals safely
    try {
      if (typeof Trips !== 'undefined' && Trips.closeViewModal) {
        Trips.closeViewModal();
      }
      if (typeof TripForm !== 'undefined' && TripForm.closeEditDrawer) {
        TripForm.closeEditDrawer();
      }
      if (typeof Trips !== 'undefined' && Trips.closeEditDrawer) {
        Trips.closeEditDrawer();
      }
      if (typeof Router !== 'undefined' && Router.closeMenu) {
        Router.closeMenu();
      }
      if (typeof Dashboard !== 'undefined' && Dashboard.closeOutstandingModal) {
        Dashboard.closeOutstandingModal();
      }
      const pwdModal = document.getElementById('modal-change-password');
      if (pwdModal) pwdModal.classList.add('hidden');
    } catch (_) {}

    // 3. Clear application session and data caches
    try {
      appState.resetSession();
    } catch (_) {}

    // 4. Clear storage tokens
    try {
      localStorage.removeItem(CONFIG.SESSION_KEY);
      localStorage.removeItem(CONFIG.VEHICLE_KEY);
      sessionStorage.clear();
    } catch (_) {}

    // 5. Navigate to login screen
    try {
      if (typeof Router !== 'undefined' && Router.navigate) {
        Router.navigate('login');
      }
    } catch (_) {}

    // 6. Reset login inputs & state
    try {
      const passInput = document.getElementById('login-password');
      if (passInput) passInput.value = '';
      const errBox = document.getElementById('login-error-msg');
      if (errBox) errBox.classList.add('hidden');
      this.selectUser('admin');
    } catch (_) {}

    if (typeof Utils !== 'undefined' && Utils.showToast) {
      Utils.showToast("Logged out successfully.");
    }
  },

  /**
   * Check if current user has Admin privileges
   */
  isAdmin() {
    return Boolean(appState.currentUser && appState.currentUser.role === 'Admin');
  },

  /**
   * Centralized Permission Helper: Only Admin (Shravan) can delete records.
   * Rudra has full access to View, Add, Edit, and Settings, but CANNOT delete.
   */
  canDelete() {
    return this.isAdmin();
  }
};

if (typeof window !== 'undefined') {
  window.canDelete = () => Auth.canDelete();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}


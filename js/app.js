/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - APPLICATION BOOTSTRAP
 * Version: 2.4.2
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  async init() {
    console.log(`[App] Initializing ${CONFIG.APP_NAME} v${CONFIG.VERSION}...`);

    // 1. Initialize local dataset
    Trips.loadFromLocal();
    if (typeof Renewals !== 'undefined') {
      Renewals.loadFromLocal();
    }

    // 2. Setup global UI event bindings & cross-tab sync channel
    this.bindEvents();
    this.setupSyncChannel();

    // 3. Attempt session restoration (F5 reload)
    const hasSession = Auth.restoreSession();

    if (hasSession && appState.isLoggedIn) {
      if (typeof Renewals !== 'undefined') {
        Renewals.updateNotificationBadges();
        setTimeout(() => {
          if (typeof RenewalAlerts !== 'undefined') {
            RenewalAlerts.checkAndShowAlerts(false);
          }
        }, 600);
        Renewals.loadCloudRenewals().catch(e => console.warn('[App] Cloud renewals note:', e));
      }

      if (appState.currentVehicle) {
        Router.navigate('dashboard');
        Trips.loadVehicleTrips(appState.currentVehicle);
      } else {
        Router.navigate('vehicles');
      }
      this.startBackgroundPoller();
    } else {
      Router.navigate('login');
    }
  },

  /**
   * Attach core event listeners
   */
  bindEvents() {
    // Login form submit
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username')?.value;
        const p = document.getElementById('login-password')?.value;
        const errEl = document.getElementById('login-error-msg');

        try {
          if (errEl) errEl.classList.add('hidden');
          await Auth.login(u, p);
          Utils.showToast(`Welcome back, ${appState.currentUser.name}!`);

          if (typeof Renewals !== 'undefined') {
            Renewals.loadFromLocal();
            Renewals.updateNotificationBadges();
            setTimeout(() => {
              if (typeof RenewalAlerts !== 'undefined') {
                RenewalAlerts.checkAndShowAlerts(false);
              }
            }, 600);
            Renewals.loadCloudRenewals().catch(e => console.warn('[App] Cloud renewals note:', e));
          }

          Router.navigate('vehicles');
          App.startBackgroundPoller();
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message || "Login failed.";
            errEl.classList.remove('hidden');
          }
        }
      });
    }

    // Add Trip Form
    const addForm = document.getElementById('form-add-trip');
    if (addForm) {
      addForm.addEventListener('submit', (e) => Trips.saveNewTrip(e));
      // Add real-time live preview calculation
      const calcInputs = ['add-freight', 'add-advance', 'add-diesel', 'add-toll', 'add-rta', 'add-police', 'add-loading', 'add-unloading', 'add-driver-comm', 'add-trsp-commission', 'add-other'];
      calcInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => TripForm.recalcAddForm());
      });
    }

    // Edit Trip Form
    const editForm = document.getElementById('form-edit-trip');
    if (editForm) {
      editForm.addEventListener('submit', (e) => Trips.saveTripEdits(e));
    }

    // Quick Add Payment Receipt Form in Drawer
    const receiptForm = document.getElementById('form-add-receipt');
    if (receiptForm) {
      receiptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('receipt-date')?.value;
        const amt = document.getElementById('receipt-amount')?.value;
        const notes = document.getElementById('receipt-notes')?.value;

        if (!appState.editingTripId) return;

        try {
          await Receipts.addReceipt(appState.editingTripId, {
            receivedDate: date,
            receivedAmount: amt,
            notes: notes
          });
          // Reset receipt form
          receiptForm.reset();
          const today = new Date().toISOString().slice(0, 10);
          const dInput = document.getElementById('receipt-date');
          if (dInput) dInput.value = today;
        } catch (err) {
          alert(err.message || "Failed to add payment receipt.");
        }
      });
    }

    // Search filter input (support both input-search and filter-search)
    ['input-search', 'filter-search'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          appState.filters.search = e.target.value;
          TripTable.render();
        });
      }
    });

    // Status filter select (if present)
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        appState.filters.status = e.target.value;
        TripTable.render();
      });
    }

    // Change Password Form submit
    const changePwdForm = document.getElementById('form-change-password');
    if (changePwdForm) {
      changePwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const targetUser = document.getElementById('change-pwd-target-user')?.value || 'admin';
        const newPass = document.getElementById('change-pwd-new')?.value;
        const alertBox = document.getElementById('change-pwd-alert');

        const res = Auth.updatePassword(targetUser, newPass);
        if (alertBox) {
          alertBox.textContent = res.message;
          alertBox.className = res.success
            ? 'p-3 rounded-xl text-xs font-semibold text-center bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'p-3 rounded-xl text-xs font-semibold text-center bg-rose-50 text-rose-700 border border-rose-200';
          alertBox.classList.remove('hidden');
        }

        if (res.success) {
          Utils.showToast(res.message, "success");
          setTimeout(() => {
            this.closeChangePasswordModal();
          }, 1000);
        }
      });
    }
  },

  /**
   * Modal controllers for password update
   */
  openChangePasswordModal() {
    const modal = document.getElementById('modal-change-password');
    if (!modal) return;
    const alertBox = document.getElementById('change-pwd-alert');
    if (alertBox) alertBox.classList.add('hidden');
    const targetSelect = document.getElementById('change-pwd-target-user');
    if (targetSelect) {
      if (Auth.isAdmin()) {
        targetSelect.disabled = false;
        targetSelect.value = 'admin';
      } else {
        targetSelect.value = 'rudra';
        targetSelect.disabled = true;
      }
    }
    const input = document.getElementById('change-pwd-new');
    if (input) input.value = '';
    modal.classList.remove('hidden');
  },

  closeChangePasswordModal() {
    const modal = document.getElementById('modal-change-password');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Manual Cloud Database Synchronizer
   */
  async manualSync() {
    if (!appState.isLoggedIn) return;
    Utils.showToast("🔄 Syncing with Google Cloud...", "info");
    const syncDot = document.getElementById('cloudStatusDot');
    const syncText = document.getElementById('cloudStatusText');
    if (syncDot) { syncDot.className = 'status-dot syncing'; }
    if (syncText) { syncText.textContent = 'Syncing...'; }

    try {
      if (appState.currentVehicle) {
        await Trips.loadVehicleTrips(appState.currentVehicle);
      }
      if (typeof Renewals !== 'undefined') {
        await Renewals.loadCloudRenewals();
      }
      Utils.showToast("✅ Cloud database synchronized!", "success");
      if (syncDot) { syncDot.className = 'status-dot online'; }
      if (syncText) { syncText.textContent = 'Online'; }
    } catch (err) {
      Utils.showToast("⚠️ Cloud notice: " + (err.message || 'Offline mode'), "warning");
      if (syncDot) { syncDot.className = 'status-dot error'; }
      if (syncText) { syncText.textContent = 'Offline'; }
    }
  },

  /**
   * Open Settings and trigger connection diagnostic test
   */
  async testCloudConnectionUI() {
    Router.navigate('settings');
    setTimeout(() => {
      if (typeof Settings !== 'undefined' && Settings.testConnection) {
        Settings.testConnection();
      }
    }, 150);
  },

  /**
   * Background poller coordinating cloud synchronization
   */
  startBackgroundPoller() {
    if (this._pollerInterval) return;

    this._pollerInterval = setInterval(async () => {
      // Don't poll if saving or no active vehicle
      if (!appState.isLoggedIn || !appState.currentVehicle || appState.isSaving || appState.pendingMutationCount > 0) {
        return;
      }

      // Check mutation pause window
      if (Date.now() - appState.lastSuccessfulMutation < CONFIG.POLL_MIN_INTERVAL_AFTER_MUTATION_MS) {
        return;
      }

      try {
        await Trips.loadVehicleTrips(appState.currentVehicle);
      } catch (_) {}
    }, CONFIG.POLL_INTERVAL_MS);
  },

  /**
   * Stop background poller immediately
   */
  stopBackgroundPoller() {
    if (this._pollerInterval) {
      clearInterval(this._pollerInterval);
      this._pollerInterval = null;
    }
  },

  /**
   * Set up real-time cross-tab synchronization via BroadcastChannel
   */
  setupSyncChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this._channel = new BroadcastChannel('lorry_sync_channel');
        this._channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'receipt_added' || type === 'receipt_deleted' || type === 'trip_updated') {
            if (appState.currentVehicle && payload && payload.vehicleNo === appState.currentVehicle) {
              Trips.loadFromLocal();
              TripTable.render();
              if (appState.currentPage === 'dashboard') Dashboard.render();
            }
          } else if (type === 'renewal_updated') {
            if (typeof Renewals !== 'undefined') {
              Renewals.loadFromLocal();
              Renewals.updateNotificationBadges();
              if (appState.currentPage === 'renewals') Renewals.render();
            }
          }
        };
      } catch (_) {}
    }
  },

  /**
   * Broadcast state changes to other open tabs
   */
  broadcastStateChange(type, payload = {}) {
    if (this._channel) {
      try {
        this._channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (_) {}
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}

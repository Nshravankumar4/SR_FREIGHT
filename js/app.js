/**
 * LORRY FREIGHT & BROKER MANAGEMENT SYSTEM
 * Clean, High-Performance Fleet Operations Engine
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Baseline Data (August 2026 records from Excel & User Business Formula)
const INITIAL_TRIPS = [
  {
    id: 1,
    sNo: 1,
    tripDate: '2026-08-28',
    vehicleNo: 'TS15UE1122',
    from: 'Hyderabad, Telangana',
    to: 'Purnia, Bihar',
    freight: 200000,
    advanceDate: '2026-08-28',
    advance: 90000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 50000,
    toll: 10000,
    loading: 2500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 12000,
    totalExpenses: 82000,
    totalExpGiven: 172000,
    status: 'Pending',
    netPL: 28000,
    balanceReceivedDate: '2026-09-25',
    balance: 28000,
    deleted: false
  },
  {
    id: 2,
    sNo: 2,
    tripDate: '2026-08-28',
    vehicleNo: 'TG15T6666',
    from: 'Hyderabad, Telangana',
    to: 'Purnia, Bihar',
    freight: 250000,
    advanceDate: '2026-08-28',
    advance: 90000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 80000,
    toll: 10000,
    loading: 2500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 12000,
    totalExpenses: 110000,
    totalExpGiven: 200000,
    status: 'Paid',
    netPL: 50000,
    balanceReceivedDate: '2026-08-30',
    balance: 50000,
    deleted: false
  },
  {
    id: 3,
    sNo: 3,
    tripDate: '2026-08-29',
    vehicleNo: 'TS15UE1122',
    from: 'Hyderabad, Telangana',
    to: 'Kedch',
    freight: 200000,
    advanceDate: '2026-08-29',
    advance: 100000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 50000,
    toll: 10000,
    loading: 2500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 12000,
    totalExpenses: 82000,
    totalExpGiven: 182000,
    status: 'Paid',
    netPL: 18000,
    balanceReceivedDate: '2026-08-29',
    balance: 18000,
    deleted: false
  },
  {
    id: 4,
    sNo: 4,
    tripDate: '2026-08-29',
    vehicleNo: 'TG15T6666',
    from: 'Hyderabad, Telangana',
    to: 'Mechal',
    freight: 300000,
    advanceDate: '2026-08-29',
    advance: 155000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 20000,
    toll: 90000,
    loading: 55500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 90000,
    totalExpenses: 263000,
    totalExpGiven: 418000,
    status: 'Pending',
    netPL: -118000,
    balanceReceivedDate: '',
    balance: -118000,
    deleted: false
  }
];

// Clean Application State (Cloud Database First)
const CURRENT_ACTIVE_DEPLOYMENT_ID = 'AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ';
const DEFAULT_CLOUD_API_URL = 'https://script.google.com/macros/s/AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ/exec';

function getEffectiveApiUrl() {
  const saved = localStorage.getItem('lorry_api_url');
  if (!saved || saved.includes('AKfycbwFo4') || saved.includes('AKfycbymLz') || !saved.includes('AKfycbyp5f')) {
    localStorage.setItem('lorry_api_url', DEFAULT_CLOUD_API_URL);
    return DEFAULT_CLOUD_API_URL;
  }
  return saved.trim();
}

// Mutation Lock & Poller Mutex
let isSaving = false;
let pendingMutationCount = 0;
let lastSuccessfulMutation = 0;

const state = {
  trips: [],
  viewType: 'ALL_TRIPS', // 'TODAY' | 'SELECTED_DATE' | 'DATE_RANGE' | 'ENTIRE_MONTH' | 'ALL_TRIPS'
  selectedDate: '2026-08-28',
  dateFrom: '2026-08-28',
  dateTo: '2026-08-29',
  selectedMonth: '2026-08',
  statusFilter: 'ALL',   // 'ALL' | 'NEW' | 'PROFIT' | 'LOSS' | 'PENDING' | 'PARTIAL' | 'PAID' | 'BALANCE_MISMATCH'
  searchQuery: '',
  selectedTripId: null,
  apiUrl: getEffectiveApiUrl(),
  pendingEditTripId: null,
  pendingDeleteTripId: null,
  currentUser: localStorage.getItem('lorry_auth_user') || null,
  currentRole: localStorage.getItem('lorry_auth_role') || null
};

// Registered System Users
const AUTH_USERS = [
  {
    userId: 'Admin',
    password: 'Shravan',
    role: 'Admin'
  },
  {
    userId: 'Rudra',
    password: 'RudraSarika@2505',
    role: 'User'
  }
];

// Single Reliable Role-Checking Helpers
function isAdmin() {
  return state.currentRole === 'Admin' || (state.currentUser && state.currentUser.toLowerCase() === 'admin');
}

function canDelete() {
  return isAdmin();
}

function canAccessSettings() {
  return isAdmin();
}

function applyRolePermissions() {
  const btnSettings = document.getElementById('btn-settings');
  const navUserLabel = document.getElementById('nav-user-label');
  const navRoleLabel = document.getElementById('nav-role-label');

  if (navUserLabel) navUserLabel.textContent = state.currentUser || '-';
  if (navRoleLabel) navRoleLabel.textContent = state.currentRole || '-';

  if (btnSettings) {
    if (canAccessSettings()) {
      btnSettings.classList.remove('hidden');
    } else {
      btnSettings.classList.add('hidden');
    }
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  loadTrips();
  BackupModule.init();
  setupGlobalControls();
  setupModals();
  setupSlideOverEvents();
  closeTripDetails();

  if (state.currentUser && state.currentRole) {
    applyRolePermissions();
    renderScopeControls();
    render();
    if (state.apiUrl) {
      syncWithGoogleSheet();
    }
  }
});

// ==========================================================================
// 1. Authentication System
// ==========================================================================

function setupAuth() {
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');
  const btnTogglePassword = document.getElementById('btn-toggle-password');
  const passwordInput = document.getElementById('login-password');
  const eyeText = document.getElementById('eye-text');
  const eyeIcon = document.getElementById('eye-icon');
  const usernameInput = document.getElementById('login-username');
  const cardAdmin = document.getElementById('account-card-admin');
  const cardRudra = document.getElementById('account-card-rudra');

  // Account switching helper function
  function selectAccount(userKey) {
    if (loginError) loginError.classList.add('hidden');
    if (userKey === 'Admin') {
      if (usernameInput) usernameInput.value = 'Admin';
      if (passwordInput) {
        passwordInput.placeholder = 'Enter Password for Admin';
        passwordInput.value = '';
        passwordInput.focus();
      }
      if (cardAdmin) {
        cardAdmin.className = 'account-card flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-150 text-left cursor-pointer border-[#1e3a8a] bg-blue-50/60 shadow-xs';
        const nameEl = cardAdmin.querySelector('.account-name');
        if (nameEl) nameEl.className = 'account-name text-sm font-extrabold text-[#1e3a8a] leading-tight';
      }
      if (cardRudra) {
        cardRudra.className = 'account-card flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-150 text-left cursor-pointer border-slate-200 bg-white hover:border-slate-300';
        const nameEl = cardRudra.querySelector('.account-name');
        if (nameEl) nameEl.className = 'account-name text-sm font-extrabold text-slate-800 leading-tight';
      }
    } else {
      if (usernameInput) usernameInput.value = 'Rudra';
      if (passwordInput) {
        passwordInput.placeholder = 'Enter Password for Rudra';
        passwordInput.value = '';
        passwordInput.focus();
      }
      if (cardRudra) {
        cardRudra.className = 'account-card flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-150 text-left cursor-pointer border-[#1e3a8a] bg-blue-50/60 shadow-xs';
        const nameEl = cardRudra.querySelector('.account-name');
        if (nameEl) nameEl.className = 'account-name text-sm font-extrabold text-[#1e3a8a] leading-tight';
      }
      if (cardAdmin) {
        cardAdmin.className = 'account-card flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-150 text-left cursor-pointer border-slate-200 bg-white hover:border-slate-300';
        const nameEl = cardAdmin.querySelector('.account-name');
        if (nameEl) nameEl.className = 'account-name text-sm font-extrabold text-slate-800 leading-tight';
      }
    }
  }

  // Account card click handlers
  if (cardAdmin) {
    cardAdmin.addEventListener('click', () => selectAccount('Admin'));
  }
  if (cardRudra) {
    cardRudra.addEventListener('click', () => selectAccount('Rudra'));
  }

  // Show / Hide Password toggle
  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      if (eyeText) {
        eyeText.textContent = isPassword ? 'Hide Password' : 'Show Password';
      }
      if (eyeIcon) {
        eyeIcon.textContent = isPassword ? '🙈' : '👁️';
      }
    });
  }

  // Initial State Check
  if (!state.currentUser || !state.currentRole) {
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    selectAccount('Rudra');
  } else {
    if (loginOverlay) loginOverlay.classList.add('hidden');
    applyRolePermissions();
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = usernameInput ? usernameInput.value.trim() : '';
      const p = passwordInput ? passwordInput.value : '';

      const matched = AUTH_USERS.find(usr => 
        usr.userId.toLowerCase() === u.toLowerCase() && usr.password === p
      );

      if (matched) {
        state.currentUser = matched.userId;
        state.currentRole = matched.role;
        localStorage.setItem('lorry_auth_user', state.currentUser);
        localStorage.setItem('lorry_auth_role', state.currentRole);

        if (loginError) loginError.classList.add('hidden');
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (passwordInput) passwordInput.value = '';
        if (passwordInput) passwordInput.type = 'password';
        if (eyeText) eyeText.textContent = 'Show Password';
        if (eyeIcon) eyeIcon.textContent = '👁️';

        applyRolePermissions();
        showToast(`✅ Signed in successfully as ${state.currentUser} (${state.currentRole}).`);
        renderScopeControls();
        render();
        if (state.apiUrl) {
          syncWithGoogleSheet();
        }
      } else {
        if (loginError) {
          loginError.textContent = `❌ Invalid password for ${u}. Please check credentials.`;
          loginError.classList.remove('hidden');
          // Re-trigger shake animation
          loginError.classList.remove('animate-shake');
          void loginError.offsetWidth;
          loginError.classList.add('animate-shake');
        }
        if (passwordInput) {
          passwordInput.select();
        }
      }
    });
  }

  // Logout Handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      state.currentUser = null;
      state.currentRole = null;
      localStorage.removeItem('lorry_auth_user');
      localStorage.removeItem('lorry_auth_role');

      selectAccount('Rudra');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.type = 'password';
      }
      if (eyeText) eyeText.textContent = 'Show Password';
      if (eyeIcon) eyeIcon.textContent = '👁️';
      if (loginError) loginError.classList.add('hidden');
      if (loginOverlay) loginOverlay.classList.remove('hidden');
      closeTripDetails();
      showToast('ℹ️ Logged out successfully.');
    });
  }
}

// Helper to sanitize HTML for UI output
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 1.5 Cloud & Local Point-in-Time Backup Module (Ref: D:\Repo\SR_T)
// ==========================================================================
const BackupModule = {
  storageKeySnapshots: 'lorry_backup_snapshots_v1',
  snapshots: [],

  init() {
    this.loadSnapshots();
    this.renderUI();
  },

  loadSnapshots() {
    try {
      const raw = localStorage.getItem(this.storageKeySnapshots);
      this.snapshots = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to load snapshots:", e);
      this.snapshots = [];
    }
  },

  saveSnapshots() {
    try {
      if (this.snapshots.length > 25) {
        this.snapshots = this.snapshots.slice(0, 25);
      }
      localStorage.setItem(this.storageKeySnapshots, JSON.stringify(this.snapshots));
    } catch (e) {
      console.warn("Failed to save snapshots:", e);
    }
  },

  onRecordMutated(reason = 'Record Mutation') {
    try {
      this.loadSnapshots();
      const snapshot = {
        id: 'SNAP-' + Date.now(),
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleString('en-IN'),
        reason: reason,
        user: state.currentUser || 'Unknown',
        role: state.currentRole || 'User',
        tripsCount: state.trips.length,
        tripsData: JSON.parse(JSON.stringify(state.trips))
      };
      this.snapshots.unshift(snapshot);
      this.saveSnapshots();
      this.renderUI();

      // Trigger cloud backup if API is configured
      if (state.apiUrl) {
        sendCloudMutation('createBackup', { reason: reason });
      }
    } catch (err) {
      console.warn('BackupModule mutation snapshot error:', err);
    }
  },

  async restoreSnapshot(snapshotId) {
    if (state.currentRole !== 'Admin') {
      showToast('❌ Only Admin can restore database snapshots.');
      return;
    }
    this.loadSnapshots();
    const snap = this.snapshots.find(s => s.id === snapshotId);
    if (!snap || !snap.tripsData) {
      alert('Snapshot data not found!');
      return;
    }

    const confirmMsg = `⚠️ RESTORE DATABASE SNAPSHOT?\n\n` +
      `Date & Time: ${snap.displayTime}\n` +
      `Reason: ${snap.reason}\n` +
      `User: ${snap.user} (${snap.role})\n` +
      `Trips: ${snap.tripsCount}\n\n` +
      `This will restore all records to this point in time and synchronize with Google Sheets. Continue?`;

    if (!confirm(confirmMsg)) return;

    try {
      state.trips = JSON.parse(JSON.stringify(snap.tripsData));
      localStorage.setItem('lorry_trips_master_v9', JSON.stringify(state.trips));
      render();

      if (state.apiUrl) {
        showToast('🔄 Synchronizing restored data to Google Sheets...');
        await sendCloudMutation('restoreFullDataset', {
          trips: state.trips,
          role: state.currentRole,
          user: state.currentUser
        });
      }

      showToast(`🎉 Database restored to snapshot from ${snap.displayTime}!`);
      this.renderUI();
    } catch (err) {
      console.error('Restore error:', err);
      alert('Failed to restore snapshot: ' + err.message);
    }
  },

  deleteSnapshot(snapshotId) {
    if (!confirm("Are you sure you want to remove this backup snapshot from history?")) return;
    this.loadSnapshots();
    this.snapshots = this.snapshots.filter(s => s.id !== snapshotId);
    this.saveSnapshots();
    this.renderUI();
    showToast('Snapshot removed from history.');
  },

  renderUI() {
    const container = document.getElementById('backup-snapshots-container');
    const countEl = document.getElementById('backup-snapshot-count');
    if (countEl) {
      countEl.textContent = `${this.snapshots.length} snapshot${this.snapshots.length === 1 ? '' : 's'}`;
    }
    if (!container) return;

    if (this.snapshots.length === 0) {
      container.innerHTML = `
        <div class="p-3 text-center text-gray-400 text-[11px]">
          No snapshots saved yet. Any Add, Edit, Delete, or Manual Backup creates one automatically.
        </div>`;
      return;
    }

    container.innerHTML = this.snapshots.map(s => `
      <div class="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 shadow-2xs hover:border-blue-200 transition">
        <div class="space-y-0.5 pr-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-800 text-[11px]">${escapeHtml(s.displayTime)}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">${s.tripsCount || 0} Trips</span>
          </div>
          <div class="text-[10px] text-gray-500 truncate max-w-[240px]">
            ${escapeHtml(s.reason || 'Snapshot')} • <span class="text-gray-400">${escapeHtml(s.user || '')}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" onclick="BackupModule.restoreSnapshot('${s.id}')" title="Restore this snapshot" class="px-2 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 transition cursor-pointer">
            🔄 Restore
          </button>
          <button type="button" onclick="BackupModule.deleteSnapshot('${s.id}')" title="Delete snapshot" class="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer">
            ✕
          </button>
        </div>
      </div>
    `).join('');
  }
};
window.BackupModule = BackupModule;

function loadTrips() {
  const saved = localStorage.getItem('lorry_trips_master_v9');
  if (saved) {
    try {
      state.trips = JSON.parse(saved);
    } catch {
      state.trips = [];
    }
  } else {
    // Check previous version keys if user upgraded
    const v8 = localStorage.getItem('lorry_trips_master_v8');
    const v7 = localStorage.getItem('lorry_trips_master_v7');
    const v6 = localStorage.getItem('lorry_trips_master_v6');
    const legacy = v8 || v7 || v6 || localStorage.getItem('lorry_trips_master');
    if (legacy) {
      try {
        state.trips = JSON.parse(legacy);
      } catch {
        state.trips = [];
      }
    } else {
      state.trips = [];
    }
  }

  // By default, if empty, ALWAYS load the initial fleet trips dataset!
  if (!state.trips || state.trips.length === 0) {
    state.trips = INITIAL_TRIPS.map(t => calculateTrip(t));
    saveTrips();
  }

  // Sort trips cleanly by S.No ascending
  state.trips = state.trips.map(t => calculateTrip(t)).sort((a, b) => (Number(a.sNo) || 0) - (Number(b.sNo) || 0));
}

function saveTrips() {
  // Always sort chronologically / by S.No ascending
  state.trips.sort((a, b) => (Number(a.sNo) || 0) - (Number(b.sNo) || 0));
  localStorage.setItem('lorry_trips_master_v9', JSON.stringify(state.trips));
}

function calculateTrip(t) {
  const freight = Number(t.freight) || 0;
  const advance = Number(t.advance) || 0;

  const trspCommission = Number(t.trspCommission) || 0;
  const diesel = Number(t.diesel) || 0;
  const toll = Number(t.toll) || 0;
  const loading = Number(t.loading) || 0;
  const unloading = Number(t.unloading) || 0;
  const police = Number(t.police) || 0;
  const rta = Number(t.rta) || 0;
  const other = Number(t.other) || 0;
  const driverCommission = Number(t.driverCommission) || 0;

  // 20. Sum OF Total Exp = 9 logistical expenses
  const totalExpenses = trspCommission + diesel + toll + loading + unloading + police + rta + other + driverCommission;

  // 21. Total Exp Amount Given = Advance Amount + Sum OF Total Exp
  const totalExpGiven = advance + totalExpenses;

  // 23. P/L = Freight Amount - Total Exp Amount Given
  const netPL = freight - totalExpGiven;

  // 25. Balance Amount = Freight Amount - Total Exp Amount Given (or custom balance)
  const expectedBalance = freight - totalExpGiven;
  const balance = (t.balance !== undefined && t.balance !== null && t.balance !== '' && !isNaN(Number(t.balance)))
    ? Number(t.balance)
    : expectedBalance;

  // Balance discrepancy check
  const hasBalanceMismatch = balance !== expectedBalance;

  // Status: 'New' | 'Pending' | 'Partially Paid' | 'Paid'
  let status = t.status || 'Pending';
  if (status === 'Done') status = 'Paid';

  let statusAmount = 0;
  if (status === 'New' || status === 'Pending') {
    statusAmount = balance;
  } else if (status === 'Paid') {
    statusAmount = 0;
  } else if (status === 'Partially Paid') {
    statusAmount = t.statusAmount !== undefined && t.statusAmount !== null ? Number(t.statusAmount) : balance;
  }

  const from = (t.from || '').trim();
  const to = (t.to || '').trim();
  const balanceReceivedDate = t.balanceReceivedDate || t.dateOfBalanceReceived || '';

  return {
    ...t,
    freight,
    advance,
    trspCommission,
    diesel,
    toll,
    loading,
    unloading,
    police,
    rta,
    other,
    driverCommission,
    totalExpenses,
    totalExpGiven,
    netPL,
    expectedBalance,
    balance,
    hasBalanceMismatch,
    status,
    statusAmount,
    from,
    to,
    balanceReceivedDate
  };
}

function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const n = Number(val);
  const isNegative = n < 0;
  const abs = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return isNegative ? `-₹${abs}` : `₹${abs}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  try {
    const s = String(dateStr).trim();
    if (s.includes('-')) {
      const parts = s.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${String(parts[2]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}-${parts[0]}`;
        } else if (parts[2].length === 4) {
          return `${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}-${parts[2]}`;
        }
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function getTodayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ==========================================================================
// 3. View Scope & Left Sidebar Filter Engine
// ==========================================================================

function setupGlobalControls() {
  const inputSearch = document.getElementById('input-search');
  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderTableOnly();
    });
  }

  const btnDownloadExcel = document.getElementById('btn-download-excel');
  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener('click', exportToExcel);
  }

  const btnSync = document.getElementById('btn-sync');
  if (btnSync) {
    btnSync.addEventListener('click', syncWithGoogleSheet);
  }

  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', openSettingsModal);
  }
}

// Set View Scope (TODAY | SELECTED_DATE | DATE_RANGE | ENTIRE_MONTH | ALL_TRIPS)
window.setViewType = function(type) {
  state.viewType = type;

  const typeMap = {
    TODAY: 'btn-view-today',
    SELECTED_DATE: 'btn-view-selected-date',
    DATE_RANGE: 'btn-view-date-range',
    ENTIRE_MONTH: 'btn-view-entire-month',
    ALL_TRIPS: 'btn-view-all-trips'
  };

  document.querySelectorAll('.view-type-btn').forEach(btn => {
    btn.className = 'view-type-btn px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer select-none text-left flex items-center justify-between bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 active:scale-98';
  });

  const activeBtn = document.getElementById(typeMap[type]);
  if (activeBtn) {
    activeBtn.className = 'view-type-btn px-4 py-2.5 text-xs font-black rounded-xl transition cursor-pointer select-none text-left flex items-center justify-between bg-blue-600 text-white shadow-xs border border-blue-600 active:scale-98';
  }

  renderScopeControls();
  render();
};

function renderScopeControls() {
  const container = document.getElementById('dynamic-scope-inputs');
  const activeViewTag = document.getElementById('active-view-tag');
  if (!container) return;

  if (state.viewType === 'TODAY') {
    const today = getTodayISO();
    if (activeViewTag) activeViewTag.textContent = `TODAY (${formatDateDisplay(today)})`;
    container.innerHTML = `
      <div class="flex items-center gap-2 py-1">
        <span class="text-xs font-bold text-gray-700">Scheduled Dispatch Today:</span>
        <span class="px-2.5 py-1 font-mono text-xs font-black bg-blue-50 text-blue-700 rounded-lg border border-blue-200">${formatDateDisplay(today)}</span>
      </div>
    `;
  } else if (state.viewType === 'SELECTED_DATE') {
    if (activeViewTag) activeViewTag.textContent = formatDateDisplay(state.selectedDate);
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <label for="scope-single-date" class="text-xs font-bold text-gray-700">Choose Dispatch Date:</label>
        <div class="flex items-center gap-2">
          <input type="date" id="scope-single-date" value="${state.selectedDate}" class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
          <button onclick="applySelectedDate()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">VIEW</button>
        </div>
      </div>
    `;
  } else if (state.viewType === 'DATE_RANGE') {
    if (activeViewTag) activeViewTag.textContent = `${formatDateDisplay(state.dateFrom)} ➔ ${formatDateDisplay(state.dateTo)}`;
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <div class="flex items-center gap-2">
          <label for="scope-date-from" class="text-xs font-bold text-gray-700">From:</label>
          <input type="date" id="scope-date-from" value="${state.dateFrom}" class="px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white">
        </div>
        <div class="flex items-center gap-2">
          <label for="scope-date-to" class="text-xs font-bold text-gray-700">To:</label>
          <input type="date" id="scope-date-to" value="${state.dateTo}" class="px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white">
        </div>
        <button onclick="applyDateRange()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">VIEW RANGE</button>
      </div>
    `;
  } else if (state.viewType === 'ENTIRE_MONTH') {
    const [y, m] = state.selectedMonth.split('-');
    const mName = MONTH_NAMES[parseInt(m, 10) - 1] || 'August';
    if (activeViewTag) activeViewTag.textContent = `${mName} ${y}`;
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <label for="scope-month-select" class="text-xs font-bold text-gray-700">Choose Operational Month:</label>
        <div class="flex items-center gap-2">
          <select id="scope-month-select" class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 bg-white cursor-pointer">
            ${getMonthOptionsHTML()}
          </select>
          <button onclick="applyEntireMonth()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">VIEW MONTH</button>
        </div>
      </div>
    `;
  } else {
    // ALL_TRIPS
    if (activeViewTag) activeViewTag.textContent = 'ALL TRIPS';
    container.innerHTML = `
      <div class="py-1">
        <span class="text-xs font-semibold text-gray-600">Showing all records logged across the fleet (${state.trips.filter(t => !t.deleted).length} total trips)</span>
      </div>
    `;
  }
}

function getMonthOptionsHTML() {
  const monthsSet = new Set();
  monthsSet.add('2026-08');

  state.trips.forEach(t => {
    if (t.tripDate && t.tripDate.length >= 7) {
      monthsSet.add(t.tripDate.substring(0, 7));
    }
  });

  const sortedMonths = Array.from(monthsSet).sort().reverse();
  return sortedMonths.map(m => {
    const [year, mon] = m.split('-');
    const mIdx = parseInt(mon, 10) - 1;
    const label = `${MONTH_NAMES[mIdx]} ${year}`;
    return `<option value="${m}" ${m === state.selectedMonth ? 'selected' : ''}>${label}</option>`;
  }).join('');
}

window.applySelectedDate = function() {
  const el = document.getElementById('scope-single-date');
  if (el && el.value) {
    state.selectedDate = el.value;
    const activeViewTag = document.getElementById('active-view-tag');
    if (activeViewTag) activeViewTag.textContent = formatDateDisplay(state.selectedDate);
    render();
    showToast(`📅 Scope set to: ${formatDateDisplay(state.selectedDate)}`);
  }
};

window.applyDateRange = function() {
  const elFrom = document.getElementById('scope-date-from');
  const elTo = document.getElementById('scope-date-to');
  if (elFrom && elTo) {
    state.dateFrom = elFrom.value;
    state.dateTo = elTo.value;
    const activeViewTag = document.getElementById('active-view-tag');
    if (activeViewTag) activeViewTag.textContent = `${formatDateDisplay(state.dateFrom)} ➔ ${formatDateDisplay(state.dateTo)}`;
    render();
    showToast(`📅 Scope range: ${formatDateDisplay(state.dateFrom)} to ${formatDateDisplay(state.dateTo)}`);
  }
};

window.applyEntireMonth = function() {
  const el = document.getElementById('scope-month-select');
  if (el && el.value) {
    state.selectedMonth = el.value;
    const [y, m] = state.selectedMonth.split('-');
    const mName = MONTH_NAMES[parseInt(m, 10) - 1] || 'Month';
    const activeViewTag = document.getElementById('active-view-tag');
    if (activeViewTag) activeViewTag.textContent = `${mName} ${y}`;
    render();
    showToast(`📅 Scope set to entire month: ${mName} ${y}`);
  }
};

const filterStyles = {
  ALL: {
    btnId: 'filter-btn-all',
    badgeId: 'badge-all',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white/20 text-white shadow-2xs'
  },
  NEW: {
    btnId: 'filter-btn-new',
    badgeId: 'badge-new',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-400 text-indigo-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-600 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-indigo-900 shadow-2xs'
  },
  PROFIT: {
    btnId: 'filter-btn-profit',
    badgeId: 'badge-profit',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-500 text-emerald-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-600 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-emerald-900 shadow-2xs'
  },
  LOSS: {
    btnId: 'filter-btn-loss',
    badgeId: 'badge-loss',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 hover:border-rose-500 text-rose-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-rose-600 bg-rose-600 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-rose-900 shadow-2xs'
  },
  PENDING: {
    btnId: 'filter-btn-pending',
    badgeId: 'badge-pending',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100 hover:border-amber-500 text-amber-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-amber-500 bg-amber-500 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-amber-900 shadow-2xs'
  },
  PARTIAL: {
    btnId: 'filter-btn-partial',
    badgeId: 'badge-partial',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/70 hover:bg-orange-100 hover:border-orange-500 text-orange-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-orange-500 bg-orange-500 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-orange-900 shadow-2xs'
  },
  PAID: {
    btnId: 'filter-btn-paid',
    badgeId: 'badge-paid',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-teal-200 bg-teal-50/70 hover:bg-teal-100 hover:border-teal-500 text-teal-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-teal-600 bg-teal-600 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-900 border border-teal-200',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-teal-900 shadow-2xs'
  },
  BALANCE_MISMATCH: {
    btnId: 'filter-btn-mismatch',
    badgeId: 'badge-mismatch',
    inactive: 'big-status-btn p-3.5 sm:p-4 rounded-2xl border-2 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-500 text-red-950 transition cursor-pointer select-none flex flex-col justify-between shadow-xs active:scale-98',
    active: 'big-status-btn active p-3.5 sm:p-4 rounded-2xl border-2 border-red-600 bg-red-600 text-white transition cursor-pointer select-none flex flex-col justify-between shadow-md active:scale-98',
    inactiveBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-red-700 border border-red-300',
    activeBadge: 'text-base font-black px-2.5 py-0.5 rounded-lg bg-white text-red-700 shadow-2xs'
  }
};

// Set Status Filter from Big Header Buttons
window.setStatusFilter = function(filter) {
  state.statusFilter = filter;

  Object.entries(filterStyles).forEach(([key, cfg]) => {
    const btn = document.getElementById(cfg.btnId);
    const badge = document.getElementById(cfg.badgeId);
    if (!btn) return;
    if (key === filter) {
      btn.className = cfg.active;
      if (badge) badge.className = cfg.activeBadge;
    } else {
      btn.className = cfg.inactive;
      if (badge) badge.className = cfg.inactiveBadge;
    }
  });

  renderTableOnly();
};

// ==========================================================================
// 4. Data Scope Resolvers & Rendering
// ==========================================================================

function getScopedTrips() {
  return state.trips.filter(t => {
    if (t.deleted) return false;

    if (state.viewType === 'TODAY') {
      const today = getTodayISO();
      return t.tripDate === today;
    } else if (state.viewType === 'SELECTED_DATE') {
      return state.selectedDate ? t.tripDate === state.selectedDate : true;
    } else if (state.viewType === 'DATE_RANGE') {
      if (state.dateFrom && t.tripDate < state.dateFrom) return false;
      if (state.dateTo && t.tripDate > state.dateTo) return false;
      return true;
    } else if (state.viewType === 'ENTIRE_MONTH') {
      return (t.tripDate || '').startsWith(state.selectedMonth);
    }
    // ALL_TRIPS
    return true;
  });
}

function getDisplayTrips() {
  const scopedTrips = getScopedTrips();

  return scopedTrips.filter(t => {
    // Status & Audit Filter
    if (state.statusFilter === 'NEW' && t.status !== 'New') return false;
    if (state.statusFilter === 'PROFIT' && t.netPL < 0) return false;
    if (state.statusFilter === 'LOSS' && t.netPL >= 0) return false;
    if (state.statusFilter === 'PENDING' && t.status !== 'Pending') return false;
    if (state.statusFilter === 'PARTIAL' && t.status !== 'Partially Paid') return false;
    if (state.statusFilter === 'PAID' && t.status !== 'Paid') return false;
    if (state.statusFilter === 'BALANCE_MISMATCH' && !t.hasBalanceMismatch) return false;

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const match = (t.vehicleNo || '').toLowerCase().includes(q) ||
                    (t.from || '').toLowerCase().includes(q) ||
                    (t.to || '').toLowerCase().includes(q) ||
                    (t.trspName || '').toLowerCase().includes(q) ||
                    String(t.sNo || '').includes(q);
      if (!match) return false;
    }

    return true;
  });
}

function render() {
  updateSidebarCounters();
  renderTableOnly();
}

function updateSidebarCounters() {
  const scopedTrips = getScopedTrips();

  const countAll = scopedTrips.length;
  const countNew = scopedTrips.filter(t => t.status === 'New').length;
  const countProfit = scopedTrips.filter(t => t.netPL >= 0).length;
  const countLoss = scopedTrips.filter(t => t.netPL < 0).length;
  const countPending = scopedTrips.filter(t => t.status === 'Pending').length;
  const countPartial = scopedTrips.filter(t => t.status === 'Partially Paid').length;
  const countPaid = scopedTrips.filter(t => t.status === 'Paid').length;
  const countMismatch = scopedTrips.filter(t => t.hasBalanceMismatch).length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('badge-all', countAll);
  setEl('badge-new', countNew);
  setEl('badge-profit', countProfit);
  setEl('badge-loss', countLoss);
  setEl('badge-pending', countPending);
  setEl('badge-partial', countPartial);
  setEl('badge-paid', countPaid);
  setEl('badge-mismatch', countMismatch);
}

function renderTableOnly() {
  const trips = getDisplayTrips();
  const subHeading = document.getElementById('table-view-scope-text');
  const visibleCountLabel = document.getElementById('visible-count-label');

  if (visibleCountLabel) visibleCountLabel.textContent = trips.length;

  if (subHeading) {
    let scopeLabel = 'All Trips';
    if (state.viewType === 'TODAY') scopeLabel = `Today (${formatDateDisplay(getTodayISO())})`;
    else if (state.viewType === 'SELECTED_DATE') scopeLabel = formatDateDisplay(state.selectedDate);
    else if (state.viewType === 'DATE_RANGE') scopeLabel = `${formatDateDisplay(state.dateFrom)} ➔ ${formatDateDisplay(state.dateTo)}`;
    else if (state.viewType === 'ENTIRE_MONTH') {
      const [y, m] = state.selectedMonth.split('-');
      scopeLabel = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
    }

    const filterNameMap = {
      ALL: 'All',
      NEW: 'New Dispatches',
      PROFIT: 'Profit Trips',
      LOSS: 'Loss Trips',
      PENDING: 'Pending Balance',
      PARTIAL: 'Partially Paid',
      PAID: 'Paid & Settled',
      BALANCE_MISMATCH: '⚠️ Balance Mismatch'
    };

    subHeading.textContent = `${scopeLabel} • ${filterNameMap[state.statusFilter] || 'All'}`;
  }

  const tbody = document.getElementById('trips-tbody');
  if (!tbody) return;

  if (!trips.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="27" class="text-center py-12 px-4 text-gray-400 font-medium">
          No trip records found for the current selection. Choose a different date, month, or status filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = trips.map((t, idx) => {
    const isProfit = t.netPL >= 0;
    const plBadge = isProfit 
      ? `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300">P +${formatCurrency(t.netPL)}</span>`
      : `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-300">L -${formatCurrency(Math.abs(t.netPL))}</span>`;

    // Visual Status Tags
    let statusBadge = '';
    if (t.status === 'New') {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">🆕 New</span>`;
    } else if (t.status === 'Paid') {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300">🟢 Paid</span>`;
    } else if (t.status === 'Partially Paid') {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-50 text-orange-800 border border-orange-300">🟡 Partially Paid</span>`;
    } else {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-300">🟠 Pending</span>`;
    }

    // Balance cell with mismatch indicator
    let balanceDisplay = formatCurrency(t.balance);
    if (t.hasBalanceMismatch) {
      balanceDisplay = `
        <div class="flex items-center justify-end gap-1.5">
          <span class="text-rose-600 font-black">${formatCurrency(t.balance)}</span>
          <span class="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-800 rounded border border-rose-300" title="Expected: ${formatCurrency(t.freight - t.totalExpGiven)}">⚠️ Mismatch</span>
        </div>
      `;
    }

    const isSelected = state.selectedTripId === t.id;

    return `
      <tr id="trip-row-${t.id}" class="transition hover:bg-blue-50/40 text-sm font-semibold ${isSelected ? 'bg-blue-100/70 ring-2 ring-blue-500' : ''} ${t.netPL < 0 && !isSelected ? 'bg-rose-50/20' : ''} ${t.hasBalanceMismatch && !isSelected ? 'bg-amber-50/20' : ''}">
        
        <!-- Dedicated ACTIONS (View, Edit, Delete) BEFORE S.No (Sticky Left) -->
        <td class="py-3 px-3 text-center whitespace-nowrap bg-blue-50/70 sticky left-0 z-10 border-r border-blue-200 shadow-xs">
          <div class="inline-flex items-center gap-1 justify-center">
            <button onclick="viewTripDetails(${t.id})" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black text-blue-700 bg-white border border-blue-200 hover:bg-blue-600 hover:text-white transition shadow-2xs cursor-pointer" title="View Full Trip Details & Breakdown">
              <span>👁️ View</span>
            </button>
            <button onclick="promptEditTrip(${t.id})" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 transition shadow-2xs cursor-pointer" title="Edit Trip">
              <span>✏️ Edit</span>
            </button>
            ${canDelete() ? `
            <button onclick="promptDeleteTrip(${t.id})" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Delete Trip">
              <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
            ` : ''}
          </div>
        </td>

        <!-- 1. S.No -->
        <td class="py-3.5 px-3.5 text-center font-mono text-gray-500 font-bold">${t.sNo || idx + 1}</td>
        
        <!-- 2. Trip Date -->
        <td class="py-3.5 px-3.5 whitespace-nowrap font-bold text-gray-900">${formatDateDisplay(t.tripDate)}</td>
        
        <!-- 3. Vehicle No -->
        <td class="py-3.5 px-3.5 whitespace-nowrap">
          <span class="px-2.5 py-1 font-mono text-xs font-black bg-blue-50 text-blue-700 rounded-lg border border-blue-200">${t.vehicleNo}</span>
        </td>
        
        <!-- 4. From -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-gray-800">${t.from || '-'}</td>
        
        <!-- 5. To -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-gray-800">${t.to || '-'}</td>
        
        <!-- 6. Freight Amount -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap font-black text-gray-900">${formatCurrency(t.freight)}</td>
        
        <!-- 7. Advance Date -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-gray-500 text-center">${formatDateDisplay(t.advanceDate)}</td>
        
        <!-- 8. Advance Amount -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.advance)}</td>
        
        <!-- 9. Halting Details -->
        <td class="py-3.5 px-3.5 text-gray-500 max-w-[180px] truncate" title="${t.halting || ''}">${t.halting || '-'}</td>
        
        <!-- 10. TRSP Name -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-center">
          <span class="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-800 rounded-md border border-gray-200">${t.trspName || '-'}</span>
        </td>
        
        <!-- 11. TRSP Comm -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.trspCommission)}</td>
        
        <!-- 12. Diesel -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.diesel)}</td>
        
        <!-- 13. Toll Charges -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.toll)}</td>
        
        <!-- 14. Loading Charges -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.loading)}</td>
        
        <!-- 15. Unloading Charges -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.unloading)}</td>
        
        <!-- 16. Police Exp -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.police)}</td>
        
        <!-- 17. RTA C/P -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.rta)}</td>
        
        <!-- 18. Other Expenses -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.other)}</td>
        
        <!-- 19. Driver Trip Commission -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap font-bold text-gray-900">${formatCurrency(t.driverCommission)}</td>
        
        <!-- 20. Sum OF Total Exp -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap font-black text-indigo-700 bg-indigo-50/40">${formatCurrency(t.totalExpenses)}</td>
        
        <!-- 21. Total Exp Given -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap font-black text-purple-700 bg-purple-50/40">${formatCurrency(t.totalExpGiven)}</td>
        
        <!-- 22. Status Display -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-center">
          ${statusBadge}
        </td>
        
        <!-- 23. P/L -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-center">
          ${plBadge}
        </td>
        
        <!-- 24. Date Balance Received -->
        <td class="py-3.5 px-3.5 whitespace-nowrap text-center text-gray-600 font-semibold">${formatDateDisplay(t.balanceReceivedDate)}</td>

        <!-- 25. Balance Amount -->
        <td class="py-3.5 px-3.5 text-right whitespace-nowrap font-black text-amber-700 bg-amber-50/40">${balanceDisplay}</td>
        
        <!-- Row Actions (Separated from business data columns) -->
        <td class="py-3.5 px-3.5 text-center whitespace-nowrap bg-gray-50/50">
          <div class="inline-flex items-center gap-1.5 justify-center">
            <button onclick="promptEditTrip(${t.id})" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 transition cursor-pointer shadow-xs" title="Edit Trip">
              <span>✏️ Edit</span>
            </button>
            ${canDelete() ? `
            <button onclick="promptDeleteTrip(${t.id})" class="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition cursor-pointer" title="Delete Trip">
              <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// Trip Details Viewer Engine (Displayed Below the Master Table)
// ==========================================================================

function getEmptyDetailsHTML() {
  return `
    <div class="py-10 px-6 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/60">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-xs mb-3">
        🚛
      </div>
      <h3 class="text-sm font-black text-gray-900 uppercase tracking-wider">Trip Details & Audit Ledger</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto mt-1 font-medium">
        Click <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black text-blue-700 bg-blue-50 border border-blue-200">👁️ View</span> on any trip row in the table above to inspect the complete operational ledger, all 9 en-route expense breakdowns, and profit analysis right here.
      </p>
    </div>
  `;
}

window.viewTripDetails = function(tripId) {
  const trip = state.trips.find(t => t.id === Number(tripId) || t.sNo === Number(tripId) || t.sNo === String(tripId));
  if (!trip) return;

  state.selectedTripId = trip.id;

  // Highlight selected row in table
  document.querySelectorAll('#trips-tbody tr').forEach(row => {
    row.classList.remove('bg-blue-100/70', 'ring-2', 'ring-blue-500');
  });
  const activeRow = document.getElementById(`trip-row-${trip.id}`);
  if (activeRow) {
    activeRow.classList.add('bg-blue-100/70', 'ring-2', 'ring-blue-500');
  }

  renderTripDetails(trip);

  // Smooth scroll to the details panel below the sheet
  const panel = document.getElementById('trip-details-panel');
  if (panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

function closeTripDetails() {
  state.selectedTripId = null;
  document.querySelectorAll('#trips-tbody tr').forEach(row => {
    row.classList.remove('bg-blue-100/70', 'ring-2', 'ring-blue-500');
  });
  const container = document.getElementById('trip-details-content');
  if (container) {
    container.innerHTML = getEmptyDetailsHTML();
  }
}
window.closeTripDetails = closeTripDetails;

function renderTripDetails(t) {
  const container = document.getElementById('trip-details-content');
  if (!container) return;

  const isProfit = t.netPL >= 0;
  const plLabel = isProfit ? `P +${formatCurrency(t.netPL)}` : `L -${formatCurrency(Math.abs(t.netPL))}`;
  const marginPct = t.freight > 0 ? ((t.netPL / t.freight) * 100).toFixed(1) : 0;
  const getPct = (val) => t.totalExpenses > 0 ? ((val / t.totalExpenses) * 100).toFixed(1) + '%' : '0%';

  // Status Badge for Executive Header
  let statusBadge = '';
  if (t.status === 'New') {
    statusBadge = `<span class="px-3.5 py-1 text-xs font-black rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-xs flex items-center gap-1.5"><span>🆕</span> NEW DISPATCH</span>`;
  } else if (t.status === 'Paid') {
    statusBadge = `<span class="px-3.5 py-1 text-xs font-black rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs flex items-center gap-1.5"><span>🟢</span> PAID & SETTLED</span>`;
  } else if (t.status === 'Partially Paid') {
    statusBadge = `<span class="px-3.5 py-1 text-xs font-black rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/40 shadow-xs flex items-center gap-1.5"><span>🟡</span> PARTIALLY PAID</span>`;
  } else {
    statusBadge = `<span class="px-3.5 py-1 text-xs font-black rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5"><span>🟠</span> PENDING BALANCE</span>`;
  }

  // Mismatch Alert Box
  let mismatchBanner = '';
  if (t.hasBalanceMismatch) {
    const expected = t.freight - t.totalExpGiven;
    mismatchBanner = `
      <div class="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-rose-50 to-red-50 border-2 border-red-400 flex items-start gap-3.5 text-red-950 shadow-sm">
        <span class="text-2xl mt-0.5">⚠️</span>
        <div class="flex-1">
          <div class="text-xs font-black uppercase tracking-wider text-red-800">Financial Audit Alert &bull; Balance Discrepancy Detected</div>
          <div class="text-xs font-semibold text-red-900 mt-1 leading-relaxed">
            Recorded Balance is <span class="px-2 py-0.5 bg-red-100 rounded-md font-mono font-black text-red-950">${formatCurrency(t.balance)}</span>, 
            but Contract Freight (<strong class="font-mono">${formatCurrency(t.freight)}</strong>) &minus; Total Expenses Given (<strong class="font-mono">${formatCurrency(t.totalExpGiven)}</strong>) equals <span class="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-mono font-black">${formatCurrency(expected)}</span>. 
            Please review with the transport broker or adjust this record.
          </div>
        </div>
        <button onclick="promptEditTrip(${t.id})" class="px-3 py-1.5 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs cursor-pointer">Fix Now</button>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      
      <!-- =================================================================== -->
      <!-- EXECUTIVE HERO HEADER                                               -->
      <!-- =================================================================== -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/60 relative overflow-hidden">
        
        <!-- Background Glow Accent -->
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
          
          <!-- Vehicle & Station Info -->
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 rounded-xl font-mono font-black text-xs shadow-2xs tracking-wider">
                TRIP #${t.sNo || t.id}
              </span>
              <h3 class="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                ${t.vehicleNo}
              </h3>
              ${statusBadge}
            </div>

            <!-- Origin & Destination Banner -->
            <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-white">
                <span>📍 From:</span> <strong class="text-cyan-300">${t.from || '-'}</strong>
              </span>
              <span class="text-cyan-400 font-black text-base">➔</span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-white">
                <span>🏁 To:</span> <strong class="text-cyan-300">${t.to || '-'}</strong>
              </span>
              <span class="text-xs text-slate-400 ml-1 font-medium">
                &bull; Dispatched on <strong class="text-slate-200">${formatDateDisplay(t.tripDate)}</strong>
              </span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2.5">
            <button onclick="promptEditTrip(${t.id})" class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition active:scale-95 cursor-pointer">
              <span>✏️ Edit This Trip</span>
            </button>
            <button onclick="closeTripDetails()" class="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition cursor-pointer" title="Close Details">
              <span>✕ Close</span>
            </button>
          </div>

        </div>
      </div>

      ${mismatchBanner}

      <!-- =================================================================== -->
      <!-- 6 FINANCIAL RECONCILIATION CARDS                                    -->
      <!-- =================================================================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        <!-- Card 1: 6. Freight Amount -->
        <div class="bg-gradient-to-br from-indigo-500/10 via-blue-50/50 to-white border-2 border-indigo-200/90 rounded-2xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-indigo-900">6. Freight Amount</span>
            <span class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">💰</span>
          </div>
          <div class="text-xl font-black font-mono text-indigo-950 mt-1.5 tracking-tight">
            ${formatCurrency(t.freight)}
          </div>
          <div class="mt-2 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Trip Date:</span>
            <strong class="text-gray-800">${formatDateDisplay(t.tripDate)}</strong>
          </div>
        </div>

        <!-- Card 2: 8. Advance Amount -->
        <div class="bg-gradient-to-br from-teal-500/10 via-emerald-50/50 to-white border-2 border-teal-200/90 rounded-2xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-teal-900">8. Advance Amount</span>
            <span class="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs">💵</span>
          </div>
          <div class="text-xl font-black font-mono text-teal-950 mt-1.5 tracking-tight">
            ${formatCurrency(t.advance)}
          </div>
          <div class="mt-2 pt-2 border-t border-teal-100 flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Advance Date:</span>
            <strong class="text-teal-800">${formatDateDisplay(t.advanceDate)}</strong>
          </div>
        </div>

        <!-- Card 3: 20. Sum OF Total Exp -->
        <div class="bg-gradient-to-br from-blue-500/10 via-indigo-50/50 to-white border-2 border-indigo-300 rounded-2xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-indigo-900">20. Sum OF Total Exp</span>
            <span class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">🧾</span>
          </div>
          <div class="text-xl font-black font-mono text-indigo-700 mt-1.5 tracking-tight">
            ${formatCurrency(t.totalExpenses)}
          </div>
          <div class="mt-2 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Sum of 9 Exp:</span>
            <strong class="text-indigo-800">${formatCurrency(t.totalExpenses)}</strong>
          </div>
        </div>

        <!-- Card 4: 21. Total Exp Given -->
        <div class="bg-gradient-to-br from-purple-500/10 via-purple-50/50 to-white border-2 border-purple-300 rounded-2xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-purple-900">21. Total Exp Given</span>
            <span class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs">📦</span>
          </div>
          <div class="text-xl font-black font-mono text-purple-700 mt-1.5 tracking-tight">
            ${formatCurrency(t.totalExpGiven)}
          </div>
          <div class="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Adv + Expenses</span>
            <strong class="text-purple-800 font-bold">Sum Given</strong>
          </div>
        </div>

        <!-- Card 5: 23. Net P/L -->
        <div class="${isProfit ? 'bg-gradient-to-br from-emerald-500/15 via-green-50 to-white border-2 border-emerald-400' : 'bg-gradient-to-br from-rose-500/15 via-red-50 to-white border-2 border-rose-400'} rounded-2xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider ${isProfit ? 'text-emerald-950' : 'text-rose-950'}">23. Net P/L</span>
            <span class="px-1.5 py-0.5 text-[9px] font-black rounded ${isProfit ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}">
              ${marginPct}%
            </span>
          </div>
          <div class="text-xl font-black font-mono ${isProfit ? 'text-emerald-700' : 'text-rose-700'} mt-1.5 tracking-tight">
            ${plLabel}
          </div>
          <div class="mt-2 pt-2 border-t ${isProfit ? 'border-emerald-100' : 'border-rose-100'} flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Freight - Given</span>
            <strong class="${isProfit ? 'text-emerald-800' : 'text-rose-800'} font-bold">Margin</strong>
          </div>
        </div>

        <!-- Card 6: 25. Balance Amount -->
        <div class="${t.hasBalanceMismatch ? 'bg-gradient-to-br from-rose-500/15 via-red-50 to-white border-2 border-rose-400' : 'bg-gradient-to-br from-amber-500/10 via-orange-50/50 to-white border-2 border-amber-300'} rounded-2xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider ${t.hasBalanceMismatch ? 'text-red-900' : 'text-amber-900'}">
              25. Balance Amount
            </span>
            <span class="w-7 h-7 rounded-lg ${t.hasBalanceMismatch ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center text-xs">⏳</span>
          </div>
          <div class="text-xl font-black font-mono ${t.hasBalanceMismatch ? 'text-red-700' : 'text-amber-950'} mt-1.5 tracking-tight">
            ${formatCurrency(t.balance)}
          </div>
          <div class="mt-2 pt-2 ${t.hasBalanceMismatch ? 'border-red-200' : 'border-amber-100'} border-t flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Date Recd:</span>
            <strong class="font-semibold text-gray-900">${formatDateDisplay(t.balanceReceivedDate)}</strong>
          </div>
        </div>

      </div>

      <!-- =================================================================== -->
      <!-- ITEMIZED EN-ROUTE EXPENSES (9 INDIVIDUAL ACCENT CARDS)               -->
      <!-- =================================================================== -->
      <div class="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🧾</span>
            <div>
              <h4 class="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                Itemized En-Route Expenses Ledger (9 Categories)
              </h4>
              <p class="text-[11px] text-gray-500 font-medium">Complete breakdown across all 9 logistical expense categories</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-500 uppercase">20. Sum OF Total Exp:</span>
            <span class="px-3.5 py-1 text-sm font-black font-mono text-indigo-800 bg-indigo-50 border border-indigo-300 rounded-xl shadow-2xs">
              ${formatCurrency(t.totalExpenses)}
            </span>
          </div>
        </div>

        <!-- 9 Colorful Category Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          <!-- 11. Transport Broker Commission -->
          <div class="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-base shadow-2xs">🤝</span>
              <div>
                <div class="text-xs font-bold text-gray-800">11. TRSP Commission</div>
                <div class="text-[10px] text-purple-700 font-semibold">${getPct(t.trspCommission)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-purple-950">${formatCurrency(t.trspCommission)}</span>
          </div>

          <!-- 12. Diesel / Fuel -->
          <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base shadow-2xs">⛽</span>
              <div>
                <div class="text-xs font-bold text-gray-800">12. Diesel / Fuel</div>
                <div class="text-[10px] text-amber-700 font-semibold">${getPct(t.diesel)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-amber-950">${formatCurrency(t.diesel)}</span>
          </div>

          <!-- 13. Toll Charges -->
          <div class="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-base shadow-2xs">🛣️</span>
              <div>
                <div class="text-xs font-bold text-gray-800">13. Toll & FASTag Charges</div>
                <div class="text-[10px] text-sky-700 font-semibold">${getPct(t.toll)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-sky-950">${formatCurrency(t.toll)}</span>
          </div>

          <!-- 14. Loading Charges -->
          <div class="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-base shadow-2xs">📦</span>
              <div>
                <div class="text-xs font-bold text-gray-800">14. Loading Labour Charges</div>
                <div class="text-[10px] text-teal-700 font-semibold">${getPct(t.loading)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-teal-950">${formatCurrency(t.loading)}</span>
          </div>

          <!-- 15. Unloading Charges -->
          <div class="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center text-base shadow-2xs">🚚</span>
              <div>
                <div class="text-xs font-bold text-gray-800">15. Unloading Charges</div>
                <div class="text-[10px] text-cyan-700 font-semibold">${getPct(t.unloading)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-cyan-950">${formatCurrency(t.unloading)}</span>
          </div>

          <!-- 16. Police Exp -->
          <div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-base shadow-2xs">👮</span>
              <div>
                <div class="text-xs font-bold text-gray-800">16. Police Checkpoint Exp</div>
                <div class="text-[10px] text-rose-700 font-semibold">${getPct(t.police)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-rose-950">${formatCurrency(t.police)}</span>
          </div>

          <!-- 17. RTA C/P -->
          <div class="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-base shadow-2xs">🛑</span>
              <div>
                <div class="text-xs font-bold text-gray-800">17. RTA / State Checkpost</div>
                <div class="text-[10px] text-orange-700 font-semibold">${getPct(t.rta)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-orange-950">${formatCurrency(t.rta)}</span>
          </div>

          <!-- 18. Other Expenses -->
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-base shadow-2xs">🔧</span>
              <div>
                <div class="text-xs font-bold text-gray-800">18. Other En-Route Costs</div>
                <div class="text-[10px] text-gray-500 font-semibold">${getPct(t.other)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-slate-900">${formatCurrency(t.other)}</span>
          </div>

          <!-- 19. Driver Commission -->
          <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-base shadow-2xs">🧑‍✈️</span>
              <div>
                <div class="text-xs font-bold text-gray-800">19. Driver Trip Commission</div>
                <div class="text-[10px] text-indigo-700 font-semibold">${getPct(t.driverCommission)} of expenses</div>
              </div>
            </div>
            <span class="text-sm font-black font-mono text-indigo-950">${formatCurrency(t.driverCommission)}</span>
          </div>

        </div>
      </div>

      <!-- =================================================================== -->
      <!-- OPERATIONAL LOGISTICS NOTES (HALTING & BROKER DETAILS)              -->
      <!-- =================================================================== -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Halting & Demurrage Details -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 flex items-start gap-3">
          <span class="w-9 h-9 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center text-base shadow-2xs mt-0.5">⏱️</span>
          <div class="flex-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-500 block">9. Halting & Transit Delay Notes</span>
            <p class="text-xs font-semibold text-gray-800 mt-1 leading-relaxed">${t.halting || 'No halting delays recorded for this trip dispatch.'}</p>
          </div>
        </div>

        <!-- Transport Broker / Agency Details -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 flex items-start gap-3">
          <span class="w-9 h-9 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center text-base shadow-2xs mt-0.5">🏢</span>
          <div class="flex-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-500 block">10. Transport Broker / Agency (TRSP)</span>
            <p class="text-xs font-bold text-gray-900 mt-1">
              ${t.trspName ? `<span class="px-2.5 py-1 bg-white border border-gray-300 rounded-lg shadow-2xs">${t.trspName}</span>` : '<span class="text-gray-400">Direct Dispatch (No third-party broker recorded)</span>'}
            </p>
          </div>
        </div>

      </div>

    </div>
  `;
}

// ==========================================================================
// 5. Add Trip Modal & Real-Time Calculation Engine
// ==========================================================================

window.openAddTripModal = function() {
  const modal = document.getElementById('modal-add-trip');
  if (!modal) return;

  const tripDateEl = document.getElementById('add-trip-date');
  if (tripDateEl) tripDateEl.value = getTodayISO();

  const resetIds = [
    'add-vehicle', 'add-from', 'add-to', 'add-freight', 'add-advance-date',
    'add-advance', 'add-halting', 'add-trsp-name', 'add-trsp-comm', 'add-diesel',
    'add-toll', 'add-loading', 'add-unloading', 'add-police', 'add-rta',
    'add-other', 'add-driver-comm', 'add-status-amount'
  ];
  resetIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const statusEl = document.getElementById('add-status');
  if (statusEl) statusEl.value = 'New';
  handleAddStatusChange();

  updateAddTripCalculations();
  modal.classList.remove('hidden');
};

window.closeAddTripModal = function() {
  const modal = document.getElementById('modal-add-trip');
  if (modal) modal.classList.add('hidden');
};

window.handleAddStatusChange = function() {
  const statusEl = document.getElementById('add-status');
  const box = document.getElementById('add-status-amount-box');
  if (statusEl && box) {
    if (statusEl.value === 'Partially Paid') {
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
    }
  }
  updateAddTripCalculations();
};

window.updateAddTripCalculations = function() {
  const getNum = (id) => Number(document.getElementById(id)?.value) || 0;
  const getStr = (id) => document.getElementById(id)?.value?.trim() || '';

  const freight = getNum('add-freight');
  const advance = getNum('add-advance');

  const trspComm = getNum('add-trsp-comm');
  const diesel = getNum('add-diesel');
  const toll = getNum('add-toll');
  const loading = getNum('add-loading');
  const unloading = getNum('add-unloading');
  const police = getNum('add-police');
  const rta = getNum('add-rta');
  const other = getNum('add-other');
  const driverComm = getNum('add-driver-comm');

  // 20. Sum OF Total Exp (9 expenses)
  const totalExpenses = trspComm + diesel + toll + loading + unloading + police + rta + other + driverComm;

  // 21. Total Exp Given = Advance + Total Expenses
  const totalExpGiven = advance + totalExpenses;

  // 23. P/L = Freight - Total Exp Given
  const netPL = freight - totalExpGiven;

  // 25. Balance Amount = Freight - Total Exp Given
  const balance = freight - totalExpGiven;

  const elBal = document.getElementById('calc-preview-balance');
  const elExp = document.getElementById('calc-preview-expenses');
  const elExpGiven = document.getElementById('calc-preview-exp-given');
  const elPL = document.getElementById('calc-preview-pl');

  if (elBal) elBal.textContent = formatCurrency(balance);
  if (elExp) elExp.textContent = formatCurrency(totalExpenses);
  if (elExpGiven) elExpGiven.textContent = formatCurrency(totalExpGiven);

  if (elPL) {
    if (netPL >= 0) {
      elPL.className = 'text-base font-black text-emerald-600 font-mono';
      elPL.textContent = `P +${formatCurrency(netPL)}`;
    } else {
      elPL.className = 'text-base font-black text-rose-600 font-mono';
      elPL.textContent = `L -${formatCurrency(Math.abs(netPL))}`;
    }
  }
};

window.promptSaveNewTrip = function() {
  const tripDate = document.getElementById('add-trip-date')?.value;
  const vehicle = document.getElementById('add-vehicle')?.value?.trim();
  const from = document.getElementById('add-from')?.value?.trim();
  const to = document.getElementById('add-to')?.value?.trim();
  const freight = Number(document.getElementById('add-freight')?.value) || 0;

  if (!tripDate || !vehicle || !from || !to || freight <= 0) {
    alert('Please fill in required fields: Trip Date, Vehicle No, From, To, and Freight Amount (> 0).');
    return;
  }

  openModal('modal-confirm-add');
};

async function executeSaveNewTrip() {
  closeModal('modal-confirm-add');

  const getNum = (id) => Number(document.getElementById(id)?.value) || 0;
  const getStr = (id) => document.getElementById(id)?.value?.trim() || '';

  const newId = state.trips.length ? Math.max(...state.trips.map(t => t.id || 0)) + 1 : 1;
  const newSNo = state.trips.filter(t => !t.deleted).length + 1;

  const rawTrip = {
    id: newId,
    sNo: newSNo,
    tripDate: getStr('add-trip-date') || getTodayISO(),
    vehicleNo: getStr('add-vehicle').toUpperCase(),
    from: getStr('add-from'),
    to: getStr('add-to'),
    freight: getNum('add-freight'),
    advanceDate: getStr('add-advance-date'),
    advance: getNum('add-advance'),
    halting: getStr('add-halting'),
    trspName: getStr('add-trsp-name') || 'Direct',
    trspCommission: getNum('add-trsp-comm'),
    diesel: getNum('add-diesel'),
    toll: getNum('add-toll'),
    loading: getNum('add-loading'),
    unloading: getNum('add-unloading'),
    police: getNum('add-police'),
    rta: getNum('add-rta'),
    other: getNum('add-other'),
    driverCommission: getNum('add-driver-comm'),
    status: getStr('add-status') || 'New',
    balanceReceivedDate: getStr('add-balance-date'),
    deleted: false
  };

  const newTripId = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'TR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
  const calculated = calculateTrip({
    ...rawTrip,
    tripId: newTripId
  });
  
  pendingMutationCount++;
  isSaving = true;

  // Clean addition: push to end so S.No remains chronologically ordered (1, 2, 3, 4, 5...)
  state.trips.push(calculated);
  saveTrips();

  // Create local snapshot backup
  BackupModule.onRecordMutated(`Add Trip #${newSNo} (${calculated.vehicleNo})`);

  closeAddTripModal();
  updateSidebarCounters();
  renderTableOnly();
  showToast(`✅ Trip #${newSNo} (${calculated.vehicleNo}) added.`);

  try {
    await sendCloudMutation('addTrip', calculated);
    lastSuccessfulMutation = Date.now();
    broadcastDataChange();
  } catch (err) {
    console.warn('Cloud addTrip note:', err);
  } finally {
    pendingMutationCount--;
    if (pendingMutationCount <= 0) {
      pendingMutationCount = 0;
      isSaving = false;
    }
  }
}
window.executeSaveNewTrip = executeSaveNewTrip;

// ==========================================================================
// 6. Confirmation Popups & Modal Workflows (Edit & Delete)
// ==========================================================================

function setupModals() {
  const modalAddConfirm = document.getElementById('modal-add-confirm');
  const modalAddCancel = document.getElementById('modal-add-cancel');
  if (modalAddConfirm) {
    modalAddConfirm.addEventListener('click', () => {
      executeSaveNewTrip();
    });
  }
  if (modalAddCancel) {
    modalAddCancel.addEventListener('click', () => {
      closeModal('modal-confirm-add');
    });
  }

  const modalEditConfirm = document.getElementById('modal-edit-confirm');
  const modalEditCancel = document.getElementById('modal-edit-cancel');
  if (modalEditConfirm) {
    modalEditConfirm.addEventListener('click', () => {
      closeModal('modal-confirm-edit');
      if (state.pendingEditTripId) {
        openEditSlideOver(state.pendingEditTripId);
      }
    });
  }
  if (modalEditCancel) {
    modalEditCancel.addEventListener('click', () => {
      closeModal('modal-confirm-edit');
      state.pendingEditTripId = null;
    });
  }

  const modalSaveConfirm = document.getElementById('modal-save-confirm');
  const modalSaveCancel = document.getElementById('modal-save-cancel');
  if (modalSaveConfirm) {
    modalSaveConfirm.addEventListener('click', () => {
      closeModal('modal-confirm-save');
      executeSaveTripEdits();
    });
  }
  if (modalSaveCancel) {
    modalSaveCancel.addEventListener('click', () => {
      closeModal('modal-confirm-save');
    });
  }

  const modalDeleteConfirm = document.getElementById('modal-delete-confirm');
  const modalDeleteCancel = document.getElementById('modal-delete-cancel');
  if (modalDeleteConfirm) {
    modalDeleteConfirm.addEventListener('click', () => {
      closeModal('modal-confirm-delete');
      executeDeleteTrip();
    });
  }
  if (modalDeleteCancel) {
    modalDeleteCancel.addEventListener('click', () => {
      closeModal('modal-confirm-delete');
      state.pendingDeleteTripId = null;
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

window.promptEditTrip = function(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  state.pendingEditTripId = idNum;
  const msgEl = document.getElementById('modal-edit-message');
  if (msgEl) {
    msgEl.textContent = `Are you sure you want to edit Trip #${trip.sNo || idNum} (${trip.vehicleNo})?`;
  }
  openModal('modal-confirm-edit');
};

window.promptSaveTripEdits = function() {
  openModal('modal-confirm-save');
};

window.promptDeleteTrip = function(tripId) {
  if (!canDelete()) {
    showToast('❌ You do not have permission to delete trips.');
    return;
  }
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  state.pendingDeleteTripId = idNum;
  const msgEl = document.getElementById('modal-delete-message');
  if (msgEl) {
    msgEl.textContent = `Are you sure you want to delete Trip #${trip.sNo || idNum} (${trip.vehicleNo})?`;
  }
  openModal('modal-confirm-delete');
};

async function executeDeleteTrip() {
  if (!canDelete()) {
    showToast('❌ You do not have permission to delete trips.');
    closeModal('modal-confirm-delete');
    return;
  }
  if (!state.pendingDeleteTripId) return;
  const idNum = Number(state.pendingDeleteTripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  pendingMutationCount++;
  isSaving = true;

  trip.deleted = true;
  state.trips = state.trips.filter(t => !t.deleted);
  saveTrips();
  updateSidebarCounters();
  renderTableOnly();

  // Create point-in-time snapshot backup
  BackupModule.onRecordMutated(`Delete Trip #${trip.sNo || idNum} (${trip.vehicleNo})`);

  showToast(`✅ Trip #${trip.sNo || idNum} (${trip.vehicleNo}) deleted successfully.`);
  state.pendingDeleteTripId = null;

  try {
    await sendCloudMutation('deleteTrip', {
      id: trip.id,
      tripId: trip.tripId,
      sNo: trip.sNo,
      vehicleNo: trip.vehicleNo,
      role: state.currentRole,
      user: state.currentUser
    });
    lastSuccessfulMutation = Date.now();
    broadcastDataChange();
  } catch (err) {
    console.warn('Cloud deleteTrip note:', err);
  } finally {
    pendingMutationCount--;
    if (pendingMutationCount <= 0) {
      pendingMutationCount = 0;
      isSaving = false;
    }
  }
}

// ==========================================================================
// 7. Slide-Over Drawer Events (Edit)
// ==========================================================================

function setupSlideOverEvents() {
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeSlideOver);
  }
}

function openEditSlideOver(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  const backdrop = document.getElementById('drawer-backdrop');
  const panel = document.getElementById('drawer-panel');

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  setVal('edit-trip-date', trip.tripDate || '');
  setVal('edit-vehicle', trip.vehicleNo || '');
  setVal('edit-from', trip.from || '');
  setVal('edit-to', trip.to || '');
  setVal('edit-freight', trip.freight || 0);
  setVal('edit-advance-date', trip.advanceDate || '');
  setVal('edit-advance', trip.advance || 0);
  setVal('edit-halting', trip.halting || '');
  setVal('edit-trsp-name', trip.trspName || '');
  setVal('edit-trsp-commission', trip.trspCommission || 0);
  setVal('edit-diesel', trip.diesel || 0);
  setVal('edit-toll', trip.toll || 0);
  setVal('edit-loading', trip.loading || 0);
  setVal('edit-unloading', trip.unloading || 0);
  setVal('edit-police', trip.police || 0);
  setVal('edit-rta', trip.rta || 0);
  setVal('edit-other', trip.other || 0);
  setVal('edit-driver-comm', trip.driverCommission || 0);
  setVal('edit-status', trip.status || 'Pending');
  setVal('edit-balance-date', trip.balanceReceivedDate || '');
  setVal('edit-balance', trip.balance !== undefined && trip.balance !== null ? trip.balance : '');

  if (backdrop && panel) {
    backdrop.classList.remove('hidden');
    panel.classList.remove('translate-x-full');
  }
}

window.closeSlideOver = function() {
  const backdrop = document.getElementById('drawer-backdrop');
  const panel = document.getElementById('drawer-panel');
  if (backdrop && panel) {
    panel.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
  state.pendingEditTripId = null;
};

async function executeSaveTripEdits() {
  if (!state.pendingEditTripId) return;
  const idNum = Number(state.pendingEditTripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  const getVal = (id, defaultVal = '') => {
    const el = document.getElementById(id);
    return el ? el.value : defaultVal;
  };
  const getNum = (id) => Number(getVal(id, 0)) || 0;

  trip.tripDate = getVal('edit-trip-date', trip.tripDate);
  trip.vehicleNo = getVal('edit-vehicle', trip.vehicleNo).trim().toUpperCase();
  trip.from = getVal('edit-from', trip.from).trim();
  trip.to = getVal('edit-to', trip.to).trim();
  trip.freight = getNum('edit-freight');
  trip.advanceDate = getVal('edit-advance-date', trip.advanceDate);
  trip.advance = getNum('edit-advance');
  trip.halting = getVal('edit-halting', trip.halting).trim();
  trip.trspName = getVal('edit-trsp-name', trip.trspName).trim();
  trip.trspCommission = getNum('edit-trsp-commission');
  trip.diesel = getNum('edit-diesel');
  trip.toll = getNum('edit-toll');
  trip.loading = getNum('edit-loading');
  trip.unloading = getNum('edit-unloading');
  trip.police = getNum('edit-police');
  trip.rta = getNum('edit-rta');
  trip.other = getNum('edit-other');
  trip.driverCommission = getNum('edit-driver-comm');
  trip.status = getVal('edit-status', trip.status);
  trip.balanceReceivedDate = getVal('edit-balance-date', trip.balanceReceivedDate || '');

  const customBal = getVal('edit-balance');
  if (customBal !== '') {
    trip.balance = Number(customBal);
  } else {
    delete trip.balance;
  }

  const recalculated = calculateTrip(trip);
  const idx = state.trips.findIndex(t => Number(t.id) === idNum);
  if (idx !== -1) {
    state.trips[idx] = recalculated;
  }

  pendingMutationCount++;
  isSaving = true;

  saveTrips();

  // Create point-in-time snapshot backup
  BackupModule.onRecordMutated(`Edit Trip #${recalculated.sNo || idNum} (${recalculated.vehicleNo})`);

  closeSlideOver();
  updateSidebarCounters();
  renderTableOnly();

  showToast(`✅ Trip #${recalculated.sNo || idNum} updated successfully & synced to cloud.`);

  try {
    await sendCloudMutation('updateTrip', recalculated);
    lastSuccessfulMutation = Date.now();
    broadcastDataChange();
  } catch (err) {
    console.warn('Cloud updateTrip note:', err);
  } finally {
    pendingMutationCount--;
    if (pendingMutationCount <= 0) {
      pendingMutationCount = 0;
      isSaving = false;
    }
  }
}

// ==========================================================================
// 8. Auto-Dismissing Toast Notification System
// ==========================================================================

function showToast(message, durationMs = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'flex items-center justify-between gap-3 px-4 py-3 bg-gray-900 text-white text-xs font-bold rounded-2xl shadow-xl border border-gray-700 pointer-events-auto animate-toast w-full max-w-sm';
  toast.innerHTML = `
    <span>${message}</span>
    <button class="text-gray-400 hover:text-white transition cursor-pointer select-none">✕</button>
  `;

  const closeBtn = toast.querySelector('button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

// ==========================================================================
// 9. True Excel (.xlsx) Export with Exact UI Colors & Auto-Fit Widths
// ==========================================================================

async function exportToExcel() {
  const trips = getDisplayTrips();
  if (!trips.length) {
    showToast('⚠️ No trip records available to export for this view.');
    return;
  }

  if (typeof ExcelJS === 'undefined') {
    showToast('❌ ExcelJS library not loaded. Please check your internet connection.');
    return;
  }

  showToast('⏳ Generating styled Excel spreadsheet...');

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SR_T Freight Management';
    workbook.lastModifiedBy = 'SR_T Fleet Engine';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Lorry Trips Reconciliation', {
      views: [{ showGridLines: true }]
    });

    const headers = [
      '1. S.No.', '2. Trip Date', '3. Vehicle No', '4. From', '5. To', '6. Freight Amount',
      '7. Advance Date', '8. Advance Amount', '9. Halting Details', '10. TRSP Name',
      '11. TRSP Commission', '12. Diesel', '13. Toll Charges', '14. Loading Charges', '15. Unloading Charges',
      '16. Police Exp', '17. RTA C/P', '18. Other Expenses', '19. Driver Trip Commission',
      '20. Sum OF Total Exp', '21. Total Exp Given', '22. Status', '23. P/L', '24. Date of Balance Recd',
      '25. Balance Amount'
    ];

    worksheet.columns = headers.map(h => ({ header: h, key: h, width: 16 }));

    // Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Professional Navy Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // Data Rows
    trips.forEach((t, idx) => {
      const plFormatted = t.netPL >= 0 ? `P +₹${t.netPL.toLocaleString('en-IN')}` : `L -₹${Math.abs(t.netPL).toLocaleString('en-IN')}`;

      const rowValues = [
        t.sNo || idx + 1,
        formatDateDisplay(t.tripDate),
        t.vehicleNo,
        t.from || '',
        t.to || '',
        t.freight,
        formatDateDisplay(t.advanceDate),
        t.advance,
        t.halting || '',
        t.trspName || '',
        t.trspCommission,
        t.diesel,
        t.toll,
        t.loading,
        t.unloading,
        t.police,
        t.rta,
        t.other,
        t.driverCommission,
        t.totalExpenses,
        t.totalExpGiven,
        t.status,
        plFormatted,
        formatDateDisplay(t.balanceReceivedDate),
        t.balance
      ];

      const row = worksheet.addRow(rowValues);
      row.height = 25;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10.5 };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        const numericCols = [6, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25];
        if (numericCols.includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '[$₹-4009]#,##0;([$₹-4009]#,##0);"-"';
        } else if ([1, 2, 7, 10, 24].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1D4ED8' } };
        }

        // Highlight Col 20: Sum OF Total Exp
        if (colNumber === 20) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
          cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF4338CA' } };
        }

        // Highlight Col 21: Total Exp Given
        if (colNumber === 21) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } };
          cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF6B21A8' } };
        }

        // Status Styling (Col 22)
        if (colNumber === 22) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (t.status === 'New') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF4338CA' } };
          } else if (t.status === 'Paid') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF047857' } };
          } else if (t.status === 'Partially Paid') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFC2410C' } };
          } else {
            // Pending
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFB45309' } };
          }
        }

        // P/L Styling (Col 23)
        if (colNumber === 23) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (t.netPL >= 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFB91C1C' } };
          }
        }

        // Highlight Col 25: Balance Amount
        if (colNumber === 25) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFB45309' } };
        }
      });
    });

    // Auto-Fit Column Widths
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        let cellLength = 0;
        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'number') {
            cellLength = cell.value.toLocaleString('en-IN').length + 4;
          } else {
            cellLength = String(cell.value).length;
          }
        }
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });

      const colIdx = Number(column.number);
      let safeMinWidth = 16;
      if (colIdx === 1) safeMinWidth = 8;
      else if (colIdx === 2 || colIdx === 7 || colIdx === 24) safeMinWidth = 16;
      else if (colIdx === 3) safeMinWidth = 16;
      else if (colIdx === 4 || colIdx === 5) safeMinWidth = 24;
      else if (colIdx === 9) safeMinWidth = 28;
      else if (colIdx === 10) safeMinWidth = 18;
      else if (colIdx === 20 || colIdx === 21) safeMinWidth = 18;
      else if (colIdx === 22) safeMinWidth = 16;
      else if (colIdx === 23) safeMinWidth = 18;
      else if (colIdx === 25) safeMinWidth = 18;

      column.width = Math.max(maxLength + 4, safeMinWidth);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lorry_Trips_${state.viewType}_${state.statusFilter}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`✅ Successfully exported ${trips.length} trips to true Excel (.xlsx).`);
  } catch (err) {
    console.error('Excel Export Error:', err);
    showToast(`❌ Excel export failed: ${err.message}`);
  }
}

// ==========================================================================
// 10. Google Apps Script Synchronization
// ==========================================================================

async function syncWithGoogleSheet() {
  if (!state.apiUrl) {
    openSettingsModal();
    return;
  }

  const syncBtn = document.getElementById('btn-sync');
  if (syncBtn) syncBtn.innerHTML = '🔄 Syncing...';
  lastLocalMutationTime = 0;

  try {
    const cleanUrl = state.apiUrl.trim();
    const fetchUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=getTrips` : `${cleanUrl}?action=getTrips`;
    const res = await fetch(fetchUrl);
    const text = await res.text();
    
    // Check if response is HTML instead of JSON (happens when Google redirects to sign-in page)
    if (text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('<!doctype html>')) {
      throw new Error("Web App returned Google Sign-in page. In Google Apps Script Manage Deployments, change 'Who has access' from 'Only myself' to 'Anyone'.");
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      throw new Error("Invalid response format from cloud server.");
    }

    if ((json.status === 'success' || json.success) && Array.isArray(json.data)) {
      if (json.data.length > 0) {
        state.trips = json.data.map((row, idx) => calculateTrip({
          id: idx + 1,
          sNo: row.sNo || idx + 1,
          tripDate: row.tripDate,
          vehicleNo: row.vehicleNo,
          from: row.from,
          to: row.to,
          freight: row.freight,
          advanceDate: row.advanceDate,
          advance: row.advance,
          balance: row.balance,
          halting: row.halting,
          trspName: row.trspName,
          trspCommission: row.trspCommission || 0,
          diesel: row.diesel || 0,
          toll: row.toll || 0,
          loading: row.loading || 0,
          unloading: row.unloading || 0,
          police: row.police || 0,
          rta: row.rta || 0,
          other: row.other || 0,
          driverCommission: row.driverCommission || 0,
          status: row.status || 'New',
          statusAmount: row.statusAmount !== undefined ? row.statusAmount : 0,
          balanceReceivedDate: row.balanceReceivedDate || '',
          balance: row.balance,
          tripId: row.tripId || ('TR-' + (row.sNo || idx + 1)),
          deleted: false
        }));

        saveTrips();
        renderScopeControls();
        render();
        broadcastDataChange();
        showToast(`☁️ Cloud Database: Synchronized ${state.trips.length} trips from Google Sheets!`);
      } else if (state.trips.length > 0) {
        // Cloud sheet is currently empty: Seed our existing trips into the Google Sheet!
        showToast(`☁️ First-Time Cloud Sync: Uploading ${state.trips.length} trips to Google Sheet...`);
        for (const trip of state.trips) {
          await sendCloudMutation('addTrip', trip);
        }
        showToast(`✅ Successfully uploaded ${state.trips.length} trips to cloud Google Sheet!`);
      }
    } else {
      throw new Error(json.message || 'Invalid server response format');
    }
  } catch (err) {
    // Self-healing: if error occurred on an old or cached URL, reset immediately to DEFAULT_CLOUD_API_URL!
    if (state.apiUrl !== DEFAULT_CLOUD_API_URL) {
      console.warn("Resetting outdated API URL in localStorage to default active deployment...");
      state.apiUrl = DEFAULT_CLOUD_API_URL;
      localStorage.setItem('lorry_api_url', DEFAULT_CLOUD_API_URL);
      return syncWithGoogleSheet();
    }
    if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
      showToast(`❌ Cloud Sync Error: Failed to fetch. Ensure Google Apps Script deployment has 'Who has access' set to 'Anyone' (not 'Only myself').`, 7000);
    } else {
      showToast(`❌ Cloud Sync Error: ${err.message}`, 6500);
    }
  } finally {
    if (syncBtn) {
      syncBtn.innerHTML = `
        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        <span>Sync</span>
      `;
    }
  }
}

function openSettingsModal() {
  if (!canAccessSettings()) {
    showToast('❌ You do not have permission to access Settings.');
    return;
  }
  const modal = document.getElementById('modal-settings');
  const input = document.getElementById('settings-api-url');
  const resultBox = document.getElementById('settings-test-result');
  if (resultBox) {
    resultBox.className = 'hidden';
    resultBox.textContent = '';
  }
  if (input) {
    input.value = state.apiUrl || DEFAULT_CLOUD_API_URL;
  }
  if (modal) {
    modal.classList.remove('hidden');
    BackupModule.renderUI();
  }
}

// Setup Cloud Settings Event Handlers
document.addEventListener('DOMContentLoaded', () => {
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnTestConnection = document.getElementById('btn-test-connection');
  const btnManualBackup = document.getElementById('btn-manual-cloud-backup');
  const apiUrlInput = document.getElementById('settings-api-url');
  const resultBox = document.getElementById('settings-test-result');

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      if (apiUrlInput) {
        state.apiUrl = apiUrlInput.value.trim();
        localStorage.setItem('lorry_api_url', state.apiUrl);
        closeModal('modal-settings');
        showToast('💾 Cloud database URL saved. Synchronizing...');
        syncWithGoogleSheet();
      }
    });
  }

  if (btnTestConnection) {
    btnTestConnection.addEventListener('click', async () => {
      const url = apiUrlInput ? apiUrlInput.value.trim() : state.apiUrl;
      if (!url) {
        showToast('⚠️ Please enter a Google Apps Script Web App URL first.');
        return;
      }

      if (resultBox) {
        resultBox.className = 'p-3 rounded-2xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 block';
        resultBox.textContent = '⏳ Testing cloud connection to Google Sheets...';
      }

      try {
        const fetchUrl = url.includes('?') ? `${url}&action=getTrips` : `${url}?action=getTrips`;
        const res = await fetch(fetchUrl);
        const text = await res.text();

        if (text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('<!doctype html>')) {
          if (resultBox) {
            resultBox.className = 'p-3 rounded-2xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 block';
            resultBox.innerHTML = `⚠️ <strong>Access Restricted:</strong> Google redirected to Sign-in page.<br>In Google Apps Script ➔ <strong>Manage deployments</strong> ➔ change <strong>'Who has access'</strong> from <em>'Only myself'</em> to <strong>'Anyone'</strong>.`;
          }
          return;
        }

        const data = JSON.parse(text);
        if (data.status === 'success' && Array.isArray(data.data)) {
          if (resultBox) {
            resultBox.className = 'p-3 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 block';
            resultBox.textContent = `✅ Success! Connected to Google Sheets. Found ${data.data.length} trips in database.`;
          }
        } else {
          if (resultBox) {
            resultBox.className = 'p-3 rounded-2xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 block';
            resultBox.textContent = `❌ Server response error: ${data.message || 'Unknown response'}`;
          }
        }
      } catch (err) {
        if (resultBox) {
          resultBox.className = 'p-3 rounded-2xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 block';
          resultBox.innerHTML = `❌ <strong>Connection failed:</strong> ${err.message}<br>Make sure 'Who has access' is set to 'Anyone' in Apps Script Manage Deployments.`;
        }
      }
    });
  }

  if (btnManualBackup) {
    btnManualBackup.addEventListener('click', async () => {
      const url = apiUrlInput ? apiUrlInput.value.trim() : state.apiUrl;
      if (!url) {
        showToast('⚠️ Please enter a Google Apps Script Web App URL first.');
        return;
      }
      showToast('⏳ Generating instant cloud backup in Google Drive...');
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createBackup',
            reason: 'Manual_Admin_Backup',
            user: state.currentUser || 'Admin',
            role: state.currentRole || 'Admin'
          })
        });
        const data = await res.json();
        if (data && data.success) {
          showToast(`✅ Cloud backup created: ${data.backupName}`);
        } else {
          showToast(`ℹ️ Snapshot backup captured.`);
        }
      } catch (e) {
        BackupModule.onRecordMutated('Manual_Admin_Snapshot');
        showToast('✅ Snapshot backup recorded.');
      }
    });
  }
});

// ==========================================================================
// 12. Real-Time Multi-User Cloud Sync Engine (Mirroring SR_T Architecture)
// ==========================================================================

// 1. Cross-Tab Live BroadcastChannel
const lorrySyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lorry_sync_channel') : null;
if (lorrySyncChannel) {
  lorrySyncChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'DATA_UPDATED') {
      loadTrips();
      render();
    }
  };
}

function broadcastDataChange() {
  if (lorrySyncChannel) {
    try {
      lorrySyncChannel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
    } catch (e) {
      // Ignored if channel closed
    }
  }
}

// 2. Robust Cloud Mutation Dispatcher (Mirroring SR_T Architecture)
let lastLocalMutationTime = 0;

async function sendCloudMutation(action, payload) {
  if (!state.apiUrl) return;
  lastLocalMutationTime = Date.now(); // Record mutation time to pause autoSync

  const body = JSON.stringify({
    action: action,
    data: payload,
    user: state.currentUser || 'User',
    role: state.currentRole || 'User',
    currentUser: state.currentUser,
    currentRole: state.currentRole,
    ...payload
  });

  try {
    // Send as CORS-safelisted text/plain with no-cors (Exact SR_T method)
    await fetch(state.apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body
    });
  } catch (err) {
    console.warn('Cloud mutation network note:', err);
  }
}

// 3. Background Cloud Auto-Sync (Every 4 Seconds & on Focus)
let isSyncingInBackground = false;
async function autoSyncCloud(isSilent = true) {
  if (!state.apiUrl || isSyncingInBackground || !window.navigator.onLine) return;
  if (!state.currentUser) return; // Only sync when logged in

  // Mutation Lock & Poller Mutex: Never overwrite pending mutations or right after mutation
  if (isSaving || pendingMutationCount > 0) {
    console.log("⏸️ Poll skipped: local mutation pending");
    return;
  }
  if (Date.now() - lastSuccessfulMutation < 4000) {
    return;
  }
  if (Date.now() - lastLocalMutationTime < 8000) {
    return;
  }

  // Don't interrupt user if they are currently filling out Add or Edit modal
  const addModal = document.getElementById('modal-add-trip');
  const editModal = document.getElementById('modal-edit-trip');
  if ((addModal && !addModal.classList.contains('hidden')) || 
      (editModal && !editModal.classList.contains('hidden'))) {
    return;
  }

  isSyncingInBackground = true;
  try {
    const cleanUrl = state.apiUrl.trim();
    const fetchUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=getTrips` : `${cleanUrl}?action=getTrips`;
    const res = await fetch(fetchUrl);
    const text = await res.text();
    if (!text.includes('accounts.google.com') && !text.includes('ServiceLogin')) {
      const json = JSON.parse(text);
      if (json && (json.status === 'success' || json.success) && Array.isArray(json.data) && json.data.length > 0) {
        const cloudTrips = json.data;
        const newTrips = cloudTrips.map((row, idx) => calculateTrip({
          id: idx + 1,
          sNo: row.sNo || idx + 1,
          tripDate: row.tripDate,
          vehicleNo: row.vehicleNo,
          from: row.from,
          to: row.to,
          freight: row.freight,
          advanceDate: row.advanceDate,
          advance: row.advance,
          balance: row.balance,
          halting: row.halting,
          trspName: row.trspName,
          trspCommission: row.trspCommission || 0,
          diesel: row.diesel || 0,
          toll: row.toll || 0,
          loading: row.loading || 0,
          unloading: row.unloading || 0,
          police: row.police || 0,
          rta: row.rta || 0,
          other: row.other || 0,
          driverCommission: row.driverCommission || 0,
          status: row.status || 'New',
          statusAmount: row.statusAmount !== undefined ? row.statusAmount : 0,
          balanceReceivedDate: row.balanceReceivedDate || '',
          tripId: row.tripId || ('TR-' + (row.sNo || idx + 1)),
          deleted: false
        }));

        // Non-destructive merge: preserve any local trips that are still awaiting cloud persistence
        const cloudTripIds = new Set(newTrips.map(t => String(t.tripId || t.sNo)));
        const pendingLocalTrips = state.trips.filter(t => !cloudTripIds.has(String(t.tripId || t.sNo)) && !t.deleted);
        const mergedTrips = [...newTrips, ...pendingLocalTrips];

        const prevHash = JSON.stringify(state.trips.map(t => `${t.sNo}_${t.freight}_${t.advance}_${t.status}_${t.balance}_${t.vehicleNo}_${t.tripId || ''}`));
        const newHash = JSON.stringify(mergedTrips.map(t => `${t.sNo}_${t.freight}_${t.advance}_${t.status}_${t.balance}_${t.vehicleNo}_${t.tripId || ''}`));

        if (prevHash !== newHash) {
          state.trips = mergedTrips;
          saveTrips();
          renderScopeControls();
          render();
          broadcastDataChange();
          if (!isSilent) showToast('⚡ Real-time update: Synced latest trips live from cloud!');
        }
      }
    }
  } catch (e) {
    if (state.apiUrl !== DEFAULT_CLOUD_API_URL) {
      state.apiUrl = DEFAULT_CLOUD_API_URL;
      localStorage.setItem('lorry_api_url', DEFAULT_CLOUD_API_URL);
    }
  } finally {
    isSyncingInBackground = false;
  }
}

// 4. Background Sync Interval (Every 4 seconds across devices)
setInterval(() => {
  autoSyncCloud(true);
}, 4000);

// 5. Window Focus Sync (Instant sync when user returns to tab)
window.addEventListener('focus', () => {
  autoSyncCloud(true);
});

// 6. Tab Visibility Change Listener
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    autoSyncCloud(true);
  }
});

// 7. Multi-Tab LocalStorage Sync
window.addEventListener('storage', (e) => {
  if (e.key === 'lorry_trips_master_v9') {
    loadTrips();
    render();
  }
});

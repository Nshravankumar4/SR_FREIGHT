/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - CENTRAL APPLICATION STATE
 * Version: 2.4.2
 */

const appState = {
  isLoggedIn: false,
  currentUser: null,       // { username, role: 'Admin' | 'Employee', name }
  currentVehicle: null,    // 'TS15UE1122' | 'TG15T6666'

  currentPage: "login",    // 'login' | 'vehicles' | 'dashboard' | 'trips' | 'excel' | 'vehicle-data' | 'settings'

  vehicles: [],
  trips: [],
  receipts: [],
  renewals: [],

  selectedTrip: null,
  editingTripId: null,

  filters: {
    status: 'ALL',
    search: '',
    viewType: 'ALL_TRIPS', // 'TODAY' | 'SELECTED_DATE' | 'DATE_RANGE' | 'ENTIRE_MONTH' | 'ALL_TRIPS'
    selectedDate: '2026-08-28',
    dateFrom: '2026-08-28',
    dateTo: '2026-08-29',
    selectedMonth: '2026-08'
  },

  settings: {
    currency: "₹",
    dateFormat: "DD-MM-YYYY",
    theme: "navy"
  },

  isSaving: false,
  pendingMutationCount: 0,
  lastSuccessfulMutation: 0,
  syncStatus: "idle",       // 'idle' | 'syncing' | 'synced' | 'error'
  lastSyncTimestamp: null,

  resetSession() {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.currentVehicle = null;
    this.currentPage = "login";
    this.selectedTrip = null;
    this.editingTripId = null;
    this.receipts = [];
    this.filters = {
      status: 'ALL',
      search: '',
      viewType: 'ALL_TRIPS',
      selectedDate: '',
      dateFrom: '',
      dateTo: '',
      selectedMonth: ''
    };
    this.isSaving = false;
    this.pendingMutationCount = 0;
    this.syncStatus = "idle";
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = appState;
}


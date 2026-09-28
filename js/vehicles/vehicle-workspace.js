/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - VEHICLE WORKSPACE CONTROLLER
 * Version: 2.4.2
 */

const VehicleWorkspace = {
  /**
   * Switch into a specific vehicle workspace
   */
  async selectVehicle(vehicleNo) {
    if (!vehicleNo) return;

    appState.currentVehicle = vehicleNo;

    // 1. Ensure baseline data is loaded before rendering
    if (typeof Trips !== 'undefined') {
      Trips.loadFromLocal();
    }

    // 2. Save selected vehicle to session
    try {
      localStorage.setItem(CONFIG.VEHICLE_KEY, vehicleNo);
      Auth.saveSession();
    } catch (_) {}

    // 3. Navigate to vehicle dashboard and render immediately
    Router.navigate('dashboard');
    if (typeof Dashboard !== 'undefined') {
      Dashboard.render();
    }
    Utils.showToast(`🚚 Switched to ${vehicleNo} workspace`);

    // 4. Fetch latest cloud data for this vehicle in background
    if (typeof Trips !== 'undefined') {
      Trips.loadVehicleTrips(vehicleNo);
    }
  },

  /**
   * Return to vehicle selection grid
   */
  changeVehicle() {
    appState.currentVehicle = null;
    try {
      localStorage.removeItem(CONFIG.VEHICLE_KEY);
      Auth.saveSession();
    } catch (_) {}
    Router.navigate('vehicles');
  },

  /**
   * Filter all trips strictly by current vehicle
   */
  getActiveTrips() {
    if (!appState.currentVehicle) return [];
    return (appState.trips || []).filter(t => t.vehicleNo === appState.currentVehicle);
  },

  /**
   * Centralized filtering engine:
   * vehicleTrips -> dateFilteredTrips -> statusFilteredTrips -> searchedTrips
   */
  getFilteredTrips(options = {}) {
    const includeStatus = options.includeStatus !== undefined ? options.includeStatus : true;
    const includeSearch = options.includeSearch !== undefined ? options.includeSearch : true;

    // 1. Vehicle filtering FIRST
    const vehicleTrips = this.getActiveTrips();

    // 2. Date filtering SECOND
    const viewType = appState.filters.viewType || 'ALL_TRIPS';
    const today = new Date().toISOString().slice(0, 10);

    const dateFiltered = vehicleTrips.filter(t => {
      const tripDate = t.tripDate ? Utils.toInputDateFormat(t.tripDate) : '';
      if (viewType === 'TODAY') {
        return tripDate === today;
      } else if (viewType === 'SELECTED_DATE') {
        return appState.filters.selectedDate ? tripDate === appState.filters.selectedDate : true;
      } else if (viewType === 'DATE_RANGE') {
        if (appState.filters.dateFrom && tripDate < appState.filters.dateFrom) return false;
        if (appState.filters.dateTo && tripDate > appState.filters.dateTo) return false;
        return true;
      } else if (viewType === 'ENTIRE_MONTH') {
        return tripDate.startsWith(appState.filters.selectedMonth || '2026-08');
      }
      return true; // ALL_TRIPS
    });

    if (!includeStatus && !includeSearch) {
      return dateFiltered;
    }

    // 3. Status filtering THIRD
    const statusFilter = appState.filters.status || 'ALL';
    const statusFiltered = dateFiltered.filter(t => {
      if (!includeStatus || statusFilter === 'ALL') return true;
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      const isCleared = calc.remainingBalance === 0;

      if (statusFilter === 'NEW' && (t.tripStatus !== 'New' && t.status !== 'New')) return false;
      if (statusFilter === 'PROFIT' && calc.profitLoss < 0) return false;
      if (statusFilter === 'LOSS' && calc.profitLoss >= 0) return false;
      if (statusFilter === 'PENDING' && (isCleared || calc.totalReceived > 0)) return false;
      if (statusFilter === 'PARTIAL' && (isCleared || calc.totalReceived === 0)) return false;
      if (statusFilter === 'PAID' && !isCleared) return false;
      if (statusFilter === 'BALANCE_MISMATCH' && !calc.hasBalanceMismatch && (calc.originalBalance === (calc.freight - calc.advance))) return false;
      return true;
    });

    // 4. Search query FOURTH
    const searchQuery = (appState.filters.search || '').toLowerCase().trim();
    if (!includeSearch || !searchQuery) {
      return statusFiltered;
    }

    return statusFiltered.filter(t => {
      const match = (t.tripId && t.tripId.toLowerCase().includes(searchQuery)) ||
                    (t.from && t.from.toLowerCase().includes(searchQuery)) ||
                    (t.to && t.to.toLowerCase().includes(searchQuery)) ||
                    (t.trspName && t.trspName.toLowerCase().includes(searchQuery)) ||
                    (t.vehicleNo && t.vehicleNo.toLowerCase().includes(searchQuery)) ||
                    String(t.sNo || '').includes(searchQuery);
      return Boolean(match);
    });
  }
};

window.getFilteredTrips = function(options) {
  return VehicleWorkspace.getFilteredTrips(options);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleWorkspace;
}


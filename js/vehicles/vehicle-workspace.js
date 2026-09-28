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

    // Save selected vehicle to session
    try {
      localStorage.setItem(CONFIG.VEHICLE_KEY, vehicleNo);
      Auth.saveSession();
    } catch (_) {}

    // Navigate to vehicle dashboard
    Router.navigate('dashboard');
    Utils.showToast(`🚚 Switched to ${vehicleNo} workspace`);

    // Fetch latest cloud data for this vehicle in background
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
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleWorkspace;
}


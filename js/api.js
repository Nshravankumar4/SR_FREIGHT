/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - CENTRALIZED API CLIENT
 * Version: 2.4.2
 */

const Api = {
  /**
   * Universal GET request to Google Apps Script Web App
   */
  async get(action, params = {}) {
    const baseUrl = CONFIG.getScriptUrl ? CONFIG.getScriptUrl() : CONFIG.GOOGLE_APPS_SCRIPT_URL;
    const url = new URL(baseUrl);
    url.searchParams.set('action', action);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn(`[Api.get] ${action} failed:`, err);
      throw err;
    }
  },

  /**
   * Universal POST request for state mutations
   */
  async post(action, payload = {}, vehicleNo = '') {
    // SECURITY GUARD: If action is a delete operation, strictly check authorization
    if (typeof action === 'string' && action.toLowerCase().includes('delete')) {
      if (typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' && !Auth.canDelete()) {
        const forbiddenErr = {
          success: false,
          error: "DELETE_NOT_ALLOWED",
          message: "Rudra does not have permission to delete records."
        };
        console.warn(`[Api.post] Denied unauthorized delete request (${action}):`, forbiddenErr);
        return forbiddenErr;
      }
    }

    const envelope = {
      action,
      vehicleNo: vehicleNo || appState.currentVehicle || '',
      user: appState.currentUser ? appState.currentUser.username : 'anonymous',
      role: appState.currentUser ? appState.currentUser.role : 'Guest',
      timestamp: Date.now(),
      data: payload
    };

    try {
      const baseUrl = CONFIG.getScriptUrl ? CONFIG.getScriptUrl() : CONFIG.GOOGLE_APPS_SCRIPT_URL;
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(envelope)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn(`[Api.post] ${action} failed:`, err);
      throw err;
    }
  },

  // Vehicle Endpoints
  async getVehicles() {
    return this.get('getVehicles');
  },

  async updateVehicleData(vehicleData, vehicleNo) {
    return this.post('updateVehicleData', vehicleData, vehicleNo);
  },

  // Trip Endpoints
  async getTrips(vehicleNo = '') {
    return this.get('getTrips', { vehicleNo });
  },

  async createTrip(tripData, vehicleNo) {
    return this.post('createTrip', tripData, vehicleNo);
  },

  async updateTrip(tripData, vehicleNo) {
    return this.post('updateTrip', tripData, vehicleNo);
  },

  async deleteTrip(tripId, vehicleNo) {
    if (typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' && !Auth.canDelete()) {
      return { success: false, error: "DELETE_NOT_ALLOWED", message: "Rudra does not have permission to delete records." };
    }
    return this.post('deleteTrip', { tripId }, vehicleNo);
  },

  // Receipt Endpoints
  async getReceipts(tripId, vehicleNo) {
    return this.get('getReceipts', { tripId, vehicleNo });
  },

  async addReceipt(receiptData, tripId, vehicleNo) {
    return this.post('addReceipt', { receipt: receiptData, tripId }, vehicleNo);
  },

  async deleteReceipt(receiptId, tripId, vehicleNo) {
    if (typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' && !Auth.canDelete()) {
      return { success: false, error: "DELETE_NOT_ALLOWED", message: "Rudra does not have permission to delete records." };
    }
    return this.post('deleteReceipt', { receiptId, tripId }, vehicleNo);
  },

  // Renewal Endpoints
  async getRenewals(vehicleNo = '') {
    return this.get('getRenewals', vehicleNo ? { vehicleNo } : {});
  },

  async addRenewal(renewalData) {
    return this.post('addRenewal', renewalData);
  },

  async updateRenewal(renewalData) {
    return this.post('updateRenewal', renewalData);
  },

  async deleteRenewal(renewalId) {
    if (typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' && !Auth.canDelete()) {
      return { success: false, error: "DELETE_NOT_ALLOWED", message: "Rudra does not have permission to delete records." };
    }
    return this.post('deleteRenewal', { renewalId });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Api;
}


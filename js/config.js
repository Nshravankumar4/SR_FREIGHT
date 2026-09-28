/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - GLOBAL CONFIGURATION
 * Version: 2.4.2
 */

const CONFIG = {
  APP_NAME: "SR_T Lorry Freight Management System",
  VERSION: "2.4.2",
  GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec",
  SPREADSHEET_ID: "1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0",

  getScriptUrl() {
    try {
      return localStorage.getItem('lorry_custom_script_url') || this.GOOGLE_APPS_SCRIPT_URL;
    } catch (_) {
      return this.GOOGLE_APPS_SCRIPT_URL;
    }
  },

  DEFAULT_CURRENCY: "₹",
  DEFAULT_DATE_FORMAT: "DD-MM-YYYY",

  SESSION_KEY: "lorry_session_v242",
  VEHICLE_KEY: "lorry_current_vehicle_v242",
  DATA_STORAGE_KEY: "SR_TRIPS_DATA_V242",
  BACKUP_STORAGE_KEY: "lorry_backup_snapshots_v242",

  POLL_INTERVAL_MS: 5000,
  POLL_MIN_INTERVAL_AFTER_MUTATION_MS: 4000,

  DEFAULT_VEHICLES: [
    { vehicleNo: "TS15UE1122", vehicleName: "TS15UE1122", status: "Active", driverName: "Driver 1", driverPhone: "" },
    { vehicleNo: "TG15T6666", vehicleName: "TG15T6666", status: "Active", driverName: "Driver 2", driverPhone: "" }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}


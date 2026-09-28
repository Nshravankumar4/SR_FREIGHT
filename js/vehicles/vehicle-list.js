/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - DYNAMIC VEHICLE SELECTION
 * Version: 2.4.2
 */

const VehicleList = {
  /**
   * Render dynamic vehicle selection cards
   */
  async render() {
    const container = document.getElementById('vehicle-cards-container');
    if (!container) return;

    // Use registered vehicles or fallback to defaults
    const vehicles = (appState.vehicles && appState.vehicles.length > 0)
      ? appState.vehicles
      : CONFIG.DEFAULT_VEHICLES;

    container.innerHTML = vehicles.map(v => `
      <div class="vehicle-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition duration-200 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${v.status || 'Active'}
            </span>
            <span class="text-2xl">🚚</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">${v.vehicleNo}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${v.notes || 'Heavy Transport Lorry'}</p>
          <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-6">
            <div><span class="font-semibold">Driver:</span> ${v.driverName || 'Not Assigned'}</div>
            ${v.driverPhone ? `<div><span class="font-semibold">Phone:</span> ${v.driverPhone}</div>` : ''}
          </div>
        </div>
        <button 
          onclick="VehicleWorkspace.selectVehicle('${v.vehicleNo}')" 
          class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-150 flex items-center justify-center gap-2">
          <span>Open Workspace</span>
          <span>&rarr;</span>
        </button>
      </div>
    `).join('');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleList;
}


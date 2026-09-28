/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - VEHICLE PROFILE MANAGEMENT
 * Version: 2.4.2
 */

const VehicleData = {
  render() {
    const vNo = appState.currentVehicle;
    if (!vNo) {
      Router.navigate('vehicles');
      return;
    }

    const vehicle = (appState.vehicles || []).find(v => v.vehicleNo === vNo) || {
      vehicleNo: vNo,
      vehicleName: vNo,
      driverName: '',
      driverPhone: '',
      status: 'Active',
      notes: ''
    };

    const container = document.getElementById('vehicle-data-content');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Vehicle Profile: ${vehicle.vehicleNo}</h2>
            <p class="text-sm text-slate-500">Edit driver details and operational status without affecting past trip records.</p>
          </div>
          <span class="text-3xl">🚚</span>
        </div>

        <form id="form-vehicle-data" onsubmit="VehicleData.save(event)" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Vehicle Number</label>
            <input type="text" value="${vehicle.vehicleNo}" disabled class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 font-mono font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Primary Driver Name</label>
            <input type="text" id="v-driver-name" value="${vehicle.driverName || ''}" placeholder="e.g. John Doe" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Driver Phone Number</label>
            <input type="tel" id="v-driver-phone" value="${vehicle.driverPhone || ''}" placeholder="e.g. +91 98765 43210" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Operational Status</label>
            <select id="v-status" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option value="Active" ${vehicle.status === 'Active' ? 'selected' : ''}>Active (In Service)</option>
              <option value="Maintenance" ${vehicle.status === 'Maintenance' ? 'selected' : ''}>Maintenance / Repair</option>
              <option value="Idle" ${vehicle.status === 'Idle' ? 'selected' : ''}>Idle</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Vehicle Notes & Remarks</label>
            <textarea id="v-notes" rows="3" placeholder="Route preferences, insurance dates, permit details..." class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">${vehicle.notes || ''}</textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onclick="Router.navigate('dashboard')" class="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition">Save Vehicle Profile</button>
          </div>
        </form>
      </div>
    `;
  },

  async save(e) {
    e.preventDefault();
    const vNo = appState.currentVehicle;
    if (!vNo) return;

    const driverName = document.getElementById('v-driver-name').value.trim();
    const driverPhone = document.getElementById('v-driver-phone').value.trim();
    const status = document.getElementById('v-status').value;
    const notes = document.getElementById('v-notes').value.trim();

    const updated = {
      vehicleNo: vNo,
      vehicleName: vNo,
      driverName,
      driverPhone,
      status,
      notes
    };

    // Update state
    const idx = (appState.vehicles || []).findIndex(v => v.vehicleNo === vNo);
    if (idx !== -1) {
      appState.vehicles[idx] = { ...appState.vehicles[idx], ...updated };
    } else {
      appState.vehicles.push(updated);
    }

    Utils.showToast(`✅ Profile for ${vNo} saved successfully!`);

    try {
      await Api.updateVehicleData(updated, vNo);
    } catch (err) {
      console.warn("Background vehicle data sync note:", err);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VehicleData;
}


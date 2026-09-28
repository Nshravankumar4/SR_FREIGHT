/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - GLOBAL SETTINGS CONTROLLER
 * Version: 2.4.2
 */

const Settings = {
  render() {
    const container = document.getElementById('settings-content');
    if (!container) return;

    const isAdmin = Auth.isAdmin();

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <!-- Application Preferences Card -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚙️</span>
            <span>Application Preferences</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Currency</label>
              <input type="text" value="₹ INR" disabled class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Format</label>
              <input type="text" value="DD-MM-YYYY" disabled class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed">
            </div>
          </div>
        </div>

        <!-- Cloud Endpoint Information Card -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span>☁️</span>
            <span>Connected Cloud Services</span>
          </h3>

          <div class="space-y-3 text-xs">
            <div>
              <span class="font-bold text-slate-500 block mb-1">Google Spreadsheet ID:</span>
              <code class="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded font-mono text-indigo-600 dark:text-indigo-400 select-all">${CONFIG.SPREADSHEET_ID}</code>
            </div>

            <div>
              <span class="font-bold text-slate-500 block mb-1">Google Apps Script Web App:</span>
              <a href="${CONFIG.GOOGLE_APPS_SCRIPT_URL}" target="_blank" class="text-indigo-600 hover:underline break-all font-mono">
                ${CONFIG.GOOGLE_APPS_SCRIPT_URL}
              </a>
            </div>
          </div>
        </div>

        ${isAdmin ? `
          <!-- Admin-Only Backup & Maintenance Card -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span>🛡️</span>
              <span>Administrative Tools & Backups</span>
            </h3>
            <p class="text-xs text-slate-500 mb-4">Export master JSON snapshots of all local data or trigger a Google Drive cloud backup.</p>

            <div class="flex flex-wrap gap-3">
              <button 
                onclick="Settings.exportBackupJson()" 
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow transition">
                Export Local JSON Backup
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  exportBackupJson() {
    const backupData = {
      version: CONFIG.VERSION,
      exportTimestamp: new Date().toISOString(),
      user: appState.currentUser,
      vehicles: appState.vehicles,
      trips: appState.trips
    };

    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", str);
    a.setAttribute("download", `Lorry_Backup_Complete_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    Utils.showToast("✅ Full JSON backup downloaded successfully!");
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Settings;
}


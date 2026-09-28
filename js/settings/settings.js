/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - GLOBAL SETTINGS CONTROLLER
 * Version: 2.4.2
 */

const Settings = {
  render() {
    const container = document.getElementById('settings-content');
    if (!container) return;

    const isAdmin = Auth.isAdmin();
    const activeUrl = localStorage.getItem('lorry_custom_script_url') || CONFIG.GOOGLE_APPS_SCRIPT_URL;
    const openingBal = localStorage.getItem('lorry_opening_balance') || '120000';

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- 1. System Settings & Google Sheet API Card -->
        <div class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">⚙️</span>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">System Settings & Google Sheet API</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Connect your website to Google Sheets via your deployed Google Apps Script Web App for ₹0 cloud database storage.</p>
            </div>
          </div>

          <div class="space-y-4 mt-6">
            <div>
              <label for="settings-api-url" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Google Apps Script Web App URL</label>
              <input type="url" id="settings-api-url" value="${activeUrl}" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500">
              <span class="text-[11px] text-slate-400 mt-1 block">Connected to your live Google Sheets master database.</span>
            </div>

            <div>
              <label for="settings-opening-bal" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">March 2026 Opening Balance (₹)</label>
              <input type="number" id="settings-opening-bal" value="${openingBal}" placeholder="120000" class="w-full sm:w-72 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500">
              <span class="text-[11px] text-slate-400 mt-1 block">Carry forward balance from previous financial year.</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button onclick="Settings.saveConfig()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer">
                Save Configuration
              </button>
              <button onclick="Settings.testConnection()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-600 transition cursor-pointer flex items-center gap-2">
                <span>⚡</span>
                <span>Test Cloud Connection & Live Sync</span>
              </button>
            </div>

            <!-- Dynamic Diagnostic Result Box -->
            <div id="apiTestResultBox" class="hidden mt-4"></div>
          </div>
        </div>

        <!-- 2. Multi-User Real-Time Sync Setup Guide (Admin & Rudra) -->
        <div class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="text-2xl">🌐</span>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Multi-User Real-Time Sync Setup (Admin & Rudra)</h3>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            For live changes made by Admin to instantly show on Rudra's screen (and vice versa), Google Apps Script must be set to <strong>"Anyone"</strong>:
          </p>

          <ol class="list-decimal pl-5 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <li>Open your Google Spreadsheet ➔ Click <strong>Extensions</strong> ➔ <strong>Apps Script</strong>.</li>
            <li>Click the blue <strong>Deploy</strong> button (top right) ➔ <strong>Manage deployments</strong>.</li>
            <li>Click the <strong>Pencil icon ✏️</strong> next to the Web App deployment.</li>
            <li>Under <strong>"Who has access"</strong>, change from <em>"Only myself"</em> to <strong>"Anyone"</strong>.</li>
            <li>Click <strong>Deploy</strong>! That's it! Both users will now share the exact same live ledger.</li>
          </ol>
        </div>

        <!-- 3. Password Management Card -->
        <div class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="text-2xl">🔐</span>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">Update Account Passwords</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Update account passwords securely.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label for="settings-admin-pass" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">New Administrator Password (Admin)</label>
              <input type="password" id="settings-admin-pass" placeholder="New password for Admin (Min 4 chars)" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label for="settings-rudra-pass" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">New Password for Rudra</label>
              <input type="password" id="settings-rudra-pass" placeholder="New password for Rudra (Min 4 chars)" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div class="pt-4">
            <button onclick="Settings.updatePasswords()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2">
              <span>💾</span>
              <span>Update Passwords Securely</span>
            </button>
          </div>
        </div>

        ${isAdmin ? `
          <!-- 4. Administrative Backups Card -->
          <div class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-2.5 mb-2">
              <span class="text-2xl">🛡️</span>
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Administrative Tools & Backups</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Export master JSON snapshots of all local data or trigger a Google Drive cloud backup.</p>
              </div>
            </div>

            <div class="pt-3">
              <button 
                onclick="Settings.exportBackupJson()" 
                class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-2">
                <span>📥</span>
                <span>Export Local JSON Backup</span>
              </button>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  },

  saveConfig() {
    const urlInput = document.getElementById('settings-api-url');
    const balInput = document.getElementById('settings-opening-bal');

    if (urlInput) {
      const url = urlInput.value.trim();
      if (url) {
        localStorage.setItem('lorry_custom_script_url', url);
        CONFIG.GOOGLE_APPS_SCRIPT_URL = url;
      }
    }
    if (balInput) {
      const bal = balInput.value.trim();
      if (bal) {
        localStorage.setItem('lorry_opening_balance', bal);
      }
    }
    Utils.showToast("✅ Configuration saved successfully!", "success");
  },

  async testConnection() {
    const resultBox = document.getElementById('apiTestResultBox');
    if (resultBox) {
      resultBox.classList.remove('hidden');
      resultBox.className = 'p-4 rounded-xl text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
      resultBox.innerHTML = `<span>⏳</span> Testing connection to Google Apps Script cloud database...`;
    }

    const testUrl = (document.getElementById('settings-api-url')?.value || CONFIG.GOOGLE_APPS_SCRIPT_URL).trim();

    try {
      const res = await fetch(`${testUrl}?action=getTrips&vehicleNo=TS15UE1122`, { method: 'GET' });
      const text = await res.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch (jsonErr) {
        if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
          if (resultBox) {
            resultBox.className = 'p-4 rounded-xl text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200';
            resultBox.innerHTML = `
              <div class="font-bold text-sm mb-1">🔴 Multi-User Cloud Sync Notice (Google Permission):</div>
              <p class="mb-2">Google Apps Script requires 'Who has access' set to 'Anyone'. Currently Google redirects requests to account login, which is blocked by browser CORS policy.</p>
              <div class="font-semibold mb-1">Quick 30-Second Fix in Google Sheets:</div>
              <ol class="list-decimal pl-5 space-y-1">
                <li>Open your Google Spreadsheet ➔ Extensions ➔ Apps Script.</li>
                <li>Click the blue Deploy button (top right) ➔ Manage deployments.</li>
                <li>Click the Pencil icon ✏️ next to the Web App deployment.</li>
                <li>Under "Who has access", change from "Only myself" to "Anyone".</li>
                <li>Click Deploy, then return here and click "Test Cloud Connection" again!</li>
              </ol>
            `;
          }
          const banner = document.getElementById('cloudSyncAlertBanner');
          if (banner) banner.classList.remove('hidden');
          return;
        }
        throw new Error(text.substring(0, 120));
      }

      if (parsed && (parsed.success || Array.isArray(parsed.data) || parsed.trips)) {
        if (resultBox) {
          resultBox.className = 'p-4 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200';
          resultBox.innerHTML = `
            <div class="font-bold text-sm mb-1">🟢 Cloud Database Online & Multi-User Sync Active!</div>
            <p>Connected to your live Google Sheets master database. Web App is deployed with 'Who has access: Anyone'.</p>
            <p class="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">Admin and Rudra will see live changes synchronously across all devices and browsers.</p>
          `;
        }
        const banner = document.getElementById('cloudSyncAlertBanner');
        if (banner) banner.classList.add('hidden');
        Utils.showToast("✅ Cloud database connection verified successfully!", "success");
      } else {
        throw new Error(parsed?.error || "Unexpected response structure");
      }
    } catch (err) {
      if (resultBox) {
        resultBox.className = 'p-4 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200';
        resultBox.innerHTML = `
          <div class="font-bold text-sm mb-1">⚠️ Connection Note / Notice:</div>
          <p>${err.message || "Failed to reach endpoint directly."}</p>
        `;
      }
    }
  },

  updatePasswords() {
    const adminP = document.getElementById('settings-admin-pass')?.value?.trim();
    const rudraP = document.getElementById('settings-rudra-pass')?.value?.trim();
    let updatedAny = false;

    if (adminP) {
      const res = Auth.updatePassword('admin', adminP);
      if (res.success) {
        Utils.showToast(res.message, "success");
        const el = document.getElementById('settings-admin-pass');
        if (el) el.value = '';
        updatedAny = true;
      } else {
        Utils.showToast(res.message, "error");
      }
    }

    if (rudraP) {
      const res = Auth.updatePassword('rudra', rudraP);
      if (res.success) {
        Utils.showToast(res.message, "success");
        const el = document.getElementById('settings-rudra-pass');
        if (el) el.value = '';
        updatedAny = true;
      } else {
        Utils.showToast(res.message, "error");
      }
    }

    if (!updatedAny && !adminP && !rudraP) {
      Utils.showToast("Please enter a new password for Admin or Rudra.", "warning");
    }
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


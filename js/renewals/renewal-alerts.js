/**
 * 🔔 RENEWALS & ALERTS - AUTOMATED NOTIFICATION & POPUP ALERT SYSTEM
 * Monitors fleet document urgency, triggers attention popups, and updates badges.
 */

const RenewalAlerts = {
  _hasShownAlertThisSession: false,

  /**
   * Check all renewals and display attention modal if critical items exist
   * @param {boolean} force If true (e.g. user clicked header bell), open regardless of session flag
   */
  checkAndShowAlerts(force = false) {
    if (!appState.isLoggedIn) return;
    if (!force && this._hasShownAlertThisSession) return;

    if (typeof Renewals !== 'undefined') {
      Renewals.loadFromLocal();
    }

    const metrics = RenewalCalculations.calculateMetrics(appState.renewals || []);
    Renewals.updateNotificationBadges();

    const attentionItems = (metrics.items || []).filter(item => item.statusMeta.requiresAttention);

    if (attentionItems.length === 0) {
      if (force) {
        Utils.showToast("🟢 All fleet documents and renewals are compliant & up-to-date!", "success");
      }
      return;
    }

    this._hasShownAlertThisSession = true;
    this.renderAlertModal(attentionItems, metrics);
  },

  /**
   * Render and open the Attention Required Modal (#modal-renewal-alert)
   */
  renderAlertModal(items, metrics) {
    const modal = document.getElementById('modal-renewal-alert');
    const listContainer = document.getElementById('renewal-alert-list');
    const countBadge = document.getElementById('renewal-alert-count');
    if (!modal || !listContainer) return;

    if (countBadge) {
      countBadge.textContent = `${items.length} Requires Attention`;
    }

    listContainer.innerHTML = items.map(item => {
      const s = item.statusMeta;
      return `
        <div class="p-3.5 rounded-2xl border ${s.isOverdue ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50' : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50'} flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-xl shrink-0">${s.isOverdue ? '🚨' : '⚠️'}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded font-mono text-[10px] font-black ${s.isOverdue ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200' : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'}">
                  ${item.vehicleNo}
                </span>
                <span class="font-bold text-xs text-slate-900 dark:text-white">${item.documentName}</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Due: <strong class="text-slate-700 dark:text-slate-200">${RenewalCalculations.formatDate(item.dueDate)}</strong> &bull; 
                <span class="font-black ${s.isOverdue ? 'text-rose-600' : 'text-amber-600'}">${s.humanDiff}</span>
              </p>
            </div>
          </div>
          <button 
            onclick="RenewalAlerts.closeModal(); Router.navigate('renewals'); setTimeout(() => Renewals.openViewModal('${item.renewalId}'), 100);" 
            class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 transition shadow-2xs shrink-0 cursor-pointer">
            View &rarr;
          </button>
        </div>
      `;
    }).join('');

    modal.classList.remove('hidden');
  },

  closeModal() {
    const modal = document.getElementById('modal-renewal-alert');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Triggered when operator clicks header bell icon
   */
  handleHeaderBellClick() {
    this.checkAndShowAlerts(true);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RenewalAlerts;
}


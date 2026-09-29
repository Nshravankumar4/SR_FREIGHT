/**
 * 🔔 RENEWALS & ALERTS - TABLE RENDERING COMPONENT
 * Renders the responsive compliance records table with filters, live status pills, and role-guarded action buttons.
 */

const RenewalTable = {
  render() {
    const container = document.getElementById('renewal-table-container');
    if (!container) return;

    let items = (appState.renewals || []).map(r => {
      const status = RenewalCalculations.calculateStatus(r);
      return { ...r, statusMeta: status };
    });

    const filters = Renewals.filters;

    // 1. Vehicle Filter
    if (filters.vehicle && filters.vehicle !== 'ALL') {
      const vTarget = filters.vehicle.trim().toUpperCase();
      items = items.filter(r => {
        const v = String(r.vehicleNo || '').trim().toUpperCase();
        // Support cross-matching for TS15UE1122 and TG15UE1122
        if ((vTarget === 'TS15UE1122' || vTarget === 'TG15UE1122') && (v === 'TS15UE1122' || v === 'TG15UE1122')) {
          return true;
        }
        return v === vTarget;
      });
    }

    // 2. Category Filter
    if (filters.category && filters.category !== 'ALL') {
      items = items.filter(r => String(r.category || '').toLowerCase() === filters.category.toLowerCase());
    }

    // 3. Status Filter
    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'OVERDUE') {
        items = items.filter(r => r.statusMeta.statusCode === 'OVERDUE');
      } else if (filters.status === 'DUE_SOON') {
        items = items.filter(r => r.statusMeta.isDueSoon);
      } else if (filters.status === 'UPCOMING') {
        items = items.filter(r => r.statusMeta.statusCode === 'UPCOMING');
      } else if (filters.status === 'ACTIVE') {
        items = items.filter(r => r.statusMeta.statusCode === 'ACTIVE');
      }
    }

    // 4. Search Filter
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(r => {
        return (
          String(r.vehicleNo || '').toLowerCase().includes(q) ||
          String(r.documentName || '').toLowerCase().includes(q) ||
          String(r.category || '').toLowerCase().includes(q) ||
          String(r.provider || '').toLowerCase().includes(q) ||
          String(r.notes || '').toLowerCase().includes(q)
        );
      });
    }

    // 5. Urgency Sorting: Overdue & earliest due dates on top
    items.sort((a, b) => a.statusMeta.urgencyWeight - b.statusMeta.urgencyWeight);

    if (items.length === 0) {
      container.innerHTML = `
        <div class="py-16 px-4 text-center space-y-3">
          <span class="text-4xl block">🔍</span>
          <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">No matching renewal records found</h4>
          <p class="text-xs text-slate-500 max-w-md mx-auto">Try clearing search filters or add a new renewal item for your fleet vehicles.</p>
          <button 
            onclick="Renewals.filters.vehicle='ALL'; Renewals.filters.category='ALL'; Renewals.filters.status='ALL'; Renewals.filters.search=''; Renewals.render();" 
            class="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-100 transition cursor-pointer">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    const isAdmin = Auth.isAdmin();
    const canDelete = typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' ? Auth.canDelete() : isAdmin;

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-4 text-center">Vehicle</th>
              <th class="py-3 px-4">Document / Item</th>
              <th class="py-3 px-4">Category</th>
              <th class="py-3 px-4 text-center">Due Date</th>
              <th class="py-3 px-4">Provider / Company</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center">Remaining / Overdue</th>
              <th class="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
            ${items.map((r, idx) => {
              const s = r.statusMeta;
              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  
                  <!-- Vehicle No -->
                  <td class="py-3 px-4 text-center whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-lg font-mono text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      ${r.vehicleNo}
                    </span>
                  </td>

                  <!-- Document Name -->
                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>${r.documentName}</span>
                      ${r.notes ? `<span title="${r.notes}" class="text-[10px] text-slate-400 cursor-help">ℹ️</span>` : ''}
                    </div>
                    <div class="text-[10px] text-slate-400">${r.duration && r.duration !== '—' ? `Duration: ${r.duration}` : ''}</div>
                  </td>

                  <!-- Category -->
                  <td class="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ${r.category || 'General'}
                    </span>
                  </td>

                  <!-- Due Date -->
                  <td class="py-3 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${RenewalCalculations.formatDate(r.dueDate)}
                  </td>

                  <!-- Provider -->
                  <td class="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    ${r.provider || '—'}
                  </td>

                  <!-- Automatic Status Badge -->
                  <td class="py-3 px-4 text-center whitespace-nowrap">
                    <span class="inline-flex px-2.5 py-1 rounded-xl text-[11px] border ${s.badgeClass}">
                      ${s.label}
                    </span>
                  </td>

                  <!-- Remaining / Overdue Human Text -->
                  <td class="py-3 px-4 text-center whitespace-nowrap">
                    <span class="text-xs font-bold ${s.isOverdue ? 'text-rose-600 font-black' : s.isDueSoon ? 'text-amber-600 font-bold' : 'text-slate-500'}">
                      ${s.humanDiff}
                    </span>
                  </td>

                  <!-- Actions (View, Edit for All; Delete for Admin only) -->
                  <td class="py-3 px-4 text-center whitespace-nowrap">
                    <div class="inline-flex items-center gap-1.5 justify-center">
                      <button 
                        onclick="Renewals.openViewModal('${r.renewalId}')" 
                        class="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                        title="View Details">
                        👁️ View
                      </button>

                      <button 
                        onclick="RenewalForm.openEditModal('${r.renewalId}')" 
                        class="px-2 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-600 dark:hover:text-white border border-amber-200 dark:border-amber-800 transition cursor-pointer"
                        title="Edit Renewal">
                        ✏️ Edit
                      </button>

                      ${canDelete ? `
                        <button 
                          onclick="Renewals.deleteRenewal('${r.renewalId}')" 
                          class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete Renewal">
                          🗑️
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Footer Count Summary -->
      <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>Showing <strong class="text-slate-800 dark:text-slate-200">${items.length}</strong> of <strong class="text-slate-800 dark:text-slate-200">${(appState.renewals || []).length}</strong> total fleet renewal documents.</div>
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overdue</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Due This Week</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Due In 30 Days</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active</span>
        </div>
      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RenewalTable;
}


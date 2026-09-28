/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - VEHICLE-SCOPED TRIP TABLE RENDERER
 * Version: 2.4.2
 *
 * Implements:
 * - 5 Time Scope Selectors (TODAY, SELECTED DATE, DATE RANGE, ENTIRE MONTH, ALL TRIPS)
 * - Dynamic Scope Inputs (single date, range, month select)
 * - 8 Vibrant Status & Audit Filter Cards with live count badges
 * - Exact 25 Canonical Columns matching reference spreadsheet
 * - Sticky left ⚡ ACTIONS column with View (read-only modal) & Edit (edit drawer)
 */

const TripTable = {
  getTodayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  getMonthOptionsHTML() {
    const months = [
      { val: '2026-08', label: 'August 2026' },
      { val: '2026-09', label: 'September 2026' },
      { val: '2026-10', label: 'October 2026' },
      { val: '2026-11', label: 'November 2026' },
      { val: '2026-12', label: 'December 2026' },
      { val: '2026-07', label: 'July 2026' },
      { val: '2026-06', label: 'June 2026' },
      { val: '2026-05', label: 'May 2026' },
      { val: '2026-04', label: 'April 2026' }
    ];
    const current = appState.filters.selectedMonth || '2026-08';
    return months.map(m => `<option value="${m.val}" ${m.val === current ? 'selected' : ''}>${m.label}</option>`).join('');
  },

  /**
   * Filter vehicle trips strictly by active time scope
   */
  getScopedTrips() {
    const allTrips = VehicleWorkspace.getActiveTrips();
    const viewType = appState.filters.viewType || 'ALL_TRIPS';

    return allTrips.filter(t => {
      const tripDate = t.tripDate ? Utils.toInputDateFormat(t.tripDate) : '';

      if (viewType === 'TODAY') {
        const today = this.getTodayISO();
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
  },

  /**
   * Filter scoped trips by status/audit and search query
   */
  getDisplayTrips() {
    const scopedTrips = this.getScopedTrips();
    const statusFilter = appState.filters.status || 'ALL';
    const searchQuery = (appState.filters.search || '').toLowerCase().trim();

    return scopedTrips.filter(t => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      const isCleared = calc.remainingBalance === 0;

      // 8 Status & Audit Filters
      if (statusFilter === 'NEW' && (t.tripStatus !== 'New' && t.status !== 'New')) return false;
      if (statusFilter === 'PROFIT' && calc.profitLoss < 0) return false;
      if (statusFilter === 'LOSS' && calc.profitLoss >= 0) return false;
      if (statusFilter === 'PENDING' && (isCleared || calc.totalReceived > 0)) return false;
      if (statusFilter === 'PARTIAL' && (isCleared || calc.totalReceived === 0)) return false;
      if (statusFilter === 'PAID' && !isCleared) return false;
      if (statusFilter === 'BALANCE_MISMATCH' && !calc.hasBalanceMismatch && (calc.originalBalance === (calc.freight - calc.advance))) return false;

      // Real-time Search Query
      if (searchQuery) {
        const match = (t.tripId && t.tripId.toLowerCase().includes(searchQuery)) ||
                      (t.from && t.from.toLowerCase().includes(searchQuery)) ||
                      (t.to && t.to.toLowerCase().includes(searchQuery)) ||
                      (t.trspName && t.trspName.toLowerCase().includes(searchQuery)) ||
                      (t.vehicleNo && t.vehicleNo.toLowerCase().includes(searchQuery)) ||
                      String(t.sNo || '').includes(searchQuery);
        if (!match) return false;
      }

      return true;
    });
  },

  /**
   * Update the badge counts on the 8 big status cards
   */
  updateSidebarCounters(scopedTrips) {
    const trips = scopedTrips || this.getScopedTrips();

    let countNew = 0;
    let countProfit = 0;
    let countLoss = 0;
    let countPending = 0;
    let countPartial = 0;
    let countPaid = 0;
    let countMismatch = 0;

    trips.forEach(t => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      const isCleared = calc.remainingBalance === 0;

      if (t.tripStatus === 'New' || t.status === 'New') countNew++;
      if (calc.profitLoss >= 0) countProfit++;
      else countLoss++;

      if (isCleared) {
        countPaid++;
      } else if (calc.totalReceived > 0) {
        countPartial++;
      } else {
        countPending++;
      }

      if (calc.hasBalanceMismatch || (calc.originalBalance !== (calc.freight - calc.advance))) {
        countMismatch++;
      }
    });

    const setBadge = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setBadge('badge-all', trips.length);
    setBadge('badge-new', countNew);
    setBadge('badge-profit', countProfit);
    setBadge('badge-loss', countLoss);
    setBadge('badge-pending', countPending);
    setBadge('badge-partial', countPartial);
    setBadge('badge-paid', countPaid);
    setBadge('badge-mismatch', countMismatch);
  },

  /**
   * Render dynamic scope inputs (Single Date, Date Range, Entire Month)
   */
  renderScopeControls() {
    const container = document.getElementById('dynamic-scope-inputs');
    const activeViewTag = document.getElementById('active-view-tag');
    if (!container) return;

    const viewType = appState.filters.viewType || 'ALL_TRIPS';

    if (viewType === 'TODAY') {
      const today = this.getTodayISO();
      if (activeViewTag) activeViewTag.textContent = `TODAY (${Utils.formatDisplayDate(today)})`;
      container.innerHTML = `
        <div class="flex items-center gap-2 py-1">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Scheduled Dispatch Today:</span>
          <span class="px-2.5 py-1 font-mono text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700">${Utils.formatDisplayDate(today)}</span>
        </div>
      `;
    } else if (viewType === 'SELECTED_DATE') {
      if (activeViewTag) activeViewTag.textContent = Utils.formatDisplayDate(appState.filters.selectedDate);
      container.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <label for="scope-single-date" class="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Dispatch Date:</label>
          <div class="flex items-center gap-2">
            <input type="date" id="scope-single-date" value="${appState.filters.selectedDate || '2026-08-28'}" class="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
            <button onclick="TripTable.applySelectedDate()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">VIEW</button>
          </div>
        </div>
      `;
    } else if (viewType === 'DATE_RANGE') {
      if (activeViewTag) activeViewTag.textContent = `${Utils.formatDisplayDate(appState.filters.dateFrom)} ➔ ${Utils.formatDisplayDate(appState.filters.dateTo)}`;
      container.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <div class="flex items-center gap-2">
            <label for="scope-date-from" class="text-xs font-bold text-slate-700 dark:text-slate-300">From:</label>
            <input type="date" id="scope-date-from" value="${appState.filters.dateFrom || '2026-08-28'}" class="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          </div>
          <div class="flex items-center gap-2">
            <label for="scope-date-to" class="text-xs font-bold text-slate-700 dark:text-slate-300">To:</label>
            <input type="date" id="scope-date-to" value="${appState.filters.dateTo || '2026-08-29'}" class="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          </div>
          <button onclick="TripTable.applyDateRange()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">VIEW RANGE</button>
        </div>
      `;
    } else if (viewType === 'ENTIRE_MONTH') {
      if (activeViewTag) activeViewTag.textContent = `Month: ${appState.filters.selectedMonth || '2026-08'}`;
      container.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <label for="scope-month-select" class="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Operational Month:</label>
          <div class="flex items-center gap-2">
            <select id="scope-month-select" class="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 cursor-pointer">
              ${this.getMonthOptionsHTML()}
            </select>
            <button onclick="TripTable.applyEntireMonth()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">VIEW MONTH</button>
          </div>
        </div>
      `;
    } else {
      if (activeViewTag) activeViewTag.textContent = 'ALL TRIPS';
      container.innerHTML = `
        <div class="text-[11px] text-slate-400 font-medium py-1">
          Showing all fleet trip records for active vehicle.
        </div>
      `;
    }
  },

  /**
   * Switch View Scope (TODAY | SELECTED_DATE | DATE_RANGE | ENTIRE_MONTH | ALL_TRIPS)
   */
  setViewType(type) {
    appState.filters.viewType = type;

    const typeMap = {
      TODAY: 'btn-view-today',
      SELECTED_DATE: 'btn-view-selected-date',
      DATE_RANGE: 'btn-view-date-range',
      ENTIRE_MONTH: 'btn-view-entire-month',
      ALL_TRIPS: 'btn-view-all-trips'
    };

    document.querySelectorAll('.view-type-btn').forEach(btn => {
      btn.className = 'view-type-btn px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer select-none text-left flex items-center justify-between bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 active:scale-98';
    });

    const activeBtn = document.getElementById(typeMap[type]);
    if (activeBtn) {
      activeBtn.className = 'view-type-btn px-4 py-2.5 text-xs font-black rounded-xl transition cursor-pointer select-none text-left flex items-center justify-between bg-blue-600 text-white shadow-xs border border-blue-600 active:scale-98';
    }

    this.renderScopeControls();
    this.render();
  },

  applySelectedDate() {
    const input = document.getElementById('scope-single-date');
    if (input && input.value) {
      appState.filters.selectedDate = input.value;
      this.renderScopeControls();
      this.render();
      Utils.showToast(`🗓️ Showing operations for ${Utils.formatDisplayDate(input.value)}`);
    }
  },

  applyDateRange() {
    const fromInput = document.getElementById('scope-date-from');
    const toInput = document.getElementById('scope-date-to');
    if (fromInput && toInput && fromInput.value && toInput.value) {
      if (fromInput.value > toInput.value) {
        alert("From date cannot be after To date.");
        return;
      }
      appState.filters.dateFrom = fromInput.value;
      appState.filters.dateTo = toInput.value;
      this.renderScopeControls();
      this.render();
      Utils.showToast(`↔️ Showing range: ${Utils.formatDisplayDate(fromInput.value)} to ${Utils.formatDisplayDate(toInput.value)}`);
    }
  },

  applyEntireMonth() {
    const select = document.getElementById('scope-month-select');
    if (select && select.value) {
      appState.filters.selectedMonth = select.value;
      this.renderScopeControls();
      this.render();
      Utils.showToast(`📆 Showing operations for month ${select.value}`);
    }
  },

  /**
   * Set Status / Audit Filter (ALL | NEW | PROFIT | LOSS | PENDING | PARTIAL | PAID | BALANCE_MISMATCH)
   */
  setStatusFilter(status) {
    appState.filters.status = status;

    const btnMap = {
      ALL: 'filter-btn-all',
      NEW: 'filter-btn-new',
      PROFIT: 'filter-btn-profit',
      LOSS: 'filter-btn-loss',
      PENDING: 'filter-btn-pending',
      PARTIAL: 'filter-btn-partial',
      PAID: 'filter-btn-paid',
      BALANCE_MISMATCH: 'filter-btn-mismatch'
    };

    document.querySelectorAll('.big-status-btn').forEach(btn => {
      btn.classList.remove('ring-4', 'ring-blue-500/50', 'scale-[1.02]');
    });

    const activeBtn = document.getElementById(btnMap[status]);
    if (activeBtn) {
      activeBtn.classList.add('ring-4', 'ring-blue-500/50', 'scale-[1.02]');
    }

    this.render();
  },

  /**
   * Main table rendering
   */
  render() {
    const tbody = document.getElementById('trips-table-body');
    if (!tbody) return;

    // Update vehicle title
    const vTitleEl = document.getElementById('trips-view-vehicle-title');
    if (vTitleEl && appState.currentVehicle) {
      vTitleEl.textContent = `TRIPS RECONCILIATION: ${appState.currentVehicle}`;
    }

    // Refresh scope controls if empty
    const scopeContainer = document.getElementById('dynamic-scope-inputs');
    if (scopeContainer && !scopeContainer.innerHTML.trim()) {
      this.renderScopeControls();
    }

    const scopedTrips = this.getScopedTrips();
    this.updateSidebarCounters(scopedTrips);

    const trips = this.getDisplayTrips();

    // Update Header labels
    const visibleCountLabel = document.getElementById('visible-count-label');
    if (visibleCountLabel) visibleCountLabel.textContent = trips.length;

    const scopeTextEl = document.getElementById('table-view-scope-text');
    if (scopeTextEl) {
      const scopeNameMap = {
        TODAY: 'Today',
        SELECTED_DATE: 'Selected Date',
        DATE_RANGE: 'Date Range',
        ENTIRE_MONTH: 'Month View',
        ALL_TRIPS: 'All Trips'
      };
      const filterNameMap = {
        ALL: 'All Statuses',
        NEW: 'New Dispatch',
        PROFIT: 'Profit Trips',
        LOSS: 'Loss Trips',
        PENDING: 'Pending Balance',
        PARTIAL: 'Partially Paid',
        PAID: 'Paid & Settled',
        BALANCE_MISMATCH: '⚠️ Balance Mismatch'
      };
      scopeTextEl.textContent = `${scopeNameMap[appState.filters.viewType || 'ALL_TRIPS']} • ${filterNameMap[appState.filters.status || 'ALL']}`;
    }

    if (trips.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="26" class="py-12 text-center text-slate-400">
            <div class="text-3xl mb-2">🚚</div>
            <div class="text-sm font-semibold">No trip records found for the current selection.</div>
            <div class="text-xs text-slate-500 mt-1">Choose a different date scope, status filter, or click "+ Add Trip".</div>
          </td>
        </tr>
      `;
      return;
    }

    const isAdmin = Auth.isAdmin();

    tbody.innerHTML = trips.map((t, idx) => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      const isCleared = calc.remainingBalance === 0;
      const isProfit = calc.profitLoss >= 0;

      const plFormatted = isProfit 
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">P +${Utils.formatCurrency(calc.profitLoss)}</span>`
        : `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">L -${Utils.formatCurrency(Math.abs(calc.profitLoss))}</span>`;

      // Payment settlement pill
      let balanceDisplay = Utils.formatCurrency(calc.remainingBalance);
      if (isCleared) {
        balanceDisplay = `<span class="text-emerald-600 dark:text-emerald-400 font-black">₹0</span> <span class="text-[10px] font-bold text-emerald-500">🟢</span>`;
      } else if (calc.totalReceived > 0) {
        balanceDisplay = `<span class="text-amber-600 dark:text-amber-400 font-black">${Utils.formatCurrency(calc.remainingBalance)}</span> <span class="text-[10px] font-bold text-amber-500">🟡</span>`;
      } else {
        balanceDisplay = `<span class="text-rose-600 dark:text-rose-400 font-black">${Utils.formatCurrency(calc.remainingBalance)}</span> <span class="text-[10px] font-bold text-rose-500">🔴</span>`;
      }

      // Total Exp Given = Advance + Total Expenses
      const totalExpGiven = calc.advance + calc.totalExpenses;

      // Date of Balance Recd
      const lastReceipt = Array.isArray(t.balanceReceipts) && t.balanceReceipts.length > 0
        ? t.balanceReceipts[t.balanceReceipts.length - 1]
        : null;
      const balanceRecdDate = lastReceipt ? (lastReceipt.receivedDate || lastReceipt.date) : (t.balanceReceivedDate || '-');

      return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs font-semibold">
          
          <!-- Sticky Left Actions Column: View, Edit, Delete -->
          <td class="sticky left-0 z-20 bg-white dark:bg-slate-900 py-3 px-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] whitespace-nowrap text-center">
            <div class="inline-flex items-center gap-1 justify-center">
              <button 
                onclick="Trips.openViewModal('${t.tripId || t.id}')"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-700 transition cursor-pointer"
                title="View Full Trip Details (Read-Only)">
                <span>👁️ View</span>
              </button>
              <button 
                onclick="Trips.openEditDrawer('${t.tripId || t.id}')"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-600 dark:hover:text-white border border-amber-200 dark:border-amber-700 transition cursor-pointer"
                title="Edit Trip Expenses & Record Payments">
                <span>✏️ Edit</span>
              </button>
              ${isAdmin ? `
                <button 
                  onclick="Trips.promptDelete('${t.tripId || t.id}')"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Delete Trip">
                  🗑️
                </button>
              ` : ''}
            </div>
          </td>

          <!-- 1. S.No -->
          <td class="py-3 px-3 text-center font-mono text-slate-500 font-bold whitespace-nowrap">${t.sNo || (idx + 1)}</td>

          <!-- 2. Trip Date -->
          <td class="py-3 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">${Utils.formatDisplayDate(t.tripDate)}</td>

          <!-- 3. Vehicle No -->
          <td class="py-3 px-3 whitespace-nowrap">
            <span class="px-2 py-0.5 font-mono text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-700">${t.vehicleNo}</span>
          </td>

          <!-- 4. From -->
          <td class="py-3 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">${t.from || '-'}</td>

          <!-- 5. To -->
          <td class="py-3 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">${t.to || '-'}</td>

          <!-- 6. Freight Amount -->
          <td class="py-3 px-3 text-right whitespace-nowrap font-black text-slate-900 dark:text-white">${Utils.formatCurrency(calc.freight)}</td>

          <!-- 7. Advance Date -->
          <td class="py-3 px-3 text-center whitespace-nowrap text-slate-500">${Utils.formatDisplayDate(t.advanceDate)}</td>

          <!-- 8. Advance Amount -->
          <td class="py-3 px-3 text-right whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">${Utils.formatCurrency(calc.advance)}</td>

          <!-- 9. Halting Details -->
          <td class="py-3 px-3 whitespace-nowrap text-slate-500 max-w-[150px] truncate" title="${t.haltingDetails || t.halting || ''}">${t.haltingDetails || t.halting || '-'}</td>

          <!-- 10. TRSP Name -->
          <td class="py-3 px-3 whitespace-nowrap text-center">
            <span class="px-2 py-0.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">${t.trspName || '-'}</span>
          </td>

          <!-- 11. TRSP Comm -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.trspCommission)}</td>

          <!-- 12. Diesel -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.diesel)}</td>

          <!-- 13. Toll Charges -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.toll)}</td>

          <!-- 14. Loading Charges -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.loading)}</td>

          <!-- 15. Unloading Charges -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.unloading)}</td>

          <!-- 16. Police Exp -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.police)}</td>

          <!-- 17. RTA C/P -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.rta)}</td>

          <!-- 18. Other Expenses -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400" title="${t.otherExpenseNotes || ''}">${Utils.formatCurrency(calc.otherExpenses)}</td>

          <!-- 19. Driver Comm -->
          <td class="py-3 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">${Utils.formatCurrency(calc.driverExp)}</td>

          <!-- 20. Sum OF Total Exp (9 expenses sum) -->
          <td class="py-3 px-3 text-right whitespace-nowrap font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20">${Utils.formatCurrency(calc.totalExpenses)}</td>

          <!-- 21. Total Exp Given (Advance + Total Exp) -->
          <td class="py-3 px-3 text-right whitespace-nowrap font-black text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20">${Utils.formatCurrency(totalExpGiven)}</td>

          <!-- 22. Status -->
          <td class="py-3 px-3 text-center whitespace-nowrap">
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded ${isCleared ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
              ${calc.tripStatus}
            </span>
          </td>

          <!-- 23. P/L -->
          <td class="py-3 px-3 text-center whitespace-nowrap">${plFormatted}</td>

          <!-- 24. Date Balance Recd -->
          <td class="py-3 px-3 whitespace-nowrap text-center text-slate-500">${Utils.formatDisplayDate(balanceRecdDate)}</td>

          <!-- 25. Balance Amount -->
          <td class="py-3 px-3 text-right whitespace-nowrap font-black bg-amber-50/40 dark:bg-amber-950/20">${balanceDisplay}</td>
        </tr>
      `;
    }).join('');
  }
};

// Global handlers for scope buttons & filters
window.setViewType = function(type) {
  TripTable.setViewType(type);
};

window.applySelectedDate = function() {
  TripTable.applySelectedDate();
};

window.applyDateRange = function() {
  TripTable.applyDateRange();
};

window.applyEntireMonth = function() {
  TripTable.applyEntireMonth();
};

window.setStatusFilter = function(status) {
  TripTable.setStatusFilter(status);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TripTable;
}

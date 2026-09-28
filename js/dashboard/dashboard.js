/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - VEHICLE DASHBOARD
 * Version: 2.4.2
 */

const Dashboard = {
  render() {
    const vNo = appState.currentVehicle;
    if (!vNo) {
      Router.navigate('vehicles');
      return;
    }

    // Filter trips strictly by current vehicle and active date scope
    const vehicleTrips = VehicleWorkspace.getFilteredTrips({ includeStatus: false, includeSearch: false });
    const allVehicleTrips = (appState.trips || []).filter(t => t.vehicleNo === vNo);

    // Aggregations for currently scoped trips
    let totalFreight = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    let totalAdvance = 0;
    let totalOriginalBalance = 0;
    let totalReceived = 0;
    let totalPendingReceivable = 0;

    let notReceivedCount = 0;
    let notReceivedAmount = 0;
    let partialCount = 0;
    let partialAmount = 0;
    let clearedCount = 0;
    let clearedAmount = 0;

    const pendingTrips = [];

    vehicleTrips.forEach(t => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      totalFreight += calc.freight;
      totalExpenses += calc.totalExpenses;
      totalProfit += calc.profitLoss;
      totalAdvance += calc.advance;
      totalOriginalBalance += calc.originalBalance;
      totalReceived += calc.totalReceived;
      totalPendingReceivable += calc.remainingBalance;

      if (calc.remainingBalance === 0) {
        clearedCount++;
        clearedAmount += calc.originalBalance;
      } else if (calc.totalReceived > 0) {
        partialCount++;
        partialAmount += calc.remainingBalance;
        pendingTrips.push({ trip: t, calc });
      } else {
        notReceivedCount++;
        notReceivedAmount += calc.remainingBalance;
        pendingTrips.push({ trip: t, calc });
      }
    });

    const pendingTotalCount = notReceivedCount + partialCount;
    const profitMargin = totalFreight > 0 ? ((totalProfit / totalFreight) * 100).toFixed(1) : 0;

    // Monthly Profit & Loss Aggregations (from all trips of this vehicle)
    const monthlyDataMap = {};
    allVehicleTrips.forEach(t => {
      const d = t.tripDate ? Utils.toInputDateFormat(t.tripDate) : '';
      const mKey = d ? d.slice(0, 7) : 'Unassigned';
      if (!monthlyDataMap[mKey]) {
        monthlyDataMap[mKey] = {
          monthKey: mKey,
          tripsCount: 0,
          freight: 0,
          expenses: 0,
          profit: 0,
          advance: 0,
          originalBalance: 0,
          received: 0,
          pending: 0
        };
      }
      const c = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      monthlyDataMap[mKey].tripsCount++;
      monthlyDataMap[mKey].freight += c.freight;
      monthlyDataMap[mKey].expenses += c.totalExpenses;
      monthlyDataMap[mKey].profit += c.profitLoss;
      monthlyDataMap[mKey].advance += c.advance;
      monthlyDataMap[mKey].originalBalance += c.originalBalance;
      monthlyDataMap[mKey].received += c.totalReceived;
      monthlyDataMap[mKey].pending += c.remainingBalance;
    });

    const monthlyRows = Object.values(monthlyDataMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    const userName = (appState.currentUser && appState.currentUser.name) ? appState.currentUser.name : 'Fleet Operator';
    const userRole = (appState.currentUser && appState.currentUser.role) ? appState.currentUser.role : 'Authorized';
    const now = new Date();
    const todayFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const container = document.getElementById('dashboard-metrics-container');
    if (!container) return;

    container.innerHTML = `
      <!-- 0. High-Visibility Welcome & Active Vehicle Header Banner -->
      <div class="mb-6 bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl text-3xl border border-indigo-100 dark:border-indigo-800 shadow-inner">
            🚛
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Operational Workspace</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono border border-indigo-200 dark:border-indigo-700">🚚 ${vNo}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              Welcome, ${userName}! 👋
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Active Lorry: <strong class="text-indigo-600 dark:text-indigo-400 font-mono font-black">${vNo}</strong></span>
              <span>&bull;</span>
              <span>Date: <strong class="text-slate-700 dark:text-slate-300">${todayFormatted}</strong></span>
              <span>&bull;</span>
              <span>Role: <strong class="text-slate-700 dark:text-slate-300">${userRole}</strong></span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          <button onclick="VehicleWorkspace.changeVehicle()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5">
            <span>🔄</span>
            <span>Switch Vehicle</span>
          </button>
          <button onclick="TripForm.openAddModal()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5">
            <span class="text-sm font-bold">+</span>
            <span>Record Shipment</span>
          </button>
        </div>
      </div>

      <!-- 1. Top Outstanding Balance Notice Banner (if any balance is pending) -->
      ${pendingTotalCount > 0 ? `
        <div class="mb-6 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-2 border-rose-500/40 dark:border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div class="flex items-center gap-3.5">
            <div class="p-3 bg-rose-600 text-white rounded-2xl text-2xl shadow-md">🚨</div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Receivable Alert</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">${pendingTotalCount} Trips Pending</span>
              </div>
              <h3 class="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Outstanding Balance of <span class="text-rose-600 dark:text-rose-400">${Utils.formatCurrency(totalPendingReceivable)}</span> pending for ${vNo}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customer balance is separate from trip profits. Installment receipts must be recorded to clear.</p>
            </div>
          </div>
          <button 
            onclick="Dashboard.openOutstandingModal()" 
            class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>⚠️ Review & Settle Balances</span>
            <span>&rarr;</span>
          </button>
        </div>
      ` : `
        <div class="mb-6 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🟢</span>
            <div>
              <h4 class="text-sm font-black text-emerald-800 dark:text-emerald-300">All Customer Balances Cleared</h4>
              <p class="text-xs text-emerald-600 dark:text-emerald-400">Every recorded shipment for ${vNo} is 100% settled. Remaining: ₹0</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-xl">CLEARED (₹0)</span>
        </div>
      `}

      <!-- 2. Primary Financial Metrics Grid (4 KPI Cards - 2 cols on mobile, 4 on desktop) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <!-- Card 1: Total Trips -->
        <div class="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Operations</span>
            <span class="text-lg">🚛</span>
          </div>
          <div class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">${vehicleTrips.length}</div>
          <div class="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>${vNo}</span>
            <span class="text-slate-400 font-bold">${clearedCount} Paid</span>
          </div>
        </div>

        <!-- Card 2: Total Freight -->
        <div class="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Freight</span>
            <span class="text-lg">📦</span>
          </div>
          <div class="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-mono truncate">${Utils.formatCurrency(totalFreight)}</div>
          <div class="text-[11px] text-slate-500 mt-1.5">Gross Billing</div>
        </div>

        <!-- Card 3: Total Expenses -->
        <div class="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <span class="text-lg">⛽</span>
          </div>
          <div class="text-lg sm:text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono truncate">${Utils.formatCurrency(totalExpenses)}</div>
          <div class="text-[11px] text-slate-500 mt-1.5">Sum of 9 Costs</div>
        </div>

        <!-- Card 4: Net Trip Profit -->
        <div class="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider">Net Profit (${profitMargin}%)</span>
            <span class="text-lg">📈</span>
          </div>
          <div class="text-lg sm:text-2xl lg:text-3xl font-black ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-mono truncate">
            ${totalProfit >= 0 ? '+' : ''}${Utils.formatCurrency(totalProfit)}
          </div>
          <div class="text-[11px] text-slate-500 mt-1.5">Freight &minus; Expenses</div>
        </div>
      </div>

      <!-- 3. Prominent Customer Balance & Receivable Settlement Center -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl mb-8 border border-indigo-900/60">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase bg-cyan-900/80 text-cyan-300 border border-cyan-400/30">Receivables Ledger</span>
              <span class="text-xs text-slate-400 font-mono font-bold">${vNo}</span>
            </div>
            <h3 class="text-lg font-black text-white flex items-center gap-2">
              <span>💳</span>
              <span>Customer Balance & Installment Settlement Center</span>
            </h3>
            <p class="text-xs text-slate-400">Strictly separate from profit/loss. Original Balance = Freight &minus; Advance. Remaining = Original &minus; Receipts.</p>
          </div>
          
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="Dashboard.openOutstandingModal()" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer">
              ⚠️ View Pending List (${pendingTotalCount})
            </button>
            <button onclick="Router.navigate('trips')" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition cursor-pointer">
              Go to Trips Ledger &rarr;
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Advance Recd</div>
            <div class="text-xl sm:text-2xl font-black font-mono text-teal-300">${Utils.formatCurrency(totalAdvance)}</div>
            <div class="text-[10px] text-slate-400 mt-1">Paid at trip dispatch</div>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Original Balance</div>
            <div class="text-xl sm:text-2xl font-black font-mono text-white">${Utils.formatCurrency(totalOriginalBalance)}</div>
            <div class="text-[10px] text-slate-400 mt-1">Freight &minus; Advance</div>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Received</div>
            <div class="text-xl sm:text-2xl font-black font-mono text-emerald-400">${Utils.formatCurrency(totalReceived)}</div>
            <div class="text-[10px] text-slate-400 mt-1">Sum of installments</div>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border ${totalPendingReceivable > 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-emerald-500/50 bg-emerald-950/20'}">
            <div class="text-[11px] font-bold uppercase tracking-wider mb-1 ${totalPendingReceivable > 0 ? 'text-rose-300' : 'text-emerald-300'}">Remaining Receivable</div>
            <div class="text-xl sm:text-2xl font-black font-mono ${totalPendingReceivable > 0 ? 'text-rose-400' : 'text-emerald-400'}">
              ${Utils.formatCurrency(totalPendingReceivable)}
            </div>
            <div class="text-[10px] mt-1 ${totalPendingReceivable > 0 ? 'text-rose-300/80 font-bold' : 'text-emerald-300/80'}">
              ${totalPendingReceivable > 0 ? '🔴 Pending Recovery' : '🟢 Fully Cleared (₹0)'}
            </div>
          </div>
        </div>

        <!-- 3 Settlement Category Breakdown Pills -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span class="flex items-center gap-1.5 font-bold text-rose-300">
              <span>🔴</span>
              <span>Not Received:</span>
            </span>
            <span class="font-mono font-bold">${notReceivedCount} trips &bull; ${Utils.formatCurrency(notReceivedAmount)}</span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span class="flex items-center gap-1.5 font-bold text-amber-300">
              <span>🟡</span>
              <span>Partially Received:</span>
            </span>
            <span class="font-mono font-bold">${partialCount} trips &bull; ${Utils.formatCurrency(partialAmount)}</span>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span class="flex items-center gap-1.5 font-bold text-emerald-300">
              <span>🟢</span>
              <span>Fully Cleared:</span>
            </span>
            <span class="font-mono font-bold">${clearedCount} trips &bull; ${Utils.formatCurrency(clearedAmount)}</span>
          </div>
        </div>
      </div>

      <!-- 4. Monthly Profit & Loss Breakdown Matrix -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📊</span>
              <span>Monthly Profit & Loss Breakdown (${vNo})</span>
            </h3>
            <p class="text-xs text-slate-500">Chronological financial margins, operational costs, and receivable balance per month</p>
          </div>
          <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold font-mono">
            ${monthlyRows.length} Operational Months
          </span>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-3.5">Month</th>
                <th class="py-3 px-3 text-center">Trips</th>
                <th class="py-3 px-3 text-right">Gross Freight</th>
                <th class="py-3 px-3 text-right">Operational Exp</th>
                <th class="py-3 px-3 text-right">Net Profit / Loss</th>
                <th class="py-3 px-3 text-right">Orig. Balance</th>
                <th class="py-3 px-3 text-right">Total Received</th>
                <th class="py-3 px-3 text-right">Pending Balance</th>
                <th class="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              ${monthlyRows.length === 0 ? `
                <tr>
                  <td colspan="9" class="py-6 text-center text-slate-400 font-sans">No monthly trip records found for ${vNo}.</td>
                </tr>
              ` : monthlyRows.map(m => {
                const isProf = m.profit >= 0;
                const margin = m.freight > 0 ? ((m.profit / m.freight) * 100).toFixed(1) : 0;
                const isAllCleared = m.pending === 0;

                // Month display label
                let monthLabel = m.monthKey;
                try {
                  const [y, mm] = m.monthKey.split('-');
                  if (y && mm) {
                    const dt = new Date(Number(y), Number(mm) - 1, 1);
                    monthLabel = dt.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
                  }
                } catch (_) {}

                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-3.5 font-bold font-sans text-slate-900 dark:text-white">
                      ${monthLabel}
                    </td>
                    <td class="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      ${m.tripsCount}
                    </td>
                    <td class="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                      ${Utils.formatCurrency(m.freight)}
                    </td>
                    <td class="py-3 px-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                      ${Utils.formatCurrency(m.expenses)}
                    </td>
                    <td class="py-3 px-3 text-right font-black ${isProf ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                      ${isProf ? '+' : ''}${Utils.formatCurrency(m.profit)} <span class="text-[10px] font-sans font-bold">(${margin}%)</span>
                    </td>
                    <td class="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                      ${Utils.formatCurrency(m.originalBalance)}
                    </td>
                    <td class="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      ${Utils.formatCurrency(m.received)}
                    </td>
                    <td class="py-3 px-3 text-right font-black ${isAllCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                      ${Utils.formatCurrency(m.pending)} ${isAllCleared ? '🟢' : '🔴'}
                    </td>
                    <td class="py-3 px-3 text-center">
                      <button 
                        onclick="Dashboard.viewMonth('${m.monthKey}')" 
                        class="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950 dark:text-blue-300 rounded-lg transition cursor-pointer">
                        Filter &rarr;
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /**
   * Filter trips table to a specific month directly from the dashboard
   */
  viewMonth(monthKey) {
    if (!monthKey || monthKey === 'Unassigned') return;
    appState.filters.viewType = 'ENTIRE_MONTH';
    appState.filters.selectedMonth = monthKey;
    Router.navigate('trips');
    if (typeof TripTable !== 'undefined') {
      TripTable.renderScopeControls();
      TripTable.render();
    }
    Utils.showToast(`📆 Filtered Trips to ${monthKey}`);
  },

  /**
   * Open the Outstanding Balances recovery modal
   */
  openOutstandingModal() {
    this.renderOutstandingModal();
    const modal = document.getElementById('modal-outstanding-balances');
    if (modal) modal.classList.remove('hidden');
  },

  /**
   * Close the Outstanding Balances modal
   */
  closeOutstandingModal() {
    const modal = document.getElementById('modal-outstanding-balances');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Render the list inside the Outstanding Balances modal
   */
  renderOutstandingModal() {
    const vNo = appState.currentVehicle;
    const container = document.getElementById('outstanding-balances-list');
    const subtitle = document.getElementById('outstanding-modal-subtitle');
    if (!container) return;

    const trips = (appState.trips || []).filter(t => t.vehicleNo === vNo);
    const pending = [];

    trips.forEach(t => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      if (calc.remainingBalance > 0) {
        pending.push({ trip: t, calc });
      }
    });

    if (subtitle) {
      subtitle.textContent = `${pending.length} outstanding trip(s) for vehicle ${vNo}`;
    }

    if (pending.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div class="text-3xl mb-2">🎉</div>
          <h4 class="text-sm font-black text-emerald-800 dark:text-emerald-300">All Balances 100% Cleared!</h4>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">No pending customer receivables found for ${vNo}.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = pending.map(({ trip, calc }, idx) => {
      return `
        <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono">
                TRIP #${trip.sNo || (idx + 1)}
              </span>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${Utils.formatDisplayDate(trip.tripDate)}</span>
              <span class="text-xs text-slate-400">&bull;</span>
              <span class="text-xs text-slate-600 dark:text-slate-400 font-bold">${trip.from || '-'} ➔ ${trip.to || '-'}</span>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs mt-1.5 font-mono">
              <span>Freight: <strong>${Utils.formatCurrency(calc.freight)}</strong></span>
              <span>&bull;</span>
              <span>Advance: <strong>${Utils.formatCurrency(calc.advance)}</strong></span>
              <span>&bull;</span>
              <span>Original Bal: <strong>${Utils.formatCurrency(calc.originalBalance)}</strong></span>
              <span>&bull;</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold">Recd: +${Utils.formatCurrency(calc.totalReceived)}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-center">
            <div class="text-right">
              <div class="text-[10px] font-bold text-slate-400 uppercase">Remaining</div>
              <div class="text-base font-black text-rose-600 dark:text-rose-400 font-mono">${Utils.formatCurrency(calc.remainingBalance)}</div>
            </div>
            <button 
              onclick="Dashboard.settlePendingTrip('${trip.tripId || trip.id}')"
              class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
              <span>💳</span>
              <span>Settle Payment</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Direct shortcut from Outstanding modal to open Edit/Settlement drawer
   */
  settlePendingTrip(tripId) {
    this.closeOutstandingModal();
    if (typeof TripForm !== 'undefined' && typeof TripForm.openEditDrawer === 'function') {
      TripForm.openEditDrawer(tripId);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}


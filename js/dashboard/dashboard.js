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
    const viewType = appState.filters.viewType || 'ALL_TRIPS';

    // Aggregations
    let totalFreight = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    let totalAdvance = 0;
    let totalOriginalBalance = 0;
    let totalReceived = 0;
    let totalPendingReceivable = 0;
    let pendingCount = 0;
    let clearedCount = 0;

    vehicleTrips.forEach(t => {
      // Calculate latest numbers
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      totalFreight += calc.freight;
      totalExpenses += calc.totalExpenses;
      totalProfit += calc.profitLoss;
      totalAdvance += calc.advance;
      totalOriginalBalance += calc.originalBalance;
      totalReceived += calc.totalReceived;
      totalPendingReceivable += calc.remainingBalance;

      if (calc.remainingBalance > 0) {
        pendingCount++;
      } else {
        clearedCount++;
      }
    });

    const container = document.getElementById('dashboard-metrics-container');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Card 1: Total Trips -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider">Total Trips</span>
            <span class="text-xl">🚛</span>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white">${vehicleTrips.length}</div>
          <div class="text-xs text-slate-500 mt-2">Active in ${vNo}</div>
        </div>

        <!-- Card 2: Total Freight -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider">Total Freight</span>
            <span class="text-xl">📦</span>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white">${Utils.formatCurrency(totalFreight)}</div>
          <div class="text-xs text-slate-500 mt-2">Gross customer billing</div>
        </div>

        <!-- Card 3: Total Expenses (9 Logistical Expenses) -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <span class="text-xl">⛽</span>
          </div>
          <div class="text-3xl font-black text-amber-600 dark:text-amber-400">${Utils.formatCurrency(totalExpenses)}</div>
          <div class="text-xs text-slate-500 mt-2">Sum of 9 operational costs</div>
        </div>

        <!-- Card 4: Net Trip Profit -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider">Net Profit</span>
            <span class="text-xl">📈</span>
          </div>
          <div class="text-3xl font-black ${totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
            ${totalProfit >= 0 ? '+' : ''}${Utils.formatCurrency(totalProfit)}
          </div>
          <div class="text-xs text-slate-500 mt-2">Freight − Expenses</div>
        </div>
      </div>

      <!-- Financial Balance & Receivable Strip -->
      <div class="bg-slate-900 text-white p-6 rounded-xl shadow-xl mb-8 border border-slate-800">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <span>💳</span>
              <span>Customer Balance & Settlement Tracker (${vNo})</span>
            </h3>
            <p class="text-xs text-slate-400">Independent receivable ledger from customer advances and installment receipts</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${pendingCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
              ${pendingCount > 0 ? `🔴 ${pendingCount} Payment Pending` : '🟢 All Cleared'}
            </span>
            <button onclick="Router.navigate('trips')" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg transition">View Trip Ledger &rarr;</button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Advance</div>
            <div class="text-xl font-black text-slate-200">${Utils.formatCurrency(totalAdvance)}</div>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Original Balance</div>
            <div class="text-xl font-black text-slate-200">${Utils.formatCurrency(totalOriginalBalance)}</div>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Received</div>
            <div class="text-xl font-black text-emerald-400">${Utils.formatCurrency(totalReceived)}</div>
          </div>
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Remaining Receivable</div>
            <div class="text-xl font-black ${totalPendingReceivable > 0 ? 'text-rose-400' : 'text-emerald-400'}">
              ${Utils.formatCurrency(totalPendingReceivable)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}


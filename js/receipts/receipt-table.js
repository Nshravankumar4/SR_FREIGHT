/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - BALANCE RECEIPT TABLE RENDERER
 * Version: 2.4.2
 */

const ReceiptTable = {
  render(trip, containerId = 'drawer-receipts-table-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const receipts = Array.isArray(trip.balanceReceipts) ? trip.balanceReceipts : [];

    const origBal = Number(trip.originalBalance !== undefined ? trip.originalBalance : ((trip.freightAmount !== undefined ? trip.freightAmount : (trip.freight || 0)) - (trip.advanceAmount !== undefined ? trip.advanceAmount : (trip.advance || 0)))) || 0;

    if (receipts.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          No balance payments received yet. Original Balance: <span class="font-bold text-slate-700 dark:text-slate-300">₹${origBal.toLocaleString('en-IN')}</span>
        </div>
      `;
      return;
    }

    let runningRemaining = origBal;

    const rowsHtml = receipts.map((r, idx) => {
      const amt = Number(r.amount !== undefined ? r.amount : (r.receivedAmount || 0));
      runningRemaining = Math.max(0, runningRemaining - amt);

      return `
        <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
          <td class="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">#${idx + 1}</td>
          <td class="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">${Utils.formatDisplayDate(r.receivedDate || r.date)}</td>
          <td class="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">+₹${amt.toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-3 font-mono ${runningRemaining === 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-semibold'}">
            ₹${runningRemaining.toLocaleString('en-IN')}
          </td>
          <td class="py-2.5 px-3 text-slate-500 truncate max-w-[120px]" title="${r.notes || ''}">${r.notes || '-'}</td>
          <td class="py-2.5 px-3 text-right">
            <button 
              type="button" 
              onclick="Receipts.deleteReceipt('${trip.tripId || trip.id}', '${r.receiptId || idx}')"
              class="text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-2 px-3">#</th>
              <th class="py-2 px-3">Date</th>
              <th class="py-2 px-3">Received</th>
              <th class="py-2 px-3">Remaining</th>
              <th class="py-2 px-3">Notes</th>
              <th class="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReceiptTable;
}


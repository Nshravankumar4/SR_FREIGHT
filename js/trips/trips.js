/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - MAIN TRIP CONTROLLER
 * Version: 2.4.2
 */

const Trips = {
  render() {
    TripTable.render();
  },

  renderTable() {
    TripTable.render();
  },

  /**
   * Save trip data to localStorage
   */
  persistState() {
    try {
      localStorage.setItem(CONFIG.DATA_STORAGE_KEY, JSON.stringify(appState.trips));
    } catch (_) {}
  },

  /**
   * Load existing trips from localStorage or fallback
   */
  loadFromLocal() {
    try {
      const raw = localStorage.getItem(CONFIG.DATA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          appState.trips = parsed;
          return;
        }
      }
    } catch (_) {}

    // Fallback: seed trips if empty
    if (!appState.trips || appState.trips.length === 0) {
      appState.trips = [
        {
          tripId: 'TRIP-20260828-0001',
          sNo: 1,
          tripDate: '2026-08-28',
          vehicleNo: 'TS15UE1122',
          from: 'Hyderabad, Telangana',
          to: 'Purnia, Bihar',
          freightAmount: 200000,
          advanceDate: '2026-08-28',
          advanceAmount: 90000,
          haltingDetails: 'Two days halting during transit',
          trspName: 'MRC',
          trspCommission: 2000,
          diesel: 50000,
          tollCharges: 10000,
          loadingCharges: 2500,
          unloadingCharges: 2500,
          policeExp: 1000,
          rtaExp: 1000,
          otherExpenses: 1000,
          driverExp: 12000,
          tripStatus: 'Pending',
          balanceReceipts: []
        },
        {
          tripId: 'TRIP-20260828-0002',
          sNo: 2,
          tripDate: '2026-08-28',
          vehicleNo: 'TG15T6666',
          from: 'Hyderabad, Telangana',
          to: 'Purnia, Bihar',
          freightAmount: 250000,
          advanceDate: '2026-08-28',
          advanceAmount: 90000,
          haltingDetails: 'Two days halting during transit',
          trspName: 'MRC',
          trspCommission: 2000,
          diesel: 80000,
          tollCharges: 10000,
          loadingCharges: 2500,
          unloadingCharges: 2500,
          policeExp: 1000,
          rtaExp: 1000,
          otherExpenses: 1000,
          driverExp: 12000,
          tripStatus: 'Paid',
          balanceReceipts: []
        }
      ];
      this.persistState();
    }
  },

  /**
   * Fetch trips for active vehicle from Google Apps Script
   */
  async loadVehicleTrips(vehicleNo) {
    if (!vehicleNo) return;
    try {
      const res = await Api.getTrips(vehicleNo);
      if (res && res.data && Array.isArray(res.data)) {
        // Non-destructive merge: preserve local records not yet synced
        const remoteTrips = res.data;
        const otherVehicleTrips = (appState.trips || []).filter(t => t.vehicleNo !== vehicleNo);
        appState.trips = [...otherVehicleTrips, ...remoteTrips];
        this.persistState();
        this.renderTable();
        if (appState.currentPage === 'dashboard') {
          Dashboard.render();
        }
      }
    } catch (err) {
      console.warn("loadVehicleTrips note:", err);
    }
  },

  /**
   * Save a newly created trip
   */
  async saveNewTrip(e) {
    e.preventDefault();
    const vNo = appState.currentVehicle;
    if (!vNo) return;

    const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;

    const rawTrip = {
      tripId: Utils.generateTripId(vNo),
      sNo: (appState.trips.length + 1),
      tripDate: getVal('add-trip-date'),
      vehicleNo: vNo,
      from: getVal('add-from'),
      to: getVal('add-to'),
      freightAmount: getNum('add-freight'),
      advanceDate: getVal('add-advance-date'),
      advanceAmount: getNum('add-advance'),
      haltingDetails: getVal('add-halting'),
      trspName: getVal('add-trsp-name'),

      // 9 Expenses
      diesel: getNum('add-diesel'),
      tollCharges: getNum('add-toll'),
      rtaExp: getNum('add-rta'),
      policeExp: getNum('add-police'),
      loadingCharges: getNum('add-loading'),
      unloadingCharges: getNum('add-unloading'),
      driverExp: getNum('add-driver-comm'),
      trspCommission: getNum('add-trsp-commission'),
      otherExpenses: getNum('add-other'),
      otherExpenseNotes: getVal('add-other-notes'),

      tripStatus: getVal('add-status') || 'In Progress',
      balanceReceipts: []
    };

    // Validate
    const validation = TripValidation.validate(rawTrip);
    if (!validation.isValid) {
      alert("Please fix the following errors:\n\n" + validation.errors.join("\n"));
      return;
    }

    const calculated = FinancialEngine.calculateTrip(rawTrip, []);

    // Add to state
    appState.trips.unshift(calculated);
    this.persistState();

    TripForm.closeAddModal();
    this.renderTable();
    if (appState.currentPage === 'dashboard') Dashboard.render();

    Utils.showToast(`✅ Trip ${calculated.tripId} created successfully for ${vNo}!`);

    // Cloud sync
    try {
      await Api.createTrip(calculated, vNo);
    } catch (err) {
      console.warn("createTrip cloud sync note:", err);
    }
  },

  /**
   * Save edits to an existing trip
   */
  async saveTripEdits(e) {
    e.preventDefault();
    const tripId = appState.editingTripId;
    if (!tripId) return;

    const trip = appState.trips.find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId));
    if (!trip) return;

    const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;

    trip.tripDate = getVal('edit-trip-date');
    trip.from = getVal('edit-from');
    trip.to = getVal('edit-to');
    trip.freightAmount = getNum('edit-freight');
    trip.advanceDate = getVal('edit-advance-date');
    trip.advanceAmount = getNum('edit-advance');
    trip.haltingDetails = getVal('edit-halting');
    trip.trspName = getVal('edit-trsp-name');

    trip.diesel = getNum('edit-diesel');
    trip.tollCharges = getNum('edit-toll');
    trip.rtaExp = getNum('edit-rta');
    trip.policeExp = getNum('edit-police');
    trip.loadingCharges = getNum('edit-loading');
    trip.unloadingCharges = getNum('edit-unloading');
    trip.driverExp = getNum('edit-driver-comm');
    trip.trspCommission = getNum('edit-trsp-commission');
    trip.otherExpenses = getNum('edit-other');
    trip.otherExpenseNotes = getVal('edit-other-notes');
    trip.tripStatus = getVal('edit-status');

    // Validate
    const validation = TripValidation.validate(trip);
    if (!validation.isValid) {
      alert("Please fix the following errors:\n\n" + validation.errors.join("\n"));
      return;
    }

    const recalculated = FinancialEngine.calculateTrip(trip, trip.balanceReceipts || []);
    Object.assign(trip, recalculated);

    this.persistState();

    TripForm.closeEditDrawer();
    this.renderTable();
    if (appState.currentPage === 'dashboard') Dashboard.render();

    Utils.showToast(`✅ Trip ${recalculated.tripId || recalculated.sNo} updated successfully!`);

    // Cloud sync
    try {
      await Api.updateTrip(recalculated, trip.vehicleNo);
    } catch (err) {
      console.warn("updateTrip cloud sync note:", err);
    }
  },

  /**
   * Delete trip (Admin only)
   */
  async promptDelete(tripId) {
    if (!Auth.isAdmin()) {
      alert("Permission Denied: Only Administrators can delete trip records.");
      return;
    }

    const trip = appState.trips.find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId));
    if (!trip) return;

    if (!confirm(`Are you sure you want to permanently delete Trip #${trip.sNo || trip.tripId} (${trip.from} ➔ ${trip.to})?`)) {
      return;
    }

    // Remove from state
    appState.trips = appState.trips.filter(t => String(t.tripId || t.id) !== String(tripId) && Number(t.id) !== Number(tripId));
    this.persistState();

    this.renderTable();
    if (appState.currentPage === 'dashboard') Dashboard.render();

    Utils.showToast(`🗑️ Trip #${trip.sNo || trip.tripId} deleted successfully.`, 'warning');

    // Cloud sync
    try {
      await Api.deleteTrip(trip.tripId, trip.vehicleNo);
    } catch (err) {
      console.warn("deleteTrip cloud sync note:", err);
    }
  },

  /**
   * Open the dedicated Read-Only Trip View Modal (Pure Data Viewing)
   */
  openViewModal(tripId) {
    const trip = (appState.trips || []).find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId) || String(t.sNo) === String(tripId));
    if (!trip) return;

    const calc = FinancialEngine.calculateTrip(trip, trip.balanceReceipts || []);
    const isCleared = calc.remainingBalance === 0;
    const isProfit = calc.profitLoss >= 0;
    const totalExpGiven = calc.advance + calc.totalExpenses;
    const marginPct = calc.freight > 0 ? ((calc.profitLoss / calc.freight) * 100).toFixed(1) : 0;

    const modalContent = document.getElementById('view-trip-modal-content');
    if (!modalContent) return;

    // Receipts read-only rows
    const receipts = Array.isArray(trip.balanceReceipts) ? trip.balanceReceipts : [];
    let receiptsHtml = '';
    if (receipts.length === 0) {
      receiptsHtml = `
        <div class="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          No balance payments received yet. Original Balance: <strong class="text-slate-800 dark:text-slate-200">${Utils.formatCurrency(calc.originalBalance)}</strong>
        </div>
      `;
    } else {
      let runRemaining = calc.originalBalance;
      const rows = receipts.map((r, i) => {
        const amt = Number(r.amount !== undefined ? r.amount : (r.receivedAmount || 0));
        runRemaining = Math.max(0, runRemaining - amt);
        return `
          <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
            <td class="py-2.5 px-3 font-semibold text-slate-500">#${i + 1}</td>
            <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 font-bold">${Utils.formatDisplayDate(r.receivedDate || r.date)}</td>
            <td class="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">+${Utils.formatCurrency(amt)}</td>
            <td class="py-2.5 px-3 font-mono ${runRemaining === 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-semibold'}">${Utils.formatCurrency(runRemaining)}</td>
            <td class="py-2.5 px-3 text-slate-500">${r.notes || '-'}</td>
          </tr>
        `;
      }).join('');

      receiptsHtml = `
        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
              <tr>
                <th class="py-2 px-3">#</th>
                <th class="py-2 px-3">Date</th>
                <th class="py-2 px-3">Received Amount</th>
                <th class="py-2 px-3">Remaining Balance</th>
                <th class="py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    modalContent.innerHTML = `
      <div class="space-y-6">
        <!-- 1. Executive Hero Header -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-indigo-900/60">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2.5 mb-2">
                <span class="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-400/40 rounded-xl font-mono font-black text-xs">
                  TRIP #${trip.sNo || trip.id || 1}
                </span>
                <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  ${trip.vehicleNo}
                </span>
                <span class="px-3 py-1 text-xs font-black rounded-xl ${isCleared ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'}">
                  ${isCleared ? '🟢 PAYMENT CLEARED' : '🔴 PAYMENT PENDING'}
                </span>
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-white/10 text-slate-200">
                  Status: ${calc.tripStatus}
                </span>
              </div>

              <!-- Route & Dates -->
              <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10">
                  <span>📍 From:</span> <strong class="text-cyan-300">${trip.from || '-'}</strong>
                </span>
                <span class="text-cyan-400 font-black text-base">➔</span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10">
                  <span>🏁 To:</span> <strong class="text-cyan-300">${trip.to || '-'}</strong>
                </span>
                <span class="text-xs text-slate-400 ml-2 font-medium">
                  Dispatched on <strong class="text-slate-200">${Utils.formatDisplayDate(trip.tripDate)}</strong>
                </span>
              </div>
            </div>

            <!-- Header Action Buttons -->
            <div class="flex items-center gap-2">
              <button onclick="Trips.openEditFromView('${trip.tripId || trip.id}')" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition cursor-pointer">
                <span>✏️ Edit This Trip</span>
              </button>
              <button onclick="Trips.closeViewModal()" class="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition cursor-pointer">
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        <!-- 2. 6 Financial Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <!-- 6. Freight Amount -->
          <div class="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5">
            <div class="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">6. Freight Amount</div>
            <div class="text-lg font-black font-mono text-indigo-950 dark:text-indigo-200 mt-1">${Utils.formatCurrency(calc.freight)}</div>
            <div class="text-[10px] text-slate-500 mt-1">Contract Total</div>
          </div>

          <!-- 8. Advance Amount -->
          <div class="bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl p-3.5">
            <div class="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400">8. Advance Amount</div>
            <div class="text-lg font-black font-mono text-teal-950 dark:text-teal-200 mt-1">${Utils.formatCurrency(calc.advance)}</div>
            <div class="text-[10px] text-slate-500 mt-1">Date: ${Utils.formatDisplayDate(trip.advanceDate)}</div>
          </div>

          <!-- 20. Sum OF Total Exp -->
          <div class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5">
            <div class="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">20. Total Expenses</div>
            <div class="text-lg font-black font-mono text-amber-950 dark:text-amber-200 mt-1">${Utils.formatCurrency(calc.totalExpenses)}</div>
            <div class="text-[10px] text-slate-500 mt-1">Sum of 9 Expenses</div>
          </div>

          <!-- 21. Total Exp Given -->
          <div class="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3.5">
            <div class="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400">21. Exp Given</div>
            <div class="text-lg font-black font-mono text-purple-950 dark:text-purple-200 mt-1">${Utils.formatCurrency(totalExpGiven)}</div>
            <div class="text-[10px] text-slate-500 mt-1">Adv + Expenses</div>
          </div>

          <!-- 23. Net P/L -->
          <div class="${isProfit ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'} border rounded-xl p-3.5">
            <div class="text-[10px] font-black uppercase ${isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">23. Net P/L (${marginPct}%)</div>
            <div class="text-lg font-black font-mono ${isProfit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'} mt-1">
              ${isProfit ? 'P +' : 'L -'}${Utils.formatCurrency(Math.abs(calc.profitLoss))}
            </div>
            <div class="text-[10px] text-slate-500 mt-1">Freight &minus; Expenses</div>
          </div>

          <!-- 25. Balance Amount -->
          <div class="${isCleared ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'} border rounded-xl p-3.5">
            <div class="text-[10px] font-black uppercase ${isCleared ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}">25. Remaining Bal</div>
            <div class="text-lg font-black font-mono ${isCleared ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'} mt-1">
              ${Utils.formatCurrency(calc.remainingBalance)}
            </div>
            <div class="text-[10px] text-slate-500 mt-1">Orig: ${Utils.formatCurrency(calc.originalBalance)}</div>
          </div>
        </div>

        <!-- 3. Operational Logistics Details -->
        <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <h4 class="text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Logistical & Broker Information</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span class="text-slate-400 font-semibold">9. Halting Details:</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${trip.haltingDetails || trip.halting || 'None recorded'}</div>
            </div>
            <div>
              <span class="text-slate-400 font-semibold">10. TRSP Name:</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${trip.trspName || 'None'}</div>
            </div>
            <div>
              <span class="text-slate-400 font-semibold">11. TRSP Commission:</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${Utils.formatCurrency(calc.trspCommission)}</div>
            </div>
          </div>
        </div>

        <!-- 4. Itemized Expenses Breakdown (9 Categories) -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Itemized En-Route Expenses Ledger (9 Categories)</h4>
            <span class="text-xs font-black text-indigo-600 dark:text-indigo-400">Total: ${Utils.formatCurrency(calc.totalExpenses)}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">12. Diesel</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.diesel)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">13. Toll Charges</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.toll)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">14. Loading</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.loading)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">15. Unloading</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.unloading)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">16. Police Exp</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.police)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">17. RTA C/P</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.rta)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">18. Other Exp</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.otherExpenses)}</div>
              <div class="text-[9px] text-slate-400 truncate mt-0.5" title="${trip.otherExpenseNotes || ''}">${trip.otherExpenseNotes || 'No notes'}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">19. Driver Comm</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.driverExp)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">11. TRSP Comm</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${Utils.formatCurrency(calc.trspCommission)}</div>
            </div>
          </div>
        </div>

        <!-- 5. Customer Balance Settlement & Payment Installments History -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
            <div>
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Customer Balance Receipts History</h4>
              <p class="text-[11px] text-slate-500">Original Balance: ${Utils.formatCurrency(calc.originalBalance)} &bull; Total Received: ${Utils.formatCurrency(calc.totalReceived)} &bull; Remaining: ${Utils.formatCurrency(calc.remainingBalance)}</p>
            </div>
            <span class="px-2.5 py-1 rounded text-xs font-black ${isCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${isCleared ? 'CLEARED (₹0)' : 'PENDING'}
            </span>
          </div>
          ${receiptsHtml}
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <span class="text-xs text-slate-400">Read-Only Mode &bull; Click "Edit This Trip" to modify expenses or add payments.</span>
          <div class="flex items-center gap-2">
            <button onclick="Trips.closeViewModal()" class="px-4 py-2 border border-slate-300 dark:border-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              Close
            </button>
            <button onclick="Trips.openEditFromView('${trip.tripId || trip.id}')" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition">
              ✏️ Edit This Trip
            </button>
          </div>
        </div>
      </div>
    `;

    const modal = document.getElementById('modal-view-trip');
    if (modal) modal.classList.remove('hidden');
  },

  closeViewModal() {
    const modal = document.getElementById('modal-view-trip');
    if (modal) modal.classList.add('hidden');
  },

  openEditFromView(tripId) {
    this.closeViewModal();
    this.openEditDrawer(tripId);
  },

  openEditDrawer(tripId) {
    TripForm.openEditDrawer(tripId);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Trips;
}



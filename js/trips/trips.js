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
   * Authoritative canonical baseline trips for both fleet vehicles
   */
  CANONICAL_TRIPS: [
    {
      tripId: 'TRIP-20260828-1122-1001',
      sNo: 1,
      tripDate: '2026-08-28',
      vehicleNo: 'TS15UE1122',
      from: 'Hyderabad, Telangana',
      to: 'Purnia, Bihar',
      freightAmount: 200000,
      freight: 200000,
      advanceDate: '2026-08-28',
      advanceAmount: 90000,
      advance: 90000,
      haltingDetails: 'Two days halting during transit',
      trspName: 'MRC',
      trspCommission: 2000,
      diesel: 50000,
      tollCharges: 10000,
      toll: 10000,
      loadingCharges: 2500,
      loading: 2500,
      unloadingCharges: 2500,
      unloading: 2500,
      policeExp: 1000,
      police: 1000,
      rtaExp: 1000,
      rta: 1000,
      otherExpenses: 1000,
      other: 1000,
      otherExpenseNotes: 'Damage-1000',
      driverExp: 12000,
      totalExpenses: 82000,
      profitLoss: 118000,
      originalBalance: 110000,
      totalReceived: 0,
      remainingBalance: 110000,
      balanceStatus: 'Not Received',
      paymentIndicator: 'red',
      tripStatus: 'Pending',
      balanceReceipts: []
    },
    {
      tripId: 'TRIP-20260828-6666-2002',
      sNo: 2,
      tripDate: '2026-08-28',
      vehicleNo: 'TG15T6666',
      from: 'Hyderabad, Telangana',
      to: 'Purnia, Bihar',
      freightAmount: 250000,
      freight: 250000,
      advanceDate: '2026-08-28',
      advanceAmount: 90000,
      advance: 90000,
      haltingDetails: 'Two days halting during transit',
      trspName: 'MRC',
      trspCommission: 2000,
      diesel: 80000,
      tollCharges: 10000,
      toll: 10000,
      loadingCharges: 2500,
      loading: 2500,
      unloadingCharges: 2500,
      unloading: 2500,
      policeExp: 1000,
      police: 1000,
      rtaExp: 1000,
      rta: 1000,
      otherExpenses: 1000,
      other: 1000,
      driverExp: 12000,
      totalExpenses: 112000,
      profitLoss: 138000,
      originalBalance: 160000,
      totalReceived: 160000,
      remainingBalance: 0,
      balanceStatus: 'Done',
      paymentIndicator: 'green',
      tripStatus: 'Paid',
      balanceReceipts: [
        {
          receiptId: 'REC-20260828-6666-01',
          tripId: 'TRIP-20260828-6666-2002',
          vehicleNo: 'TG15T6666',
          amount: 160000,
          receivedAmount: 160000,
          date: '2026-08-28',
          receivedDate: '2026-08-28',
          notes: 'Full balance settlement'
        }
      ]
    }
  ],

  /**
   * Load existing trips from localStorage with fallback to canonical records
   */
  loadFromLocal() {
    try {
      const raw = localStorage.getItem(CONFIG.DATA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          appState.trips = parsed;
        }
      }
    } catch (_) {}

    if (!Array.isArray(appState.trips)) {
      appState.trips = [];
    }

    // Guarantee that TS15UE1122 has at least one canonical trip
    if (!appState.trips.some(t => t.vehicleNo === 'TS15UE1122')) {
      appState.trips.push(JSON.parse(JSON.stringify(this.CANONICAL_TRIPS[0])));
    }

    // Guarantee that TG15T6666 has at least one canonical trip
    if (!appState.trips.some(t => t.vehicleNo === 'TG15T6666')) {
      appState.trips.push(JSON.parse(JSON.stringify(this.CANONICAL_TRIPS[1])));
    }

    this.persistState();
  },

  /**
   * Fetch trips for active vehicle from Google Apps Script
   */
  async loadVehicleTrips(vehicleNo) {
    if (!vehicleNo) return;

    // Ensure local trips are primed first
    this.loadFromLocal();

    try {
      const res = await Api.getTrips(vehicleNo);
      if (res && res.data) {
        let remoteTrips = [];
        if (Array.isArray(res.data)) {
          remoteTrips = res.data;
        } else if (typeof res.data === 'object' && Object.keys(res.data).length > 0) {
          remoteTrips = Object.values(res.data);
        }

        if (remoteTrips.length > 0) {
          const otherVehicleTrips = (appState.trips || []).filter(t => t.vehicleNo !== vehicleNo);
          appState.trips = [...otherVehicleTrips, ...remoteTrips];
          this.persistState();
        } else {
          // If remote cloud has 0 trips, seed the local trips for this vehicle to the cloud
          const localTrips = (appState.trips || []).filter(t => t.vehicleNo === vehicleNo);
          if (localTrips.length > 0) {
            for (const lt of localTrips) {
              try {
                await Api.createTrip(lt, vehicleNo);
              } catch (_) {}
            }
          }
        }

        this.renderTable();
        if (appState.currentPage === 'dashboard' && typeof Dashboard !== 'undefined') {
          Dashboard.render();
        } else if (appState.currentPage === 'excel' && typeof ExcelView !== 'undefined') {
          ExcelView.render();
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

            <!-- Header Action Buttons: Download Excel Voucher, Print / PDF Receipt, Close -->
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="Trips.exportTripExcel('${trip.tripId || trip.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow transition cursor-pointer" title="Download Official Excel Voucher">
                <span>📥 Excel Voucher</span>
              </button>
              <button onclick="Trips.printTripReceipt('${trip.tripId || trip.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow transition cursor-pointer" title="Download / Print PDF Freight Receipt">
                <span>📄 PDF / Print Receipt</span>
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
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${Utils.displayText(trip.haltingDetails || trip.halting)}</div>
            </div>
            <div>
              <span class="text-slate-400 font-semibold">10. TRSP Name:</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${Utils.displayText(trip.trspName)}</div>
            </div>
            <div>
              <span class="text-slate-400 font-semibold">11. TRSP Commission:</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${(trip.trspCommission === '' || trip.trspCommission === null || trip.trspCommission === undefined) ? '—' : Utils.displayCurrency(calc.trspCommission)}</div>
            </div>
          </div>
        </div>

        <!-- 4. Itemized Expenses Breakdown (9 Categories) -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Itemized En-Route Expenses Ledger (9 Categories)</h4>
            <span class="text-xs font-black text-indigo-600 dark:text-indigo-400">Total: ${Utils.displayCurrency(calc.totalExpenses)}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">12. Diesel</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.diesel === '' || trip.diesel === null || trip.diesel === undefined) ? '—' : Utils.displayCurrency(calc.diesel)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">13. Toll Charges</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.tollCharges === '' || trip.tollCharges === null || trip.tollCharges === undefined) ? '—' : Utils.displayCurrency(calc.toll)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">14. Loading</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.loadingCharges === '' || trip.loadingCharges === null || trip.loadingCharges === undefined) ? '—' : Utils.displayCurrency(calc.loading)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">15. Unloading</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.unloadingCharges === '' || trip.unloadingCharges === null || trip.unloadingCharges === undefined) ? '—' : Utils.displayCurrency(calc.unloading)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">16. Police Exp</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.policeExp === '' || trip.policeExp === null || trip.policeExp === undefined) ? '—' : Utils.displayCurrency(calc.police)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">17. RTA C/P</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.rtaExp === '' || trip.rtaExp === null || trip.rtaExp === undefined) ? '—' : Utils.displayCurrency(calc.rta)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">18. Other Exp</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.otherExpenses === '' || trip.otherExpenses === null || trip.otherExpenses === undefined) ? '—' : Utils.displayCurrency(calc.otherExpenses)}</div>
              <div class="text-[9px] text-slate-400 truncate mt-0.5" title="${trip.otherExpenseNotes || ''}">${Utils.displayText(trip.otherExpenseNotes)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">19. Driver Comm</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.driverExp === '' || trip.driverExp === null || trip.driverExp === undefined) ? '—' : Utils.displayCurrency(calc.driverExp)}</div>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase">11. TRSP Comm</span>
              <div class="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">${(trip.trspCommission === '' || trip.trspCommission === null || trip.trspCommission === undefined) ? '—' : Utils.displayCurrency(calc.trspCommission)}</div>
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
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span>🔒 Read-Only Inspection View</span>
            <span>&bull;</span>
            <span>To edit data, use "Edit" on the main table</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="Trips.exportTripExcel('${trip.tripId || trip.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <span>📥</span>
              <span>Excel Voucher</span>
            </button>
            <button onclick="Trips.printTripReceipt('${trip.tripId || trip.id}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5">
              <span>📄</span>
              <span>Official PDF / Print</span>
            </button>
            <button onclick="Trips.closeViewModal()" class="px-4 py-2 border border-slate-300 dark:border-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    const modal = document.getElementById('modal-view-trip');
    if (modal) {
      modalContent.setAttribute('data-trip-id', trip.tripId || trip.id);
      modal.classList.remove('hidden');
    }
  },

  closeViewModal() {
    const modal = document.getElementById('modal-view-trip');
    if (modal) modal.classList.add('hidden');
  },

  openEditDrawer(tripId) {
    TripForm.openEditDrawer(tripId);
  },

  closeEditDrawer() {
    if (typeof TripForm !== 'undefined' && TripForm.closeEditDrawer) {
      TripForm.closeEditDrawer();
    }
  },

  /**
   * Re-renders the View modal if it is currently open for this trip
   */
  refreshOpenViewModal(tripId) {
    const modal = document.getElementById('modal-view-trip');
    if (modal && !modal.classList.contains('hidden')) {
      const currentTripId = document.getElementById('view-trip-modal-content')?.getAttribute('data-trip-id');
      if (String(currentTripId) === String(tripId)) {
        this.openViewModal(tripId);
      }
    }
  },

  /**
   * Export an individual trip as an executive styled Excel (.xlsx) voucher
   */
  async exportTripExcel(tripId) {
    const trip = (appState.trips || []).find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId) || String(t.sNo) === String(tripId));
    if (!trip) {
      alert("Trip record not found.");
      return;
    }

    if (typeof ExcelJS === 'undefined') {
      alert("Excel export engine is initializing. Please try again in a moment.");
      return;
    }

    const calc = FinancialEngine.calculateTrip(trip, trip.balanceReceipts || []);
    const isProfit = calc.profitLoss >= 0;
    const isCleared = calc.remainingBalance === 0;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SR Transport Enterprise";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`Trip_${trip.sNo || 1}`, {
      views: [{ showGridLines: true }]
    });

    sheet.columns = [
      { width: 5 },
      { width: 30 },
      { width: 35 },
      { width: 25 },
      { width: 5 }
    ];

    sheet.mergeCells('B2:D2');
    const titleCell = sheet.getCell('B2');
    titleCell.value = "SR TRANSPORT - OFFICIAL FREIGHT & SETTLEMENT VOUCHER";
    titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

    sheet.mergeCells('B3:D3');
    const subCell = sheet.getCell('B3');
    subCell.value = `Vehicle: ${trip.vehicleNo} • Trip #${trip.sNo || trip.id || 1} • Dispatched: ${Utils.formatDisplayDate(trip.tripDate)}`;
    subCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF94A3B8' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };

    let r = 5;
    const addSectionHeader = (text) => {
      sheet.mergeCells(`B${r}:D${r}`);
      const c = sheet.getCell(`B${r}`);
      c.value = text;
      c.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
      c.alignment = { vertical: 'middle' };
      r++;
    };

    const addRow = (label, val, note = '') => {
      sheet.getCell(`B${r}`).value = label;
      sheet.getCell(`B${r}`).font = { name: 'Segoe UI', size: 10, bold: true };
      sheet.getCell(`C${r}`).value = val;
      sheet.getCell(`C${r}`).font = { name: 'Segoe UI', size: 10 };
      sheet.getCell(`D${r}`).value = note;
      sheet.getCell(`D${r}`).font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF64748B' } };
      r++;
    };

    addSectionHeader("1. SHIPMENT & ROUTE INFORMATION");
    addRow("Vehicle Registration", trip.vehicleNo);
    addRow("Dispatched Date", Utils.formatDisplayDate(trip.tripDate));
    addRow("Route Origin (From)", trip.from || '—');
    addRow("Route Destination (To)", trip.to || '—');
    addRow("Halting Details", trip.haltingDetails || '—');
    addRow("Transporter / Broker", trip.trspName || '—');
    addRow("Trip Status", calc.tripStatus);
    r++;

    addSectionHeader("2. FREIGHT BILLING & ADVANCES");
    addRow("Gross Freight Amount", `₹${calc.freight.toLocaleString('en-IN')}`, "Total contract value");
    addRow("Advance Amount Received", `₹${calc.advance.toLocaleString('en-IN')}`, `Received on ${Utils.formatDisplayDate(trip.advanceDate)}`);
    addRow("Original Customer Balance", `₹${calc.originalBalance.toLocaleString('en-IN')}`, "Freight − Advance");
    r++;

    addSectionHeader("3. ITEMIZED OPERATIONAL EXPENSES (9 CATEGORIES)");
    addRow("1. Diesel Expense", `₹${calc.diesel.toLocaleString('en-IN')}`);
    addRow("2. Toll Plaza Charges", `₹${calc.toll.toLocaleString('en-IN')}`);
    addRow("3. RTA / Checkpost", `₹${calc.rta.toLocaleString('en-IN')}`);
    addRow("4. Police / Border", `₹${calc.police.toLocaleString('en-IN')}`);
    addRow("5. Loading Charges", `₹${calc.loading.toLocaleString('en-IN')}`);
    addRow("6. Unloading Charges", `₹${calc.unloading.toLocaleString('en-IN')}`);
    addRow("7. Driver Trip Expense", `₹${calc.driverExp.toLocaleString('en-IN')}`);
    addRow("8. Transport Commission", `₹${calc.trspCommission.toLocaleString('en-IN')}`);
    addRow("9. Other Operational Expenses", `₹${calc.otherExpenses.toLocaleString('en-IN')}`, trip.otherExpenseNotes || '');
    addRow("Total Operational Expenses", `₹${calc.totalExpenses.toLocaleString('en-IN')}`, "Sum of 9 expenses");
    addRow("Net Trip Profit / Loss", `${isProfit ? '+' : ''}₹${calc.profitLoss.toLocaleString('en-IN')}`, isProfit ? "PROFIT" : "LOSS");
    r++;

    addSectionHeader("4. CUSTOMER BALANCE SETTLEMENT LEDGER");
    addRow("Original Customer Balance", `₹${calc.originalBalance.toLocaleString('en-IN')}`);
    const receipts = Array.isArray(trip.balanceReceipts) ? trip.balanceReceipts : [];
    if (receipts.length === 0) {
      addRow("Installment Payments", "No payments recorded yet", "₹0 received");
    } else {
      receipts.forEach((rcpt, idx) => {
        addRow(`Installment #${idx + 1}`, `+₹${(Number(rcpt.amount) || 0).toLocaleString('en-IN')}`, `Date: ${Utils.formatDisplayDate(rcpt.receivedDate || rcpt.date)} • ${rcpt.notes || 'UPI/Cash'}`);
      });
    }
    addRow("Total Received from Customer", `₹${calc.totalReceived.toLocaleString('en-IN')}`, "Sum of installments");
    addRow("Remaining Customer Balance", `₹${calc.remainingBalance.toLocaleString('en-IN')}`, isCleared ? "🟢 CLEARED" : "🔴 PENDING");

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SR_Transport_Voucher_${trip.vehicleNo}_Trip_${trip.sNo || trip.id || 1}.xlsx`;
    link.click();
    Utils.showToast(`📥 Excel Voucher downloaded for Trip #${trip.sNo || 1}!`);
  },

  /**
   * Generates a printable official SR Transport Freight Bill & Balance Receipt
   */
  printTripReceipt(tripId) {
    const trip = (appState.trips || []).find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId) || String(t.sNo) === String(tripId));
    if (!trip) {
      alert("Trip record not found.");
      return;
    }

    const calc = FinancialEngine.calculateTrip(trip, trip.balanceReceipts || []);
    const isProfit = calc.profitLoss >= 0;
    const isCleared = calc.remainingBalance === 0;
    const receipts = Array.isArray(trip.balanceReceipts) ? trip.balanceReceipts : [];

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to print/download official PDF receipt.");
      return;
    }

    let runningBal = calc.originalBalance;
    const receiptRows = receipts.length === 0 
      ? `<tr><td colspan="5" style="text-align:center; padding:10px; color:#64748b;">No balance payment installments received yet.</td></tr>`
      : receipts.map((r, i) => {
          const amt = Number(r.amount !== undefined ? r.amount : (r.receivedAmount || 0));
          runningBal = Math.max(0, runningBal - amt);
          return `
            <tr>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:center;">#${i + 1}</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1;">${Utils.formatDisplayDate(r.receivedDate || r.date)}</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:right; font-weight:bold; color:#059669;">+₹${amt.toLocaleString('en-IN')}</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:right; font-weight:bold; color:${runningBal === 0 ? '#059669' : '#dc2626'};">₹${runningBal.toLocaleString('en-IN')}</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1;">${r.notes || '-'}</td>
            </tr>
          `;
        }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SR Transport Official Freight Bill - Trip #${trip.sNo || trip.id || 1}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .logo { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
          .sub { font-size: 11px; color: #475569; margin-top: 2px; }
          .badge { display: inline-block; padding: 4px 12px; background: #0f172a; color: #fff; font-weight: bold; border-radius: 4px; font-size: 11px; margin-top: 6px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; }
          .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; }
          .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
          .row strong { font-family: monospace; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th { background: #0f172a; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
          .sign-box { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; }
          .sign-line { width: 200px; text-align: center; border-top: 1px dashed #64748b; padding-top: 4px; font-size: 10px; font-weight: bold; color: #475569; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 8px 18px; background: #2563eb; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">🖨️ Print / Save as PDF</button>
          <button onclick="window.close()" style="padding: 8px 14px; background: #64748b; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; margin-left: 8px;">✕ Close</button>
        </div>

        <div class="header">
          <div class="logo">SR TRANSPORT</div>
          <div class="sub">Heavy Freight Fleet Operations & Logistics Management System</div>
          <div class="sub">Fleet HQ: Hyderabad • Operational Vehicles: TS15UE1122 & TG15T6666</div>
          <div class="badge">OFFICIAL FREIGHT CONSIGNMENT VOUCHER & SETTLEMENT RECEIPT</div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="box-title">Shipment Information</div>
            <div class="row"><span>Voucher / S.No:</span><strong>#${trip.sNo || trip.id || 1}</strong></div>
            <div class="row"><span>Vehicle Number:</span><strong style="color:#1d4ed8;">${trip.vehicleNo}</strong></div>
            <div class="row"><span>Dispatch Date:</span><strong>${Utils.formatDisplayDate(trip.tripDate)}</strong></div>
            <div class="row"><span>Route (From ➔ To):</span><strong>${trip.from || '—'} ➔ ${trip.to || '—'}</strong></div>
            <div class="row"><span>Transporter / Broker:</span><strong>${trip.trspName || '—'}</strong></div>
            <div class="row"><span>Halting Transit:</span><strong>${trip.haltingDetails || '—'}</strong></div>
          </div>

          <div class="box">
            <div class="box-title">Customer Financial Settlement</div>
            <div class="row"><span>Total Gross Freight:</span><strong>₹${calc.freight.toLocaleString('en-IN')}</strong></div>
            <div class="row"><span>Advance Received:</span><strong>₹${calc.advance.toLocaleString('en-IN')}</strong></div>
            <div class="row"><span>Advance Recd Date:</span><strong>${Utils.formatDisplayDate(trip.advanceDate)}</strong></div>
            <div class="row" style="border-top:1px solid #e2e8f0; padding-top:4px;"><span>Original Balance:</span><strong>₹${calc.originalBalance.toLocaleString('en-IN')}</strong></div>
            <div class="row"><span>Total Installments Recd:</span><strong style="color:#059669;">+₹${calc.totalReceived.toLocaleString('en-IN')}</strong></div>
            <div class="row" style="background:#fee2e2; padding:4px 6px; border-radius:4px; margin-top:4px;">
              <span style="font-weight:bold; color:#b91c1c;">Outstanding Balance:</span>
              <strong style="color:#b91c1c; font-size:13px;">₹${calc.remainingBalance.toLocaleString('en-IN')} (${isCleared ? 'CLEARED' : 'PENDING'})</strong>
            </div>
          </div>
        </div>

        <div class="box" style="margin-bottom:16px;">
          <div class="box-title">Itemized Operational Expenses (Trip Profit Calculation)</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; font-size:11px;">
            <div>Diesel: <strong>₹${calc.diesel.toLocaleString('en-IN')}</strong></div>
            <div>Toll Charges: <strong>₹${calc.toll.toLocaleString('en-IN')}</strong></div>
            <div>RTA Charges: <strong>₹${calc.rta.toLocaleString('en-IN')}</strong></div>
            <div>Police / Border: <strong>₹${calc.police.toLocaleString('en-IN')}</strong></div>
            <div>Loading: <strong>₹${calc.loading.toLocaleString('en-IN')}</strong></div>
            <div>Unloading: <strong>₹${calc.unloading.toLocaleString('en-IN')}</strong></div>
            <div>Driver Expense: <strong>₹${calc.driverExp.toLocaleString('en-IN')}</strong></div>
            <div>TRSP Comm: <strong>₹${calc.trspCommission.toLocaleString('en-IN')}</strong></div>
            <div>Other Exp: <strong>₹${calc.otherExpenses.toLocaleString('en-IN')}</strong></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:6px; border-top:1px solid #e2e8f0; font-size:11px;">
            <span>Total Operational Expenses: <strong style="color:#d97706;">₹${calc.totalExpenses.toLocaleString('en-IN')}</strong></span>
            <span>Net Trip Margin (Freight − Exp): <strong style="color:${isProfit ? '#059669' : '#dc2626'}; font-size:13px;">${isProfit ? 'PROFIT +' : 'LOSS -'}₹${Math.abs(calc.profitLoss).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        <div class="box" style="margin-bottom:16px;">
          <div class="box-title">Customer Balance Payment Installment History</div>
          <table>
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">#</th>
                <th style="width:120px;">Date</th>
                <th style="width:120px; text-align:right;">Amount Received</th>
                <th style="width:120px; text-align:right;">Remaining Balance</th>
                <th>Payment Mode / Notes</th>
              </tr>
            </thead>
            <tbody>
              ${receiptRows}
            </tbody>
          </table>
        </div>

        <div class="sign-box">
          <div class="sign-line">Driver / Broker Signature</div>
          <div class="sign-line">Customer / Consignee Stamp</div>
          <div class="sign-line">For SR TRANSPORT (Authorized Signatory)</div>
        </div>

        <div style="margin-top:24px; text-align:center; font-size:10px; color:#94a3b8;">
          System-generated official transport voucher &bull; © 2026 SR Transport &bull; Enterprise Fleet Management System
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Trips;
}



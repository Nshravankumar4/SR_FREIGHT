/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - TRIP FORM & DRAWER HANDLERS
 * Version: 2.4.2
 */

const TripForm = {
  /**
   * Open the Add Trip Modal pre-filled and locked to currentVehicle
   */
  openAddModal() {
    const vNo = appState.currentVehicle;
    if (!vNo) {
      Router.navigate('vehicles');
      return;
    }

    const modal = document.getElementById('modal-add-trip');
    if (!modal) return;

    // Reset inputs
    document.getElementById('form-add-trip').reset();

    // Lock vehicle
    const vInput = document.getElementById('add-vehicle');
    if (vInput) {
      vInput.value = vNo;
      vInput.disabled = true;
    }

    // Default dates to today
    const today = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('add-trip-date');
    if (dateInput) dateInput.value = today;

    this.recalcAddForm();
    modal.classList.remove('hidden');
  },

  closeAddModal() {
    const modal = document.getElementById('modal-add-trip');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Recalculate preview in Add Trip modal
   */
  recalcAddForm() {
    const getNum = (id) => Number(document.getElementById(id)?.value) || 0;

    const freight = getNum('add-freight');
    const advance = getNum('add-advance');

    const diesel = getNum('add-diesel');
    const toll = getNum('add-toll');
    const rta = getNum('add-rta');
    const police = getNum('add-police');
    const loading = getNum('add-loading');
    const unloading = getNum('add-unloading');
    const driver = getNum('add-driver-comm');
    const trsp = getNum('add-trsp-commission');
    const other = getNum('add-other');

    const totalExp = diesel + toll + rta + police + loading + unloading + driver + trsp + other;
    const profit = freight - totalExp;
    const balance = Math.max(0, freight - advance);

    const totalExpEl = document.getElementById('add-preview-total-exp');
    const profitEl = document.getElementById('add-preview-profit');
    const balanceEl = document.getElementById('add-preview-balance');

    if (totalExpEl) totalExpEl.textContent = Utils.formatCurrency(totalExp);
    if (profitEl) {
      profitEl.textContent = `${profit >= 0 ? '+' : ''}${Utils.formatCurrency(profit)}`;
      profitEl.className = `font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }
    if (balanceEl) balanceEl.textContent = Utils.formatCurrency(balance);
  },

  /**
   * Open the Slide-Over Edit Drawer for a trip
   */
  openEditDrawer(tripId) {
    const trip = (appState.trips || []).find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId));
    if (!trip) return;

    appState.editingTripId = trip.tripId || trip.id;
    appState.selectedTrip = trip;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null && val !== '') ? val : '';
    };

    setVal('edit-trip-id', trip.tripId || '');
    setVal('edit-trip-date', Utils.toInputDateFormat(trip.tripDate));
    setVal('edit-vehicle', trip.vehicleNo || appState.currentVehicle);
    setVal('edit-from', trip.from || '');
    setVal('edit-to', trip.to || '');
    setVal('edit-freight', trip.freightAmount !== undefined ? trip.freightAmount : trip.freight);
    setVal('edit-advance-date', Utils.toInputDateFormat(trip.advanceDate));
    setVal('edit-advance', trip.advanceAmount !== undefined ? trip.advanceAmount : trip.advance);
    setVal('edit-halting', trip.haltingDetails || trip.halting || '');
    setVal('edit-trsp-name', trip.trspName || '');

    // 9 Expenses: Leave blank if not entered, do not default to 0
    setVal('edit-diesel', trip.diesel);
    setVal('edit-toll', trip.tollCharges !== undefined ? trip.tollCharges : trip.toll);
    setVal('edit-rta', trip.rtaExp !== undefined ? trip.rtaExp : trip.rta);
    setVal('edit-police', trip.policeExp !== undefined ? trip.policeExp : trip.police);
    setVal('edit-loading', trip.loadingCharges !== undefined ? trip.loadingCharges : trip.loading);
    setVal('edit-unloading', trip.unloadingCharges !== undefined ? trip.unloadingCharges : trip.unloading);
    setVal('edit-driver-comm', trip.driverExp !== undefined ? trip.driverExp : (trip.driverTripCommission !== undefined ? trip.driverTripCommission : trip.driverCommission));
    setVal('edit-trsp-commission', trip.trspCommission);
    setVal('edit-other', trip.otherExpenses !== undefined ? trip.otherExpenses : trip.other);
    setVal('edit-other-notes', trip.otherExpenseNotes || '');

    setVal('edit-status', trip.tripStatus || trip.status || 'In Progress');

    // Recalculate trip derived metrics so all properties are up to date
    const calculated = FinancialEngine.calculateTrip(trip, trip.balanceReceipts || []);
    Object.assign(trip, calculated);

    // Render receipt history table
    ReceiptTable.render(trip);
    Receipts.updateDrawerSummary(calculated);

    // Show drawer
    const drawer = document.getElementById('drawer-panel');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('translate-x-full');
      backdrop.classList.remove('hidden');
    }
  },

  closeEditDrawer() {
    const drawer = document.getElementById('drawer-panel');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('translate-x-full');
      backdrop.classList.add('hidden');
    }
    appState.editingTripId = null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TripForm;
}


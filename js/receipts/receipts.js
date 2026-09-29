/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - BALANCE RECEIPTS CONTROLLER
 * Version: 2.4.2
 */

const Receipts = {
  /**
   * Add a new installment payment receipt to a trip
   */
  async addReceipt(tripId, receiptData) {
    const trip = (appState.trips || []).find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId));
    if (!trip) throw new Error("Trip not found.");

    // Enforce vehicle scope
    if (appState.currentVehicle && trip.vehicleNo !== appState.currentVehicle) {
      throw new Error(`Vehicle mismatch: Trip belongs to ${trip.vehicleNo}, but active workspace is ${appState.currentVehicle}.`);
    }

    // 1. Current financial calculation
    const calcBefore = FinancialEngine.calculateTrip(trip, trip.balanceReceipts || []);

    // 2. Validate receipt input against remaining balance
    const validation = ReceiptForm.validate(receiptData, calcBefore.remainingBalance);
    if (!validation.isValid) {
      throw new Error(validation.errors.join("\n"));
    }

    // 3. Prepare new receipt record
    const newReceipt = {
      receiptId: Utils.generateReceiptId(),
      tripId: trip.tripId || trip.id,
      vehicleNo: trip.vehicleNo,
      receivedDate: Utils.toInputDateFormat(receiptData.receivedDate || receiptData.date),
      receivedAmount: Number(receiptData.receivedAmount || receiptData.amount),
      amount: Number(receiptData.receivedAmount || receiptData.amount),
      notes: (receiptData.notes || '').trim(),
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(trip.balanceReceipts)) {
      trip.balanceReceipts = [];
    }
    trip.balanceReceipts.push(newReceipt);

    // 4. Recalculate trip derived metrics
    const recalculated = FinancialEngine.calculateTrip(trip, trip.balanceReceipts);
    Object.assign(trip, recalculated);

    // 5. Save state to cache
    Trips.persistState();

    Utils.showToast(`✅ Payment of ₹${newReceipt.amount.toLocaleString('en-IN')} added. Remaining: ₹${recalculated.remainingBalance.toLocaleString('en-IN')}`);

    // 6. Immediately refresh all dependent UI layers
    this.refreshAllUI(trip, recalculated);

    // 7. Broadcast update to other open tabs
    if (typeof App !== 'undefined' && typeof App.broadcastStateChange === 'function') {
      App.broadcastStateChange('receipt_added', { tripId: trip.tripId, vehicleNo: trip.vehicleNo });
    }

    // 8. Cloud confirmation & synchronization
    try {
      appState.isSaving = true;
      appState.pendingMutationCount = (appState.pendingMutationCount || 0) + 1;

      const res = await Api.addReceipt(newReceipt, trip.tripId, trip.vehicleNo);
      appState.lastSuccessfulMutation = Date.now();

      // Once confirmed, fetch latest receipts for authoritative parity
      if (res && res.success) {
        try {
          const cloudRcpts = await Api.getReceipts(trip.tripId, trip.vehicleNo);
          if (cloudRcpts && cloudRcpts.success && Array.isArray(cloudRcpts.data)) {
            trip.balanceReceipts = cloudRcpts.data;
            const confirmedCalc = FinancialEngine.calculateTrip(trip, trip.balanceReceipts);
            Object.assign(trip, confirmedCalc);
            Trips.persistState();
            this.refreshAllUI(trip, confirmedCalc);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Background addReceipt sync note:", err);
    } finally {
      appState.pendingMutationCount = Math.max(0, (appState.pendingMutationCount || 1) - 1);
      appState.isSaving = appState.pendingMutationCount > 0;
    }
  },

  /**
   * Delete an existing receipt installment and recalculate (Admin Only)
   */
  async deleteReceipt(tripId, receiptId) {
    if (typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' && !Auth.canDelete()) {
      alert("Delete operation not permitted.\n\nRudra can add and edit records but cannot delete them.");
      return;
    } else if (typeof Auth !== 'undefined' && typeof Auth.isAdmin === 'function' && !Auth.isAdmin()) {
      alert("Delete operation not permitted.\n\nRudra can add and edit records but cannot delete them.");
      return;
    }

    if (!confirm("Are you sure you want to delete this payment receipt? The remaining balance will automatically recalculate.")) {
      return;
    }

    const trip = (appState.trips || []).find(t => String(t.tripId || t.id) === String(tripId) || Number(t.id) === Number(tripId));
    if (!trip) return;

    if (!Array.isArray(trip.balanceReceipts)) return;

    // Filter out target receipt
    const originalLen = trip.balanceReceipts.length;
    trip.balanceReceipts = trip.balanceReceipts.filter((r, idx) => {
      return String(r.receiptId) !== String(receiptId) && String(idx) !== String(receiptId);
    });

    if (trip.balanceReceipts.length === originalLen) return;

    // Recalculate
    const recalculated = FinancialEngine.calculateTrip(trip, trip.balanceReceipts);
    Object.assign(trip, recalculated);

    Trips.persistState();

    Utils.showToast(`🗑️ Payment receipt removed. Remaining balance restored to ₹${recalculated.remainingBalance.toLocaleString('en-IN')}`, 'warning');

    // Immediately refresh all dependent UI layers
    this.refreshAllUI(trip, recalculated);

    // Broadcast update
    if (typeof App !== 'undefined' && typeof App.broadcastStateChange === 'function') {
      App.broadcastStateChange('receipt_deleted', { tripId: trip.tripId, vehicleNo: trip.vehicleNo });
    }

    // Cloud sync with mutation lock
    try {
      appState.isSaving = true;
      appState.pendingMutationCount = (appState.pendingMutationCount || 0) + 1;
      await Api.deleteReceipt(receiptId, trip.tripId, trip.vehicleNo);
      appState.lastSuccessfulMutation = Date.now();
    } catch (err) {
      console.warn("Background deleteReceipt sync note:", err);
    } finally {
      appState.pendingMutationCount = Math.max(0, (appState.pendingMutationCount || 1) - 1);
      appState.isSaving = appState.pendingMutationCount > 0;
    }
  },

  /**
   * Helper to synchronously refresh all UI views after a receipt change
   */
  refreshAllUI(trip, recalculated) {
    if (typeof ReceiptTable !== 'undefined') {
      ReceiptTable.render(trip);
    }
    this.updateDrawerSummary(recalculated);

    if (typeof Trips !== 'undefined' && typeof Trips.renderTable === 'function') {
      Trips.renderTable();
    }

    if (appState.currentPage === 'dashboard' && typeof Dashboard !== 'undefined' && typeof Dashboard.render === 'function') {
      Dashboard.render();
    }

    // If View Modal is open for this trip, refresh it live
    if (typeof Trips !== 'undefined' && typeof Trips.refreshOpenViewModal === 'function') {
      Trips.refreshOpenViewModal(trip.tripId || trip.id);
    }

    // If Outstanding Balances Modal is open, refresh it live
    if (typeof Dashboard !== 'undefined' && typeof Dashboard.renderOutstandingModal === 'function') {
      const modal = document.getElementById('modal-outstanding-balances');
      if (modal && !modal.classList.contains('hidden')) {
        Dashboard.renderOutstandingModal();
      }
    }
  },

  /**
   * Update the balance settlement card in the edit drawer
   */
  updateDrawerSummary(trip) {
    const origEl = document.getElementById('drawer-orig-balance');
    const recvEl = document.getElementById('drawer-total-received');
    const remEl = document.getElementById('drawer-remaining-balance');
    const badgeEl = document.getElementById('drawer-payment-badge');

    if (origEl) origEl.textContent = Utils.formatCurrency(trip.originalBalance || 0);
    if (recvEl) recvEl.textContent = Utils.formatCurrency(trip.totalReceived || 0);
    if (remEl) remEl.textContent = Utils.formatCurrency(trip.remainingBalance || 0);

    if (badgeEl) {
      if (trip.remainingBalance === 0) {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300';
        badgeEl.textContent = '🟢 PAYMENT CLEARED';
      } else if (trip.totalReceived > 0) {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300';
        badgeEl.textContent = '🟡 PARTIALLY RECEIVED';
      } else {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300';
        badgeEl.textContent = '🔴 PAYMENT PENDING';
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Receipts;
}


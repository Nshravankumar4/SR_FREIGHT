/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - FINANCIAL CALCULATION ENGINE
 * Version: 2.4.2 (Production Core)
 *
 * Single Source of Truth for all financial math:
 * 1. Total Expenses = Sum of 9 Operational Expenses
 * 2. Profit / Loss = Freight - Total Expenses (Internal Business Margin)
 * 3. Customer Original Balance = Freight - Advance (External Receivable)
 * 4. Remaining Customer Balance = Original Balance - Total Balance Receipts
 * 5. Overpayment Rejected (Receipts cannot exceed Original Balance)
 * 6. Semantic Payment Status & Red/Green Indicator
 *
 * NEVER: Remaining Balance = Freight - Expenses
 * NEVER: Remaining Balance = Profit/Loss
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FinancialEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Calculates derived financial metrics for a single trip record.
   *
   * @param {Object} trip - The trip data object
   * @param {Array} receipts - Array of balance receipt objects { receiptId, amount, receivedDate, ... }
   * @returns {Object} Complete trip record with authoritative calculated values
   * @throws {Error} If validation constraints fail
   */
  function calculateTrip(trip, receipts = []) {
    if (!trip) throw new Error("Trip data is required.");

    const freight = Number(trip.freightAmount !== undefined ? trip.freightAmount : trip.freight) || 0;
    const advance = Number(trip.advanceAmount !== undefined ? trip.advanceAmount : trip.advance) || 0;

    // Constraint 1: Non-negative freight & advance
    if (freight < 0) throw new Error("Freight Amount cannot be negative.");
    if (advance < 0) throw new Error("Advance Amount cannot be negative.");

    // Constraint 2: Advance cannot exceed freight
    if (advance > freight) {
      throw new Error(`Advance Amount (₹${advance.toLocaleString('en-IN')}) cannot exceed Freight Amount (₹${freight.toLocaleString('en-IN')}).`);
    }

    // The 9 Operational Expenses
    const diesel = Number(trip.diesel) || 0;
    const tollCharges = Number(trip.tollCharges !== undefined ? trip.tollCharges : trip.toll) || 0;
    const rtaExp = Number(trip.rtaExp !== undefined ? trip.rtaExp : trip.rta) || 0;
    const policeExp = Number(trip.policeExp !== undefined ? trip.policeExp : trip.police) || 0;
    const loadingCharges = Number(trip.loadingCharges !== undefined ? trip.loadingCharges : trip.loading) || 0;
    const unloadingCharges = Number(trip.unloadingCharges !== undefined ? trip.unloadingCharges : trip.unloading) || 0;
    const driverExp = Number(trip.driverExp !== undefined ? trip.driverExp : (trip.driverTripCommission !== undefined ? trip.driverTripCommission : trip.driverCommission)) || 0;
    const trspCommission = Number(trip.trspCommission) || 0;
    const otherExpenses = Number(trip.otherExpenses !== undefined ? trip.otherExpenses : trip.other) || 0;

    const expenses = [
      diesel,
      tollCharges,
      rtaExp,
      policeExp,
      loadingCharges,
      unloadingCharges,
      driverExp,
      trspCommission,
      otherExpenses
    ];

    // Constraint 3: Operational expenses cannot be negative
    if (expenses.some(value => value < 0)) {
      throw new Error("Expenses cannot be negative.");
    }

    // 1. TOTAL EXPENSES (Sum of 9 Expenses)
    const totalExpenses = expenses.reduce((sum, value) => sum + value, 0);

    // 2. PROFIT / LOSS (Internal Business Metric)
    const profitLoss = freight - totalExpenses;

    // 3. CUSTOMER ORIGINAL BALANCE (External Receivable)
    const originalBalance = freight - advance;

    // 4. RECEIVED PAYMENTS (Sum of Balance Receipts Installments)
    const validReceipts = Array.isArray(receipts) ? receipts : (Array.isArray(trip.balanceReceipts) ? trip.balanceReceipts : []);
    const totalReceived = validReceipts.reduce(
      (sum, receipt) => {
        const amt = Number(receipt.receivedAmount !== undefined ? receipt.receivedAmount : receipt.amount) || 0;
        if (amt < 0) throw new Error("Receipt amount cannot be negative.");
        return sum + amt;
      },
      0
    );

    // 5. OVERPAYMENT PROTECTION (Do NOT use Math.max to hide negative balance)
    if (totalReceived > originalBalance) {
      throw new Error(
        `Overpayment rejected. Balance is ₹${originalBalance.toLocaleString('en-IN')}, but received ₹${totalReceived.toLocaleString('en-IN')}.`
      );
    }

    // 6. REMAINING CUSTOMER BALANCE
    const remainingBalance = originalBalance - totalReceived;

    // 7. PAYMENT STATUS STATE MACHINE
    let balanceStatus;
    if (remainingBalance === 0) {
      balanceStatus = "Done";
    } else if (totalReceived > 0) {
      balanceStatus = "Partially Received";
    } else {
      balanceStatus = "Not Received";
    }

    // 8. RED / GREEN SEMANTIC PAYMENT INDICATOR
    const paymentIndicator = remainingBalance === 0 ? "green" : "red";

    // 9. Independent Trip Status
    const tripStatus = trip.tripStatus || trip.status || "In Progress";

    return {
      ...trip,

      freight,
      freightAmount: freight,
      advance,
      advanceAmount: advance,

      diesel,
      toll: tollCharges,
      tollCharges,
      rta: rtaExp,
      rtaExp,
      police: policeExp,
      policeExp,
      loading: loadingCharges,
      loadingCharges,
      unloading: unloadingCharges,
      unloadingCharges,
      driverExp,
      driverTripCommission: driverExp,
      driverCommission: driverExp,
      trspCommission,
      other: otherExpenses,
      otherExpenses,

      totalExpenses,
      totalExpAmount: totalExpenses,
      profitLoss,

      originalBalance,
      totalReceived,
      totalBalanceReceived: totalReceived,
      remainingBalance,
      balance: remainingBalance,

      balanceStatus,
      paymentIndicator,

      tripStatus,
      status: tripStatus,
      balanceReceipts: validReceipts,
      otherExpenseNotes: trip.otherExpenseNotes || ""
    };
  }

  return {
    calculateTrip
  };
});

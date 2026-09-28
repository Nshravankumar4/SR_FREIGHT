/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - BALANCE RECEIPT FORM & VALIDATION
 * Version: 2.4.2
 */

const ReceiptForm = {
  validate(data, remainingBalance) {
    const errors = [];
    const amt = Number(data.receivedAmount || data.amount) || 0;
    const date = data.receivedDate || data.date;

    if (!date) errors.push("Received Date is required.");
    if (amt <= 0) errors.push("Received Amount must be greater than ₹0.");

    if (remainingBalance <= 0) {
      errors.push("This trip's balance has already been fully cleared (Remaining: ₹0).");
    } else if (amt > remainingBalance) {
      errors.push(
        `Received amount (₹${amt.toLocaleString('en-IN')}) cannot exceed remaining balance (₹${remainingBalance.toLocaleString('en-IN')}). Overpayment rejected.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReceiptForm;
}


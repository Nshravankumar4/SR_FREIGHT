const assert = require('assert');
const { calculateTrip } = require('../js/calculations/financial.js');

console.log("=== RUNNING FINANCIAL ENGINE UNIT TESTS (v2.4.2) ===");

// TEST 1: Master Example with 9 Expenses & Profit
const masterTrip = {
  tripId: 'TRIP-20260828-0001',
  vehicleNo: 'TS15UE1122',
  freightAmount: 130000,
  advanceAmount: 120000,
  diesel: 70000,
  tollCharges: 20000,
  rtaExp: 8000,
  policeExp: 2000,
  loadingCharges: 2400,
  unloadingCharges: 1200,
  driverExp: 13600,
  trspCommission: 0,
  otherExpenses: 2000,
  otherExpenseNotes: 'Damage-1000,greac-800'
};

const res1 = calculateTrip(masterTrip, []);
console.log("TEST 1 - Total Expenses:", res1.totalExpenses, "Expected: 119200");
assert.strictEqual(res1.totalExpenses, 119200);
console.log("TEST 1 - Profit / Loss:", res1.profitLoss, "Expected: 10800");
assert.strictEqual(res1.profitLoss, 10800);
console.log("TEST 1 - Original Balance:", res1.originalBalance, "Expected: 10000");
assert.strictEqual(res1.originalBalance, 10000);
console.log("TEST 1 - Remaining Balance:", res1.remainingBalance, "Expected: 10000");
assert.strictEqual(res1.remainingBalance, 10000);
console.log("TEST 1 - Balance Status:", res1.balanceStatus, "Expected: Not Received");
assert.strictEqual(res1.balanceStatus, 'Not Received');
console.log("TEST 1 - Payment Indicator:", res1.paymentIndicator, "Expected: red");
assert.strictEqual(res1.paymentIndicator, 'red');

// TEST 2: First Partial Payment Installment (₹9,000)
const receipts2 = [
  { receiptId: 'REC-001', amount: 9000, receivedDate: '29-08-2026' }
];
const res2 = calculateTrip(masterTrip, receipts2);
console.log("TEST 2 - Remaining Balance after ₹9k:", res2.remainingBalance, "Expected: 1000");
assert.strictEqual(res2.remainingBalance, 1000);
console.log("TEST 2 - Balance Status:", res2.balanceStatus, "Expected: Partially Received");
assert.strictEqual(res2.balanceStatus, 'Partially Received');
console.log("TEST 2 - Payment Indicator:", res2.paymentIndicator, "Expected: red");
assert.strictEqual(res2.paymentIndicator, 'red');

// TEST 3: Final Payment Installment (₹1,000) -> Balance reaches ₹0
const receipts3 = [
  { receiptId: 'REC-001', amount: 9000, receivedDate: '29-08-2026' },
  { receiptId: 'REC-002', amount: 1000, receivedDate: '30-08-2026' }
];
const res3 = calculateTrip(masterTrip, receipts3);
console.log("TEST 3 - Remaining Balance after ₹1k:", res3.remainingBalance, "Expected: 0");
assert.strictEqual(res3.remainingBalance, 0);
console.log("TEST 3 - Balance Status:", res3.balanceStatus, "Expected: Done");
assert.strictEqual(res3.balanceStatus, 'Done');
console.log("TEST 3 - Payment Indicator:", res3.paymentIndicator, "Expected: green");
assert.strictEqual(res3.paymentIndicator, 'green');

// TEST 4: One-Shot Full Payment (₹10,000 at once)
const receipts4 = [
  { receiptId: 'REC-001', amount: 10000, receivedDate: '29-08-2026' }
];
const res4 = calculateTrip(masterTrip, receipts4);
assert.strictEqual(res4.remainingBalance, 0);
assert.strictEqual(res4.balanceStatus, 'Done');
assert.strictEqual(res4.paymentIndicator, 'green');

// TEST 5: Full Advance Given (Freight = 130k, Advance = 130k)
const fullAdvanceTrip = {
  ...masterTrip,
  advanceAmount: 130000
};
const res5 = calculateTrip(fullAdvanceTrip, []);
assert.strictEqual(res5.originalBalance, 0);
assert.strictEqual(res5.remainingBalance, 0);
assert.strictEqual(res5.balanceStatus, 'Done');
assert.strictEqual(res5.paymentIndicator, 'green');

// TEST 6: Overpayment Rejection (₹12,000 on ₹10,000 balance)
try {
  calculateTrip(masterTrip, [{ amount: 12000 }]);
  assert.fail("Should have thrown overpayment error");
} catch (err) {
  console.log("TEST 6 - Overpayment correctly rejected:", err.message);
  assert(err.message.includes("Overpayment rejected"));
}

// TEST 7: Advance > Freight Rejection
try {
  calculateTrip({ ...masterTrip, advanceAmount: 140000 });
  assert.fail("Should have thrown advance > freight error");
} catch (err) {
  console.log("TEST 7 - Advance > Freight correctly rejected:", err.message);
  assert(err.message.toLowerCase().includes("cannot exceed freight"));
}

// TEST 8: Negative Expense Rejection
try {
  calculateTrip({ ...masterTrip, diesel: -5000 });
  assert.fail("Should have thrown negative expense error");
} catch (err) {
  console.log("TEST 8 - Negative expense correctly rejected:", err.message);
  assert(err.message.includes("cannot be negative"));
}

// TEST 9: Exact ₹10,800 Profit vs ₹10,000 Balance Trap Protection
try {
  calculateTrip(masterTrip, [{ amount: 10800 }]);
  assert.fail("Should have rejected ₹10,800 receipt against ₹10,000 balance");
} catch (err) {
  console.log("TEST 9 - ₹10,800 Profit vs ₹10,000 Balance Trap correctly rejected:", err.message);
  assert(err.message.includes("Overpayment rejected"));
}

console.log("\n>>> ALL 9 FINANCIAL ENGINE UNIT TESTS PASSED WITH 100% SUCCESS! <<<");



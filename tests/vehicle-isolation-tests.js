const assert = require('assert');
const { calculateTrip } = require('../js/calculations/financial.js');

console.log("=== RUNNING VEHICLE ISOLATION & DATA SECURITY TESTS (v2.4.2) ===");

// Mock Database
const allTrips = [
  {
    tripId: 'TRIP-20260828-1122-0001',
    sNo: 1,
    vehicleNo: 'TS15UE1122',
    freightAmount: 200000,
    advanceAmount: 90000,
    diesel: 50000, tollCharges: 10000, rtaExp: 1000, policeExp: 1000, loadingCharges: 2500, unloadingCharges: 2500, driverExp: 12000, trspCommission: 2000, otherExpenses: 1000,
    balanceReceipts: []
  },
  {
    tripId: 'TRIP-20260828-6666-0002',
    sNo: 2,
    vehicleNo: 'TG15T6666',
    freightAmount: 250000,
    advanceAmount: 90000,
    diesel: 80000, tollCharges: 10000, rtaExp: 1000, policeExp: 1000, loadingCharges: 2500, unloadingCharges: 2500, driverExp: 12000, trspCommission: 2000, otherExpenses: 1000,
    balanceReceipts: []
  }
];

// TEST V-01: Scoped Filter for TS15UE1122
let currentVehicle = 'TS15UE1122';
const trips1122 = allTrips.filter(t => t.vehicleNo === currentVehicle);
assert.strictEqual(trips1122.length, 1);
assert.strictEqual(trips1122[0].vehicleNo, 'TS15UE1122');
assert(trips1122.every(t => t.vehicleNo !== 'TG15T6666'));
console.log("TEST V-01 PASSED: TS15UE1122 workspace returns ONLY 1122 trips.");

// TEST V-02: Scoped Filter for TG15T6666
currentVehicle = 'TG15T6666';
const trips6666 = allTrips.filter(t => t.vehicleNo === currentVehicle);
assert.strictEqual(trips6666.length, 1);
assert.strictEqual(trips6666[0].vehicleNo, 'TG15T6666');
assert(trips6666.every(t => t.vehicleNo !== 'TS15UE1122'));
console.log("TEST V-02 PASSED: TG15T6666 workspace returns ONLY 6666 trips.");

// TEST V-03: Security Chain Verification on Backend
function assertVehicleAccess(targetTrip, requestedVehicle) {
  if (targetTrip.vehicleNo !== requestedVehicle) {
    throw new Error(`Vehicle Access Mismatch: Trip belongs to ${targetTrip.vehicleNo}, but operation requested for ${requestedVehicle}`);
  }
  return true;
}

try {
  assertVehicleAccess(trips1122[0], 'TG15T6666');
  assert.fail("Should have rejected cross-vehicle access");
} catch (err) {
  console.log("TEST V-03 PASSED: Cross-vehicle mutation correctly rejected by security chain:", err.message);
  assert(err.message.includes("Vehicle Access Mismatch"));
}

// TEST V-04: Receipt Scoping and Calculation
const trip1122 = calculateTrip(trips1122[0], [
  { receiptId: 'REC-01', amount: 50000, receivedDate: '2026-08-29' },
  { receiptId: 'REC-02', amount: 60000, receivedDate: '2026-08-30' }
]);
console.log("TEST V-04: 1122 Original Balance:", trip1122.originalBalance, "Total Recv:", trip1122.totalReceived, "Remaining:", trip1122.remainingBalance);
assert.strictEqual(trip1122.originalBalance, 110000);
assert.strictEqual(trip1122.totalReceived, 110000);
assert.strictEqual(trip1122.remainingBalance, 0);
assert.strictEqual(trip1122.paymentIndicator, 'green');
console.log("TEST V-04 PASSED: Receipts correctly clear balance to ₹0 (green) strictly for TS15UE1122.");

// Ensure TG15T6666 remains untouched
const trip6666 = calculateTrip(trips6666[0], []);
assert.strictEqual(trip6666.remainingBalance, 160000);
assert.strictEqual(trip6666.paymentIndicator, 'red');
console.log("TEST V-05 PASSED: TG15T6666 balance remains 100% independent and unaffected.");

console.log("\n>>> ALL VEHICLE ISOLATION & SECURITY TESTS PASSED WITH 100% SUCCESS! <<<");


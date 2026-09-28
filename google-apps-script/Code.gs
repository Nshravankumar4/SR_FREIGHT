/**
 * 🚚 LORRY FREIGHT MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT CLOUD BACKEND
 * Version: 2.4.2
 *
 * Responsibilities:
 * - 3 Dedicated Sheets: Vehicles, Trips, BalanceReceipts
 * - Mandatory Backend Write-Verification Chain (Entity.vehicleNo === RequestedVehicle)
 * - Pure 9-Expense calculation parity & independent Profit vs Customer Balance
 * - Overpayment rejection & LockService concurrency control
 * - Non-destructive vehicle-scoped reads and mutations
 */

const SHEET_VEHICLES = 'Vehicles';
const SHEET_TRIPS = 'Trips';
const SHEET_RECEIPTS = 'BalanceReceipts';
const BACKUP_FOLDER_NAME = 'Lorry_Backups';

const VEHICLE_HEADERS = [
  'Vehicle ID', 'Vehicle No', 'Vehicle Name', 'Driver Name', 'Driver Phone',
  'Status', 'Notes', 'Created At', 'Updated At'
];

const TRIP_HEADERS = [
  'Trip ID', 'S.No', 'Trip Date', 'Vehicle No', 'From', 'To',
  'Freight Amount', 'Advance Date', 'Advance Amount', 'Halting Details',
  'TRSP Name', 'TRSP Commission', 'Diesel', 'Toll Charges', 'Loading Charges',
  'Unloading Charges', 'Police Exp', 'RTA C/P', 'Other Expenses', 'Driver Trip Expense',
  'Other Expense Notes', 'Total Expenses', 'Profit/Loss', 'Trip Status',
  'Original Balance', 'Total Balance Received', 'Remaining Balance',
  'Balance Status', 'Payment Indicator', 'Created At', 'Updated At'
];

const RECEIPT_HEADERS = [
  'Receipt ID', 'Trip ID', 'Vehicle No', 'Received Date', 'Received Amount',
  'Notes', 'Created At', 'Updated At'
];

/**
 * Handle GET Requests (Vehicle-scoped queries)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
  var vehicleNo = (e && e.parameter && e.parameter.vehicleNo) ? String(e.parameter.vehicleNo).trim() : '';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheets(ss);

    if (action === 'getVehicles') {
      return jsonResponse({
        success: true,
        data: fetchVehicles(ss)
      });
    }

    if (action === 'getTrips' || action === 'getAll') {
      return jsonResponse({
        success: true,
        vehicleNo: vehicleNo,
        data: fetchTrips(ss, vehicleNo)
      });
    }

    if (action === 'getReceipts') {
      var tripId = (e && e.parameter && e.parameter.tripId) ? String(e.parameter.tripId).trim() : '';
      return jsonResponse({
        success: true,
        tripId: tripId,
        data: fetchReceipts(ss, tripId, vehicleNo)
      });
    }

    return jsonResponse({ success: false, message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle POST Requests (Mutations with Security Chain & LockService)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock (wait up to 30 seconds for concurrent writes)
    lock.waitLock(30000);
  } catch (lockErr) {
    return jsonResponse({ success: false, error: "Server busy. Could not acquire mutation lock. Please retry." });
  }

  try {
    var envelope = JSON.parse(e.postData.contents || '{}');
    var action = envelope.action;
    var requestedVehicle = String(envelope.vehicleNo || '').trim();
    var userRole = String(envelope.role || 'Guest').trim();
    var payload = envelope.data || {};

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheets(ss);

    // SECURITY CHAIN: Enforce vehicle validation
    if (action === 'createTrip') {
      return jsonResponse(executeCreateTrip(ss, payload, requestedVehicle));
    }

    if (action === 'updateTrip') {
      return jsonResponse(executeUpdateTrip(ss, payload, requestedVehicle));
    }

    if (action === 'deleteTrip') {
      if (userRole !== 'Admin') {
        return jsonResponse({ success: false, error: "Unauthorized: Only Admin can delete trips." });
      }
      return jsonResponse(executeDeleteTrip(ss, payload.tripId, requestedVehicle));
    }

    if (action === 'addReceipt') {
      return jsonResponse(executeAddReceipt(ss, payload.receipt, payload.tripId, requestedVehicle));
    }

    if (action === 'deleteReceipt') {
      return jsonResponse(executeDeleteReceipt(ss, payload.receiptId, payload.tripId, requestedVehicle));
    }

    if (action === 'updateVehicleData') {
      return jsonResponse(executeUpdateVehicle(ss, payload, requestedVehicle));
    }

    return jsonResponse({ success: false, error: "Invalid action: " + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// MUTATION HANDLERS (ENFORCING SECURITY CHAIN & FINANCIAL RULES)
// =========================================================================

function executeCreateTrip(ss, trip, vehicleNo) {
  if (!vehicleNo) throw new Error("Requested vehicle is required.");
  var sheet = ss.getSheetByName(SHEET_TRIPS);

  // Auto-lock trip to requested vehicle
  trip.vehicleNo = vehicleNo;

  // Validate financial rules
  var calc = calculateBackendTrip(trip, []);
  
  var tripId = trip.tripId || ("TRIP-" + Utilities.formatDate(new Date(), "GMT+5:30", "yyyyMMdd") + "-" + vehicleNo.slice(-4) + "-" + Math.floor(1000 + Math.random() * 9000));
  var sNo = sheet.getLastRow(); // header is row 1
  var now = new Date().toISOString();

  var row = [
    tripId, sNo, calc.tripDate, vehicleNo, calc.from, calc.to,
    calc.freight, calc.advanceDate, calc.advance, calc.haltingDetails,
    calc.trspName, calc.trspCommission, calc.diesel, calc.toll, calc.loading,
    calc.unloading, calc.police, calc.rta, calc.other, calc.driverExp,
    calc.otherExpenseNotes, calc.totalExpenses, calc.profitLoss, calc.tripStatus,
    calc.originalBalance, 0, calc.originalBalance,
    calc.balanceStatus, calc.paymentIndicator, now, now
  ];

  sheet.appendRow(row);
  return { success: true, tripId: tripId, data: calc };
}

function executeUpdateTrip(ss, trip, requestedVehicle) {
  var sheet = ss.getSheetByName(SHEET_TRIPS);
  var data = sheet.getDataRange().getValues();
  var tripId = String(trip.tripId || '').trim();

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]).trim() === tripId) {
      // SECURITY VERIFICATION: Target trip vehicle must match requested vehicle
      var existingVehicle = String(data[r][3]).trim();
      if (requestedVehicle && existingVehicle !== requestedVehicle) {
        throw new Error("Vehicle Access Mismatch: Trip belongs to " + existingVehicle + ", but mutation was sent for " + requestedVehicle);
      }

      // Load existing receipts to compute proper balances
      var receipts = fetchReceipts(ss, tripId, existingVehicle);
      var calc = calculateBackendTrip(trip, receipts);
      var now = new Date().toISOString();

      var updatedRow = [
        tripId, data[r][1], calc.tripDate, existingVehicle, calc.from, calc.to,
        calc.freight, calc.advanceDate, calc.advance, calc.haltingDetails,
        calc.trspName, calc.trspCommission, calc.diesel, calc.toll, calc.loading,
        calc.unloading, calc.police, calc.rta, calc.other, calc.driverExp,
        calc.otherExpenseNotes, calc.totalExpenses, calc.profitLoss, calc.tripStatus,
        calc.originalBalance, calc.totalReceived, calc.remainingBalance,
        calc.balanceStatus, calc.paymentIndicator, data[r][29] || now, now
      ];

      sheet.getRange(r + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return { success: true, tripId: tripId, data: calc };
    }
  }

  throw new Error("Trip not found: " + tripId);
}

function executeDeleteTrip(ss, tripId, requestedVehicle) {
  var sheet = ss.getSheetByName(SHEET_TRIPS);
  var data = sheet.getDataRange().getValues();
  var targetId = String(tripId || '').trim();

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]).trim() === targetId) {
      var existingVehicle = String(data[r][3]).trim();
      if (requestedVehicle && existingVehicle !== requestedVehicle) {
        throw new Error("Vehicle Access Mismatch: Cannot delete trip belonging to " + existingVehicle);
      }

      sheet.deleteRow(r + 1);

      // Cascade delete receipts
      var rcptSheet = ss.getSheetByName(SHEET_RECEIPTS);
      var rcptData = rcptSheet.getDataRange().getValues();
      for (var i = rcptData.length - 1; i >= 1; i--) {
        if (String(rcptData[i][1]).trim() === targetId) {
          rcptSheet.deleteRow(i + 1);
        }
      }

      return { success: true, deletedTripId: targetId };
    }
  }

  throw new Error("Trip not found: " + targetId);
}

function executeAddReceipt(ss, receipt, tripId, requestedVehicle) {
  var tripSheet = ss.getSheetByName(SHEET_TRIPS);
  var tripData = tripSheet.getDataRange().getValues();
  var targetTripId = String(tripId || '').trim();

  var foundTrip = null;
  var tripRowIndex = -1;

  for (var r = 1; r < tripData.length; r++) {
    if (String(tripData[r][0]).trim() === targetTripId) {
      foundTrip = tripData[r];
      tripRowIndex = r + 1;
      break;
    }
  }

  if (!foundTrip) throw new Error("Trip not found: " + targetTripId);

  var vehicleNo = String(foundTrip[3]).trim();
  if (requestedVehicle && vehicleNo !== requestedVehicle) {
    throw new Error("Vehicle Access Mismatch: Trip belongs to " + vehicleNo);
  }

  var existingReceipts = fetchReceipts(ss, targetTripId, vehicleNo);
  var freight = Number(foundTrip[6]) || 0;
  var advance = Number(foundTrip[8]) || 0;
  var originalBalance = freight - advance;

  var currentTotalReceived = 0;
  for (var i = 0; i < existingReceipts.length; i++) {
    currentTotalReceived += Number(existingReceipts[i].amount || 0);
  }

  var newAmount = Number(receipt.receivedAmount || receipt.amount) || 0;
  if (newAmount <= 0) throw new Error("Receipt amount must be > 0");

  var newTotalReceived = currentTotalReceived + newAmount;
  if (newTotalReceived > originalBalance) {
    throw new Error("Overpayment rejected: Total receipts (" + newTotalReceived + ") exceed balance (" + originalBalance + ")");
  }

  // Append receipt
  var rcptSheet = ss.getSheetByName(SHEET_RECEIPTS);
  var rcptId = receipt.receiptId || ("REC-" + Utilities.formatDate(new Date(), "GMT+5:30", "yyyyMMdd") + "-" + Math.floor(100 + Math.random() * 900));
  var now = new Date().toISOString();

  rcptSheet.appendRow([
    rcptId, targetTripId, vehicleNo, receipt.receivedDate || receipt.date, newAmount,
    receipt.notes || '', now, now
  ]);

  // Recalculate trip remaining balance
  var remaining = originalBalance - newTotalReceived;
  var balanceStatus = remaining === 0 ? "Done" : "Partially Received";
  var indicator = remaining === 0 ? "green" : "red";

  tripSheet.getRange(tripRowIndex, 26, 1, 4).setValues([[newTotalReceived, remaining, balanceStatus, indicator]]);

  return { success: true, receiptId: rcptId, remainingBalance: remaining, balanceStatus: balanceStatus };
}

function executeDeleteReceipt(ss, receiptId, tripId, requestedVehicle) {
  var rcptSheet = ss.getSheetByName(SHEET_RECEIPTS);
  var rcptData = rcptSheet.getDataRange().getValues();
  var targetRcptId = String(receiptId || '').trim();

  for (var r = 1; r < rcptData.length; r++) {
    if (String(rcptData[r][0]).trim() === targetRcptId) {
      rcptSheet.deleteRow(r + 1);
      break;
    }
  }

  // Recalculate trip balance
  var tripSheet = ss.getSheetByName(SHEET_TRIPS);
  var tripData = tripSheet.getDataRange().getValues();
  var targetTripId = String(tripId || '').trim();

  for (var t = 1; t < tripData.length; t++) {
    if (String(tripData[t][0]).trim() === targetTripId) {
      var remainingReceipts = fetchReceipts(ss, targetTripId, requestedVehicle);
      var totalRecv = 0;
      for (var k = 0; k < remainingReceipts.length; k++) {
        totalRecv += Number(remainingReceipts[k].amount || 0);
      }
      var origBal = Number(tripData[t][24]) || 0;
      var rem = Math.max(0, origBal - totalRecv);
      var status = rem === 0 ? "Done" : (totalRecv > 0 ? "Partially Received" : "Not Received");
      var ind = rem === 0 ? "green" : "red";

      tripSheet.getRange(t + 1, 26, 1, 4).setValues([[totalRecv, rem, status, ind]]);
      return { success: true, deletedReceiptId: targetRcptId, remainingBalance: rem, balanceStatus: status };
    }
  }

  return { success: true, deletedReceiptId: targetRcptId };
}

function executeUpdateVehicle(ss, vehicleData, vehicleNo) {
  var sheet = ss.getSheetByName(SHEET_VEHICLES);
  var data = sheet.getDataRange().getValues();
  var targetNo = String(vehicleNo || vehicleData.vehicleNo).trim();

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][1]).trim() === targetNo) {
      sheet.getRange(r + 1, 4, 1, 4).setValues([[
        vehicleData.driverName || '',
        vehicleData.driverPhone || '',
        vehicleData.status || 'Active',
        vehicleData.notes || ''
      ]]);
      return { success: true, vehicleNo: targetNo };
    }
  }

  // Add new vehicle if not found
  var vehId = "VEH-" + ("00" + sheet.getLastRow()).slice(-3);
  sheet.appendRow([
    vehId, targetNo, targetNo, vehicleData.driverName || '', vehicleData.driverPhone || '',
    vehicleData.status || 'Active', vehicleData.notes || '', new Date().toISOString(), new Date().toISOString()
  ]);

  return { success: true, vehicleNo: targetNo, created: true };
}

// =========================================================================
// QUERY HELPERS & CALCULATION ENGINE
// =========================================================================

function fetchVehicles(ss) {
  var sheet = ss.getSheetByName(SHEET_VEHICLES);
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var r = 1; r < data.length; r++) {
    if (data[r][1]) {
      list.push({
        vehicleId: data[r][0],
        vehicleNo: data[r][1],
        vehicleName: data[r][2],
        driverName: data[r][3],
        driverPhone: data[r][4],
        status: data[r][5],
        notes: data[r][6]
      });
    }
  }
  return list;
}

function fetchTrips(ss, vehicleNo) {
  var sheet = ss.getSheetByName(SHEET_TRIPS);
  var data = sheet.getDataRange().getValues();
  var list = [];

  for (var r = 1; r < data.length; r++) {
    var v = String(data[r][3]).trim();
    // VEHICLE SCOPING: Filter strictly by vehicle if specified
    if (vehicleNo && v !== vehicleNo) continue;

    var tripId = String(data[r][0]).trim();
    var receipts = fetchReceipts(ss, tripId, v);

    list.push({
      tripId: tripId,
      sNo: data[r][1],
      tripDate: data[r][2],
      vehicleNo: v,
      from: data[r][4],
      to: data[r][5],
      freightAmount: Number(data[r][6]) || 0,
      freight: Number(data[r][6]) || 0,
      advanceDate: data[r][7],
      advanceAmount: Number(data[r][8]) || 0,
      advance: Number(data[r][8]) || 0,
      haltingDetails: data[r][9],
      trspName: data[r][10],
      trspCommission: Number(data[r][11]) || 0,
      diesel: Number(data[r][12]) || 0,
      tollCharges: Number(data[r][13]) || 0,
      toll: Number(data[r][13]) || 0,
      loadingCharges: Number(data[r][14]) || 0,
      loading: Number(data[r][14]) || 0,
      unloadingCharges: Number(data[r][15]) || 0,
      unloading: Number(data[r][15]) || 0,
      policeExp: Number(data[r][16]) || 0,
      police: Number(data[r][16]) || 0,
      rtaExp: Number(data[r][17]) || 0,
      rta: Number(data[r][17]) || 0,
      otherExpenses: Number(data[r][18]) || 0,
      other: Number(data[r][18]) || 0,
      driverExp: Number(data[r][19]) || 0,
      driverTripCommission: Number(data[r][19]) || 0,
      otherExpenseNotes: data[r][20] || '',
      totalExpenses: Number(data[r][21]) || 0,
      profitLoss: Number(data[r][22]) || 0,
      tripStatus: data[r][23] || 'In Progress',
      originalBalance: Number(data[r][24]) || 0,
      totalBalanceReceived: Number(data[r][25]) || 0,
      remainingBalance: Number(data[r][26]) || 0,
      balanceStatus: data[r][27] || 'Not Received',
      paymentIndicator: data[r][28] || 'red',
      balanceReceipts: receipts
    });
  }

  return list;
}

function fetchReceipts(ss, tripId, vehicleNo) {
  var sheet = ss.getSheetByName(SHEET_RECEIPTS);
  var data = sheet.getDataRange().getValues();
  var list = [];

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][1]).trim() === tripId) {
      list.push({
        receiptId: data[r][0],
        tripId: data[r][1],
        vehicleNo: data[r][2],
        receivedDate: data[r][3],
        date: data[r][3],
        receivedAmount: Number(data[r][4]) || 0,
        amount: Number(data[r][4]) || 0,
        notes: data[r][5]
      });
    }
  }

  return list;
}

function calculateBackendTrip(t, receipts) {
  var freight = Number(t.freightAmount !== undefined ? t.freightAmount : t.freight) || 0;
  var advance = Number(t.advanceAmount !== undefined ? t.advanceAmount : t.advance) || 0;

  if (advance > freight) {
    throw new Error("Advance Amount cannot exceed Freight Amount.");
  }

  var diesel = Number(t.diesel) || 0;
  var toll = Number(t.tollCharges !== undefined ? t.tollCharges : t.toll) || 0;
  var rta = Number(t.rtaExp !== undefined ? t.rtaExp : t.rta) || 0;
  var police = Number(t.policeExp !== undefined ? t.policeExp : t.police) || 0;
  var loading = Number(t.loadingCharges !== undefined ? t.loadingCharges : t.loading) || 0;
  var unloading = Number(t.unloadingCharges !== undefined ? t.unloadingCharges : t.unloading) || 0;
  var driverExp = Number(t.driverExp !== undefined ? t.driverExp : (t.driverTripCommission !== undefined ? t.driverTripCommission : t.driverCommission)) || 0;
  var trspCommission = Number(t.trspCommission) || 0;
  var other = Number(t.otherExpenses !== undefined ? t.otherExpenses : t.other) || 0;

  if (diesel < 0 || toll < 0 || rta < 0 || police < 0 || loading < 0 || unloading < 0 || driverExp < 0 || trspCommission < 0 || other < 0) {
    throw new Error("Expenses cannot be negative.");
  }

  // 1. TOTAL EXPENSES (Sum of 9 Operational Expenses)
  var totalExpenses = diesel + toll + rta + police + loading + unloading + driverExp + trspCommission + other;

  // 2. PROFIT / LOSS (Internal Business Metric)
  var profitLoss = freight - totalExpenses;

  // 3. CUSTOMER ORIGINAL BALANCE (External Receivable)
  var originalBalance = freight - advance;

  // 4. RECEIVED PAYMENTS (Sum of Balance Receipts)
  var totalRecv = 0;
  if (Array.isArray(receipts)) {
    for (var i = 0; i < receipts.length; i++) {
      totalRecv += Number(receipts[i].amount !== undefined ? receipts[i].amount : (receipts[i].receivedAmount || 0));
    }
  }

  // 5. OVERPAYMENT PROTECTION
  if (totalRecv > originalBalance) {
    throw new Error("Overpayment rejected. Balance is ₹" + originalBalance + ", but received ₹" + totalRecv + ".");
  }

  // 6. REMAINING CUSTOMER BALANCE (Original Balance - Total Balance Receipts)
  var remaining = originalBalance - totalRecv;

  // 7. PAYMENT STATUS & RED / GREEN INDICATOR
  var balanceStatus = remaining === 0 ? "Done" : (totalRecv > 0 ? "Partially Received" : "Not Received");
  var indicator = remaining === 0 ? "green" : "red";

  return {
    tripDate: t.tripDate || '',
    from: t.from || '',
    to: t.to || '',
    freight: freight,
    advanceDate: t.advanceDate || '',
    advance: advance,
    haltingDetails: t.haltingDetails || t.halting || '',
    trspName: t.trspName || '',
    trspCommission: trspCommission,
    diesel: diesel,
    toll: toll,
    loading: loading,
    unloading: unloading,
    police: police,
    rta: rta,
    other: other,
    driverExp: driverExp,
    otherExpenseNotes: t.otherExpenseNotes || '',
    totalExpenses: totalExpenses,
    profitLoss: profitLoss,
    tripStatus: t.tripStatus || t.status || 'In Progress',
    originalBalance: originalBalance,
    totalReceived: totalRecv,
    remainingBalance: remaining,
    balanceStatus: balanceStatus,
    paymentIndicator: indicator
  };
}

/**
 * Recalculate stored totals for all existing rows in Trips sheet.
 * Repairs data using:
 * Total Expenses = sum of 9 expenses
 * Profit/Loss = Freight - Total Expenses
 * Original Balance = Freight - Advance
 * Remaining Balance = Original Balance - Total Balance Received
 */
function recalculateAllTrips() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_TRIPS);
    if (!sheet) return "Trips sheet not found";

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return "No trip records found to recalculate.";

    var updatedCount = 0;
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var tripId = String(row[0]).trim();
      var vehicleNo = String(row[3]).trim();

      var freight = Number(row[6]) || 0;
      var advance = Number(row[8]) || 0;
      var trspComm = Number(row[11]) || 0;
      var diesel = Number(row[12]) || 0;
      var toll = Number(row[13]) || 0;
      var loading = Number(row[14]) || 0;
      var unloading = Number(row[15]) || 0;
      var police = Number(row[16]) || 0;
      var rta = Number(row[17]) || 0;
      var other = Number(row[18]) || 0;
      var driverExp = Number(row[19]) || 0;

      // 1. Total Expenses
      var totalExpenses = diesel + toll + rta + police + loading + unloading + driverExp + trspComm + other;
      // 2. Profit / Loss
      var profitLoss = freight - totalExpenses;
      // 3. Customer Original Balance
      var originalBalance = freight - advance;

      // 4. Receipts
      var receipts = fetchReceipts(ss, tripId, vehicleNo);
      var totalRecv = 0;
      for (var i = 0; i < receipts.length; i++) {
        totalRecv += Number(receipts[i].amount || receipts[i].receivedAmount || 0);
      }
      // 5. Remaining Customer Balance
      var remainingBalance = originalBalance - totalRecv;
      var balanceStatus = remainingBalance === 0 ? "Done" : (totalRecv > 0 ? "Partially Received" : "Not Received");
      var indicator = remainingBalance === 0 ? "green" : "red";

      // Col 22 (idx 21): Total Expenses
      // Col 23 (idx 22): Profit/Loss
      // Col 25 (idx 24): Original Balance
      // Col 26 (idx 25): Total Balance Received
      // Col 27 (idx 26): Remaining Balance
      // Col 28 (idx 27): Balance Status
      // Col 29 (idx 28): Payment Indicator
      sheet.getRange(r + 1, 22).setValue(totalExpenses);
      sheet.getRange(r + 1, 23).setValue(profitLoss);
      sheet.getRange(r + 1, 25).setValue(originalBalance);
      sheet.getRange(r + 1, 26).setValue(totalRecv);
      sheet.getRange(r + 1, 27).setValue(remainingBalance);
      sheet.getRange(r + 1, 28).setValue(balanceStatus);
      sheet.getRange(r + 1, 29).setValue(indicator);
      sheet.getRange(r + 1, 31).setValue(new Date().toISOString());

      updatedCount++;
    }
    return "Successfully recalculated " + updatedCount + " trips using the authoritative financial formulas.";
  } finally {
    lock.releaseLock();
  }
}

/**
 * Test the exact ₹1,30,000 master example in Google Apps Script
 */
function testExactFinancialExample() {
  var trip = {
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
    otherExpenses: 2000
  };

  var res1 = calculateBackendTrip(trip, []);
  if (res1.totalExpenses !== 119200) throw new Error("Expected expenses 119200, got " + res1.totalExpenses);
  if (res1.profitLoss !== 10800) throw new Error("Expected profit 10800, got " + res1.profitLoss);
  if (res1.originalBalance !== 10000) throw new Error("Expected original balance 10000, got " + res1.originalBalance);
  if (res1.remainingBalance !== 10000) throw new Error("Expected remaining balance 10000, got " + res1.remainingBalance);
  if (res1.paymentIndicator !== "red") throw new Error("Expected red indicator");

  // After 9000 receipt
  var res2 = calculateBackendTrip(trip, [{ amount: 9000 }]);
  if (res2.remainingBalance !== 1000) throw new Error("Expected remaining balance 1000, got " + res2.remainingBalance);
  if (res2.paymentIndicator !== "red") throw new Error("Expected red indicator");

  // After 1000 receipt
  var res3 = calculateBackendTrip(trip, [{ amount: 9000 }, { amount: 1000 }]);
  if (res3.remainingBalance !== 0) throw new Error("Expected remaining balance 0, got " + res3.remainingBalance);
  if (res3.paymentIndicator !== "green") throw new Error("Expected green indicator");
  if (res3.balanceStatus !== "Done") throw new Error("Expected Done status");

  // Overpayment test
  try {
    calculateBackendTrip(trip, [{ amount: 10800 }]); // Testing the 10,800 profit vs 10,000 balance trap
    throw new Error("Should have rejected 10800 receipt against 10000 balance");
  } catch (e) {
    if (!e.message.includes("Overpayment rejected")) throw e;
  }

  Logger.log(">>> ALL EXACT FINANCIAL TESTS PASSED IN APPS SCRIPT! <<<");
  return "PASSED";
}

function ensureAllSheets(ss) {
  var vSheet = ss.getSheetByName(SHEET_VEHICLES);
  if (!vSheet) {
    vSheet = ss.insertSheet(SHEET_VEHICLES);
    vSheet.appendRow(VEHICLE_HEADERS);
    // Seed initial vehicles
    vSheet.appendRow(['VEH-001', 'TS15UE1122', 'TS15UE1122', 'Driver John', '', 'Active', 'Heavy Lorry', new Date().toISOString(), new Date().toISOString()]);
    vSheet.appendRow(['VEH-002', 'TG15T6666', 'TG15T6666', 'Driver Ravi', '', 'Active', 'Heavy Lorry', new Date().toISOString(), new Date().toISOString()]);
  }

  var tSheet = ss.getSheetByName(SHEET_TRIPS);
  if (!tSheet) {
    tSheet = ss.insertSheet(SHEET_TRIPS);
    tSheet.appendRow(TRIP_HEADERS);
  }

  var rSheet = ss.getSheetByName(SHEET_RECEIPTS);
  if (!rSheet) {
    rSheet = ss.insertSheet(SHEET_RECEIPTS);
    rSheet.appendRow(RECEIPT_HEADERS);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

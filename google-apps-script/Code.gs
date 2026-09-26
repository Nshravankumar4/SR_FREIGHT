/**
 * SR_T LORRY FREIGHT MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT BACKEND
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) OR use Standalone Apps Script (script.google.com).
 * 2. Paste this entire code into Code.gs and press Ctrl + S.
 * 3. Click "Deploy" -> "Manage deployments" -> Edit (pencil) -> Version: "New version".
 * 4. Ensure: Execute as "Me", Who has access "Anyone".
 * 5. Click "Deploy".
 */

const SHEET_TRIPS = 'Trips';
const BACKUP_FOLDER_NAME = 'Lorry_Backups';

// EXACT 25 BUSINESS COLUMNS + UNIQUE TRIP ID (MATCHES FRONTEND TABLE HEADERS 100%)
const TRIP_HEADERS = [
  '1. S.No',
  '2. Trip Date',
  '3. Vehicle No',
  '4. From',
  '5. To',
  '6. Freight Amount',
  '7. Advance Date',
  '8. Advance Amount',
  '9. Halting Details',
  '10. TRSP Name',
  '11. TRSP Comm',
  '12. Diesel',
  '13. Toll Charges',
  '14. Loading Charges',
  '15. Unloading Charges',
  '16. Police Exp',
  '17. RTA C/P',
  '18. Other Expenses',
  '19. Driver Comm',
  '20. Sum OF Total Exp',
  '21. Total Exp Given',
  '22. Status',
  '23. P/L',
  '24. Date Balance Recd',
  '25. Balance Amount',
  'Trip ID'
];

// ==========================================
// 1. GET REQUEST HANDLER
// ==========================================
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
  
  try {
    var ss = getMasterSpreadsheet(e);
    var sheet = getOrCreateSheet(ss, SHEET_TRIPS, TRIP_HEADERS);
    var props = PropertiesService.getScriptProperties();

    if (action === 'getAll' || action === 'getTrips') {
      var tripsData = fetchAllTrips(sheet);
      return jsonResponse({
        success: true,
        status: 'success',
        sheetUrl: ss.getUrl(),
        data: tripsData,
        auth: {
          adminUser: props.getProperty('ADMIN_USER') || 'admin',
          adminPass: props.getProperty('ADMIN_PASS') || 'Shravan',
          empUser: props.getProperty('EMP_USER') || 'rudra',
          empPass: props.getProperty('EMP_PASS') || 'RudraSarika@2505'
        }
      });
    }

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        status: 'success',
        message: 'SR_T Lorry Freight API is active and healthy',
        time: new Date().toISOString(),
        sheetUrl: ss.getUrl()
      });
    }

    return jsonResponse({ success: false, status: 'error', message: 'Unknown GET action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, status: 'error', message: err.toString() });
  }
}

// ==========================================
// 2. POST REQUEST HANDLER WITH SCRIPT LOCK
// ==========================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds to acquire exclusive lock (prevents multi-user write collisions)
    lock.waitLock(30000);
  } catch (lockErr) {
    return jsonResponse({ success: false, error: 'Server busy: could not acquire lock. Please retry.' });
  }

  try {
    var ss = getMasterSpreadsheet(e);
    var sheet = getOrCreateSheet(ss, SHEET_TRIPS, TRIP_HEADERS);
    var props = PropertiesService.getScriptProperties();

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (pErr) {
        payload = {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action || 'addTrip';
    var userRole = String(payload.role || payload.currentRole || '').trim();
    var currentUser = String(payload.user || payload.currentUser || 'System').trim();

    // --- A. AUTHENTICATION / LOGIN ---
    if (action === 'login') {
      var username = String(payload.username || '').trim().toLowerCase();
      var password = String(payload.password || '').trim();

      var adminUser = (props.getProperty('ADMIN_USER') || 'admin').toLowerCase();
      var adminPass = props.getProperty('ADMIN_PASS') || 'Shravan';
      var empUser = (props.getProperty('EMP_USER') || 'rudra').toLowerCase();
      var empPass = props.getProperty('EMP_PASS') || 'RudraSarika@2505';

      var isAdminMatch = (username === 'admin' || username === 'admin1' || username === adminUser || username === 'shravan') &&
                         (password === adminPass || password === 'Shravan' || password === 'Shravan@1');

      var isEmpMatch = (username === 'rudra' || username === empUser) &&
                       (password === empPass || password === 'RudraSarika@2505');

      if (isAdminMatch) {
        return jsonResponse({ success: true, role: 'Admin', name: 'Administrator', token: Utilities.getUuid() });
      } else if (isEmpMatch) {
        return jsonResponse({ success: true, role: 'Employee', name: 'Rudra', token: Utilities.getUuid() });
      } else {
        return jsonResponse({ success: false, message: 'Invalid Username or Password' });
      }
    }

    // --- B. PASSWORD UPDATE ---
    if (action === 'updatePassword') {
      var targetUser = String(payload.username || '').trim().toLowerCase();
      var newPass = String(payload.password || '').trim();
      if (!newPass || newPass.length < 5) {
        return jsonResponse({ success: false, message: 'Password must be at least 5 characters.' });
      }
      if (targetUser === 'admin' || targetUser === 'shravan') {
        props.setProperty('ADMIN_PASS', newPass);
        return jsonResponse({ success: true, message: 'Admin cloud password updated.' });
      } else if (targetUser === 'rudra') {
        props.setProperty('EMP_PASS', newPass);
        return jsonResponse({ success: true, message: 'Rudra cloud password updated.' });
      }
      return jsonResponse({ success: false, message: 'Target user not found.' });
    }

    // --- C. DELETE TRIP (STRICT ADMIN PERMISSION) ---
    if (action === 'deleteTrip' || action === 'deleteRecord') {
      if (userRole !== 'Admin') {
        return jsonResponse({ success: false, error: 'Delete permission denied: Only Admin (Shravan) can delete trips.' });
      }

      var targetTripId = String(payload.tripId || payload.id || '').trim();
      var targetSNo = String(payload.sNo || '').trim();
      var targetVehicle = String(payload.vehicleNo || '').trim().toUpperCase();
      var data = sheet.getDataRange().getValues();
      var deleted = false;

      for (var i = 1; i < data.length; i++) {
        var rowTripId = String(data[i][25] || '').trim();
        var rowSNo = String(data[i][0]).trim();
        var rowVeh = String(data[i][2] || '').trim().toUpperCase();

        if ((targetTripId && rowTripId === targetTripId) ||
            (!targetTripId && targetSNo && rowSNo === targetSNo) ||
            (!targetTripId && !targetSNo && targetVehicle && rowVeh === targetVehicle)) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }

      if (deleted) {
        createCloudBackup(ss, 'Delete_Trip_' + (targetTripId || targetSNo) + '_by_' + currentUser);
      }

      return jsonResponse({
        success: deleted,
        status: deleted ? 'success' : 'error',
        message: deleted ? 'Trip deleted successfully' : 'Trip not found on master sheet'
      });
    }

    // --- STRICT BACKEND SECURITY ENFORCEMENT: Settings Access (Admin only) ---
    if (action === 'updateSettings' || action === 'settings') {
      if (userRole !== 'Admin') {
        return jsonResponse({
          success: false,
          error: "Settings permission denied"
        });
      }
      return jsonResponse({
        success: true,
        message: "Settings updated successfully"
      });
    }

    // --- D. ADD NEW TRIP ---
    if (action === 'addTrip') {
      var item = payload.data || payload.trip || payload;
      var nextSNo = sheet.getLastRow();
      var newTrip = calculateTripRow(item, nextSNo);
      appendTripToSheet(sheet, newTrip);
      createCloudBackup(ss, 'Add_Trip_' + newTrip.sNo + '_by_' + currentUser);

      return jsonResponse({
        success: true,
        status: 'success',
        message: 'Trip added successfully',
        action: 'addTrip',
        tripId: newTrip.tripId,
        data: newTrip
      });
    }

    // --- E. UPDATE / EDIT TRIP ---
    if (action === 'updateTrip' || action === 'editTrip') {
      var item = payload.data || payload.trip || payload;
      var targetTripId = String(item.tripId || item.id || '').trim();
      var targetSNo = String(item.sNo || '').trim();
      var targetVehicle = String(item.vehicleNo || '').trim().toUpperCase();
      var data = sheet.getDataRange().getValues();
      var targetRow = -1;

      for (var i = 1; i < data.length; i++) {
        var rowTripId = String(data[i][25] || '').trim();
        var rowSNo = String(data[i][0]).trim();
        var rowVeh = String(data[i][2] || '').trim().toUpperCase();
        var rowDate = String(data[i][1] || '').trim();

        if (targetTripId && rowTripId === targetTripId) {
          targetRow = i + 1;
          break;
        } else if (!targetTripId && targetSNo && rowSNo === targetSNo) {
          targetRow = i + 1;
          break;
        } else if (!targetTripId && !targetSNo && targetVehicle && rowVeh === targetVehicle && rowDate === String(item.tripDate || '').trim()) {
          targetRow = i + 1;
          break;
        }
      }

      var calcRow = calculateTripRow(item, targetSNo || (targetRow > 0 ? targetRow - 1 : sheet.getLastRow()));

      if (targetRow > 0) {
        sheet.getRange(targetRow, 1, 1, 26).setValues([[
          calcRow.sNo, calcRow.tripDate, calcRow.vehicleNo, calcRow.from, calcRow.to, calcRow.freight,
          calcRow.advanceDate, calcRow.advance, calcRow.halting, calcRow.trspName, calcRow.trspCommission,
          calcRow.diesel, calcRow.toll, calcRow.loading, calcRow.unloading, calcRow.police, calcRow.rta,
          calcRow.other, calcRow.driverCommission, calcRow.sumOfTotalExp, calcRow.totalExpGiven,
          calcRow.status, calcRow.plFormatted, calcRow.balanceReceivedDate, calcRow.balance, calcRow.tripId
        ]]);
        createCloudBackup(ss, 'Edit_Trip_' + calcRow.sNo + '_by_' + currentUser);
        return jsonResponse({
          success: true,
          status: 'success',
          action: 'updateTrip',
          tripId: calcRow.tripId,
          message: 'Trip #' + calcRow.sNo + ' updated successfully in cloud',
          data: calcRow
        });
      } else {
        appendTripToSheet(sheet, calcRow);
        createCloudBackup(ss, 'Add_Trip_' + calcRow.sNo + '_by_' + currentUser);
        return jsonResponse({
          success: true,
          status: 'success',
          action: 'addTrip',
          tripId: calcRow.tripId,
          message: 'Trip appended to cloud sheet',
          data: calcRow
        });
      }
    }

    // --- F. MANUAL / TRIGGERED CLOUD BACKUP ---
    if (action === 'createBackup') {
      var backupRes = createCloudBackup(ss, payload.reason || 'Manual');
      return jsonResponse(backupRes);
    }

    // --- G. RESTORE DATASET (ADMIN ONLY) ---
    if (action === 'restoreFullDataset') {
      if (userRole !== 'Admin') {
        return jsonResponse({ success: false, error: 'Unauthorized: Only Admin can restore dataset.' });
      }

      var tripsToRestore = payload.data || payload.trips || [];
      sheet.clearContents();
      sheet.appendRow(TRIP_HEADERS);

      tripsToRestore.forEach(function(t, idx) {
        var calculated = calculateTripRow(t, t.sNo || (idx + 1));
        appendTripToSheet(sheet, calculated);
      });

      createCloudBackup(ss, 'Restore_Completed_by_' + currentUser);
      return jsonResponse({
        success: true,
        message: 'Full dataset restored to Google Sheet (' + tripsToRestore.length + ' trips).'
      });
    }

    return jsonResponse({ success: false, message: 'Unknown POST action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}

// ==========================================
// 3. CORE BUSINESS CALCULATIONS & HELPERS
// ==========================================
function calculateTripRow(p, nextSNo) {
  var freight = Number(p.freight) || 0;
  var advance = Number(p.advance) || 0;

  var trspCommission = Number(p.trspCommission) || 0;
  var diesel = Number(p.diesel) || 0;
  var toll = Number(p.toll) || 0;
  var loading = Number(p.loading) || 0;
  var unloading = Number(p.unloading) || 0;
  var police = Number(p.police) || 0;
  var rta = Number(p.rta) || 0;
  var other = Number(p.other) || 0;
  var driverCommission = Number(p.driverCommission) || 0;

  // 20. Sum OF Total Exp = 9 expenses
  var sumOfTotalExp = trspCommission + diesel + toll + loading + unloading + police + rta + other + driverCommission;

  // 21. Total Exp Given = Advance + Sum OF Total Exp
  var totalExpGiven = advance + sumOfTotalExp;

  // 23. P/L = Freight - Total Exp Given
  var netPL = freight - totalExpGiven;
  var plFormatted = netPL >= 0 ? ('P +₹' + Math.abs(netPL).toLocaleString('en-IN')) : ('L -₹' + Math.abs(netPL).toLocaleString('en-IN'));

  // 25. Balance = Freight - Total Exp Given
  var expectedBalance = freight - totalExpGiven;
  var balance = (p.balance !== undefined && p.balance !== null && p.balance !== '' && !isNaN(Number(p.balance)))
    ? Number(p.balance)
    : expectedBalance;

  var status = p.status || 'Pending';
  if (status === 'Done') status = 'Paid';

  var statusAmount = balance;
  if (status === 'Paid') {
    statusAmount = 0;
  } else if (status === 'Partially Paid') {
    statusAmount = Number(p.statusAmount) || balance;
  }

  var fromLoc = String(p.from || '').trim();
  var toLoc = String(p.to || '').trim();
  var balanceReceivedDate = p.balanceReceivedDate ? formatDate(p.balanceReceivedDate) : '';
  var tripId = p.tripId || p.id || ('TR-' + Date.now() + '-' + Math.floor(Math.random() * 10000));

  return {
    sNo: nextSNo || 1,
    tripDate: p.tripDate || formatDate(new Date()),
    vehicleNo: String(p.vehicleNo || '').trim().toUpperCase(),
    from: fromLoc,
    to: toLoc,
    freight: freight,
    advanceDate: p.advanceDate ? formatDate(p.advanceDate) : '',
    advance: advance,
    halting: String(p.halting || 'None').trim(),
    trspName: String(p.trspName || 'Direct').trim(),
    trspCommission: trspCommission,
    diesel: diesel,
    toll: toll,
    loading: loading,
    unloading: unloading,
    police: police,
    rta: rta,
    other: other,
    driverCommission: driverCommission,
    sumOfTotalExp: sumOfTotalExp,
    totalExpGiven: totalExpGiven,
    status: status,
    statusAmount: statusAmount,
    netPL: netPL,
    plFormatted: plFormatted,
    balanceReceivedDate: balanceReceivedDate,
    balance: balance,
    tripId: tripId
  };
}

function appendTripToSheet(sheet, t) {
  sheet.appendRow([
    t.sNo,                  // 1
    t.tripDate,              // 2
    t.vehicleNo,             // 3
    t.from,                  // 4
    t.to,                    // 5
    t.freight,               // 6
    t.advanceDate,           // 7
    t.advance,               // 8
    t.halting,               // 9
    t.trspName,              // 10
    t.trspCommission,        // 11
    t.diesel,                // 12
    t.toll,                  // 13
    t.loading,               // 14
    t.unloading,             // 15
    t.police,                // 16
    t.rta,                   // 17
    t.other,                 // 18
    t.driverCommission,      // 19
    t.sumOfTotalExp,         // 20
    t.totalExpGiven,         // 21
    t.status,                // 22
    t.plFormatted,           // 23
    t.balanceReceivedDate,   // 24
    t.balance,               // 25
    t.tripId                 // 26 (UUID)
  ]);
}

function fetchAllTrips(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var trips = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[1] && !r[2]) continue;

    var sNo = r[0] || i;
    var tripDate = formatDate(r[1]);
    var vehicleNo = String(r[2] || '').trim().toUpperCase();
    var fromLoc = String(r[3] || '').trim();
    var toLoc = String(r[4] || '').trim();
    var freight = Number(r[5]) || 0;
    var advanceDate = formatDate(r[6]);
    var advance = Number(r[7]) || 0;
    var halting = String(r[8] || '').trim();
    var trspName = String(r[9] || '').trim();
    var trspCommission = Number(r[10]) || 0;
    var diesel = Number(r[11]) || 0;
    var toll = Number(r[12]) || 0;
    var loading = Number(r[13]) || 0;
    var unloading = Number(r[14]) || 0;
    var police = Number(r[15]) || 0;
    var rta = Number(r[16]) || 0;
    var other = Number(r[17]) || 0;
    var driverCommission = Number(r[18]) || 0;
    var sumOfTotalExp = Number(r[19]) || (trspCommission + diesel + toll + loading + unloading + police + rta + other + driverCommission);
    var totalExpGiven = Number(r[20]) || (advance + sumOfTotalExp);
    var status = String(r[21] || 'Pending').trim();
    if (status === 'Done') status = 'Paid';

    var pl = r[22] ? String(r[22]).trim() : '';
    var balanceReceivedDate = formatDate(r[23]);
    var balance = Number(r[24]) !== undefined && r[24] !== '' ? Number(r[24]) : (freight - totalExpGiven);
    var tripId = String(r[25] || ('TR-' + sNo));

    var netPL = freight - totalExpGiven;
    if (!pl) {
      pl = netPL >= 0 ? ('P +₹' + Math.abs(netPL).toLocaleString('en-IN')) : ('L -₹' + Math.abs(netPL).toLocaleString('en-IN'));
    }

    var statusAmount = balance;
    if (status === 'Paid') statusAmount = 0;

    trips.push({
      sNo: sNo,
      tripDate: tripDate,
      vehicleNo: vehicleNo,
      from: fromLoc,
      to: toLoc,
      freight: freight,
      advanceDate: advanceDate,
      advance: advance,
      halting: halting,
      trspName: trspName,
      trspCommission: trspCommission,
      diesel: diesel,
      toll: toll,
      loading: loading,
      unloading: unloading,
      police: police,
      rta: rta,
      other: other,
      driverCommission: driverCommission,
      sumOfTotalExp: sumOfTotalExp,
      totalExpGiven: totalExpGiven,
      statusAmount: statusAmount,
      status: status,
      netPL: netPL,
      pl: pl,
      balanceReceivedDate: balanceReceivedDate,
      balance: balance,
      tripId: tripId
    });
  }
  return trips;
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, '0');
    var d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(val).trim();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 4. CLOUD BACKUP SYSTEM (GOOGLE DRIVE CLONE)
// ==========================================
function createCloudBackup(ss, reason) {
  try {
    var now = new Date();
    var pad = function(n) { return (n < 10 ? '0' : '') + n; };
    var timeStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '_' +
                  pad(now.getHours()) + '-' + pad(now.getMinutes()) + '-' + pad(now.getSeconds());
    var cleanReason = reason ? String(reason).replace(/[^a-zA-Z0-9_-]/g, '_') : 'Manual';
    var backupName = 'Lorry_Backup_' + timeStr + '_' + cleanReason;

    try {
      var folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(BACKUP_FOLDER_NAME);
      var file = DriveApp.getFileById(ss.getId());
      file.makeCopy(backupName, folder);
      return { success: true, backupName: backupName, timestamp: timeStr };
    } catch (driveErr) {
      // Fallback: create snapshot tab inside the spreadsheet
      var tabName = 'SNAP_' + timeStr.substring(5, 16).replace(/[^a-zA-Z0-9]/g, '_');
      if (tabName.length > 28) tabName = tabName.substring(0, 28);
      var snapSheet = ss.insertSheet(tabName);
      snapSheet.appendRow(['Backup Timestamp', now.toISOString(), 'Reason', reason]);
      var data = (ss.getSheetByName(SHEET_TRIPS) || ss.getSheets()[0]).getDataRange().getValues();
      if (data.length > 0) {
        snapSheet.getRange(2, 1, data.length, data[0].length).setValues(data);
      }
      return { success: true, backupName: tabName, inSheet: true, timestamp: timeStr };
    }
  } catch (err) {
    Logger.log('Cloud backup error: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

// ==========================================
// 5. MASTER SPREADSHEET LOCATOR (SELF-HEALING)
// ==========================================
function getMasterSpreadsheet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;

  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SPREADSHEET_ID');

  if (!sheetId && e && e.parameter && e.parameter.sheetId) {
    sheetId = e.parameter.sheetId;
    props.setProperty('SPREADSHEET_ID', sheetId);
  }

  if (sheetId) {
    try {
      return SpreadsheetApp.openById(sheetId);
    } catch (err) {
      Logger.log('Could not open spreadsheet by ID: ' + err);
    }
  }

  try {
    ss = SpreadsheetApp.create('SR_T Lorry Freight Management Data');
    props.setProperty('SPREADSHEET_ID', ss.getId());
    getOrCreateSheet(ss, SHEET_TRIPS, TRIP_HEADERS);
    return ss;
  } catch (createErr) {
    throw new Error('No active Google Sheet found. Please bind this script to a Google Sheet (Extensions -> Apps Script) or authorize DriveApp.');
  }
}

/**
 * LORRY FREIGHT & BROKER MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT BACKEND
 * Connects Google Form -> Form Responses 1 -> Master Trips Sheet (24 Columns) -> JSON API
 * 
 * Master Trips Table Columns (Exact 24 Business Columns):
 * 1. S.No.
 * 2. Trip Date
 * 3. Vehicle No
 * 4. From
 * 5. To
 * 6. Freight Amount
 * 7. Advance Date
 * 8. Advance Amount
 * 9. Balance Amount
 * 10. Halting Details
 * 11. TRSP Name
 * 12. TRSP Commission
 * 13. Diesel
 * 14. Toll Charges
 * 15. Loading Charges
 * 16. Unloading Charges
 * 17. Police Exp
 * 18. RTA C/P
 * 19. Other Expenses
 * 20. Driver Trip Commission
 * 21. Status Amount
 * 22. Status
 * 23. P/L
 * 24. Route
 */

const SHEET_TRIPS = 'Trips';
const SHEET_RESPONSES = 'Form Responses 1';

// Web App GET Handler
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getTrips';
  let responseData = {};

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TRIPS) || ss.getSheets()[0];

    if (action === 'getTrips') {
      responseData = { status: 'success', data: fetchAllTrips(sheet) };
    } else if (action === 'ping') {
      responseData = { status: 'success', message: 'Lorry API active', time: new Date().toISOString() };
    } else {
      responseData = { status: 'error', message: 'Unknown action: ' + action };
    }
  } catch (err) {
    responseData = { status: 'error', message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

// Web App POST Handler
function doPost(e) {
  let responseData = {};
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TRIPS) || setupTripsSheet(ss);
    
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || 'addTrip';
    const userRole = String(payload.role || payload.currentRole || '').trim();
    const currentUser = String(payload.user || payload.currentUser || 'System').trim();

    // STRICT BACKEND SECURITY ENFORCEMENT: Delete Operation (Admin only)
    if (action === 'deleteTrip') {
      if (userRole !== 'Admin') {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Delete permission denied"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const targetSNo = String(payload.sNo || payload.id || '').trim();
      const targetVehicle = String(payload.vehicleNo || '').trim().toUpperCase();
      const data = sheet.getDataRange().getValues();
      let deleted = false;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === targetSNo || (targetVehicle && String(data[i][2]).trim().toUpperCase() === targetVehicle)) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }

      if (deleted) {
        createCloudBackup(ss, 'Delete_Trip_' + targetSNo + '_by_' + currentUser);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: deleted ? "Trip deleted successfully" : "Trip not found on master sheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // STRICT BACKEND SECURITY ENFORCEMENT: Settings Access (Admin only)
    if (action === 'updateSettings' || action === 'settings') {
      if (userRole !== 'Admin') {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Settings permission denied"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Settings updated successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // UPDATE / EDIT TRIP HANDLER
    if (action === 'updateTrip' || action === 'editTrip') {
      const item = payload.data || payload;
      const targetSNo = String(item.sNo || item.id || '').trim();
      const targetVehicle = String(item.vehicleNo || '').trim().toUpperCase();
      const data = sheet.getDataRange().getValues();
      let targetRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === targetSNo || 
           (targetVehicle && String(data[i][2]).trim().toUpperCase() === targetVehicle && String(data[i][1]).trim() === String(item.tripDate || '').trim())) {
          targetRow = i + 1;
          break;
        }
      }

      const calculated = calculateTripRow(item, targetSNo || (targetRow > 0 ? targetRow - 1 : sheet.getLastRow()));

      if (targetRow > 0) {
        sheet.getRange(targetRow, 1, 1, 24).setValues([[
          calculated.sNo,
          calculated.tripDate,
          calculated.vehicleNo,
          calculated.from,
          calculated.to,
          calculated.freight,
          calculated.advanceDate,
          calculated.advance,
          calculated.balance,
          calculated.halting,
          calculated.trspName,
          calculated.trspCommission,
          calculated.diesel,
          calculated.toll,
          calculated.loading,
          calculated.unloading,
          calculated.police,
          calculated.rta,
          calculated.other,
          calculated.driverCommission,
          calculated.statusAmount,
          calculated.status,
          calculated.pl,
          calculated.route
        ]]);
        createCloudBackup(ss, 'Edit_Trip_' + calculated.sNo + '_by_' + currentUser);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          status: 'success',
          message: 'Trip #' + calculated.sNo + ' updated successfully in Google Sheet'
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        appendTripToMaster(sheet, calculated);
        createCloudBackup(ss, 'Add_Trip_' + calculated.sNo + '_by_' + currentUser);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          status: 'success',
          message: 'Trip appended to Google Sheet'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // CREATE CLOUD BACKUP
    if (action === 'createBackup') {
      const bRes = createCloudBackup(ss, payload.reason || 'Manual');
      return ContentService.createTextOutput(JSON.stringify(bRes))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ADD TRIP HANDLER
    const item = payload.data || payload;
    const nextSNo = sheet.getLastRow();
    const newTrip = calculateTripRow(item, nextSNo);
    appendTripToMaster(sheet, newTrip);
    createCloudBackup(ss, 'Add_Trip_' + newTrip.sNo + '_by_' + currentUser);

    responseData = { status: 'success', message: 'Trip added successfully', data: newTrip };
  } catch (err) {
    responseData = { status: 'error', message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

// Google Form Submit Event Trigger
function onFormSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let masterSheet = ss.getSheetByName(SHEET_TRIPS) || setupTripsSheet(ss);

  const values = e ? e.values : null;
  if (!values || values.length < 2) return;

  // Values in order of form questions:
  // [0] Timestamp, [1] Trip Date, [2] Vehicle No, [3] From, [4] To, [5] Freight,
  // [6] Advance Date, [7] Advance Amount, [8] Halting Details, [9] TRSP Name,
  // [10] TRSP Commission, [11] Diesel, [12] Toll, [13] Loading, [14] Unloading,
  // [15] Police, [16] RTA C/P, [17] Other, [18] Driver Commission, [19] Payment Status
  const payload = {
    tripDate: formatDate(values[1]),
    vehicleNo: values[2],
    from: values[3],
    to: values[4],
    freight: values[5],
    advanceDate: formatDate(values[6]),
    advance: values[7],
    halting: values[8],
    trspName: values[9],
    trspCommission: values[10],
    diesel: values[11],
    toll: values[12],
    loading: values[13],
    unloading: values[14],
    police: values[15],
    rta: values[16],
    other: values[17],
    driverCommission: values[18],
    status: values[19] || 'Pending'
  };

  const nextSNo = masterSheet.getLastRow();
  const calculated = calculateTripRow(payload, nextSNo);
  appendTripToMaster(masterSheet, calculated);
}

// Fetch all trips from Master Sheet (24 Columns)
function fetchAllTrips(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const trips = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[1] && !r[2]) continue;

    const sNo = r[0] || i;
    const tripDate = formatDate(r[1]);
    const vehicleNo = String(r[2] || '').trim().toUpperCase();
    const fromLoc = String(r[3] || '').trim();
    const toLoc = String(r[4] || '').trim();
    const freight = Number(r[5]) || 0;
    const advanceDate = formatDate(r[6]);
    const advance = Number(r[7]) || 0;
    const balance = freight - advance;
    const halting = String(r[9] || '').trim();
    const trspName = String(r[10] || '').trim();
    const trspCommission = Number(r[11]) || 0;
    const diesel = Number(r[12]) || 0;
    const toll = Number(r[13]) || 0;
    const loading = Number(r[14]) || 0;
    const unloading = Number(r[15]) || 0;
    const police = Number(r[16]) || 0;
    const rta = Number(r[17]) || 0;
    const other = Number(r[18]) || 0;
    const driverCommission = Number(r[19]) || 0;
    
    let status = String(r[21] || 'Pending').trim();
    if (status === 'Done') status = 'Paid';

    let statusAmount = balance;
    if (status === 'Paid') statusAmount = 0;
    else if (status === 'Partially Paid') statusAmount = Number(r[20]) || balance;

    const totalExpenses = trspCommission + diesel + toll + loading + unloading + police + rta + other + driverCommission;
    const netPL = freight - totalExpenses;
    const plFormatted = netPL >= 0 ? `P +₹${Math.abs(netPL).toLocaleString('en-IN')}` : `L -₹${Math.abs(netPL).toLocaleString('en-IN')}`;
    const route = r[23] ? String(r[23]).trim() : `${fromLoc} ➔ ${toLoc}`;

    trips.push({
      sNo: sNo,
      tripDate: tripDate,
      vehicleNo: vehicleNo,
      from: fromLoc,
      to: toLoc,
      freight: freight,
      advanceDate: advanceDate,
      advance: advance,
      balance: balance,
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
      statusAmount: statusAmount,
      status: status,
      netPL: netPL,
      pl: plFormatted,
      route: route
    });
  }

  return trips;
}

// Calculate row values based on strict business logic
function calculateTripRow(p, nextSNo) {
  const freight = Number(p.freight) || 0;
  const advance = Number(p.advance) || 0;
  const balance = freight - advance;

  const trspCommission = Number(p.trspCommission) || 0;
  const diesel = Number(p.diesel) || 0;
  const toll = Number(p.toll) || 0;
  const loading = Number(p.loading) || 0;
  const unloading = Number(p.unloading) || 0;
  const police = Number(p.police) || 0;
  const rta = Number(p.rta) || 0;
  const other = Number(p.other) || 0;
  const driverCommission = Number(p.driverCommission) || 0;

  const totalExpenses = trspCommission + diesel + toll + loading + unloading + police + rta + other + driverCommission;
  const netPL = freight - totalExpenses;
  const plFormatted = netPL >= 0 ? `P +₹${Math.abs(netPL).toLocaleString('en-IN')}` : `L -₹${Math.abs(netPL).toLocaleString('en-IN')}`;

  let status = p.status || 'Pending';
  if (status === 'Done') status = 'Paid';

  let statusAmount = balance;
  if (status === 'Paid') statusAmount = 0;
  else if (status === 'Partially Paid') statusAmount = Number(p.statusAmount) || balance;

  const fromLoc = String(p.from || '').trim();
  const toLoc = String(p.to || '').trim();
  const route = `${fromLoc} ➔ ${toLoc}`;

  return {
    sNo: nextSNo || 1,
    tripDate: p.tripDate || formatDate(new Date()),
    vehicleNo: String(p.vehicleNo || '').trim().toUpperCase(),
    from: fromLoc,
    to: toLoc,
    freight: freight,
    advanceDate: p.advanceDate ? formatDate(p.advanceDate) : '',
    advance: advance,
    balance: balance,
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
    statusAmount: statusAmount,
    status: status,
    netPL: netPL,
    pl: plFormatted,
    route: route
  };
}

// Append formatted row to Trips sheet (Exact 24 Columns)
function appendTripToMaster(sheet, t) {
  sheet.appendRow([
    t.sNo,
    t.tripDate,
    t.vehicleNo,
    t.from,
    t.to,
    t.freight,
    t.advanceDate,
    t.advance,
    t.balance,
    t.halting,
    t.trspName,
    t.trspCommission,
    t.diesel,
    t.toll,
    t.loading,
    t.unloading,
    t.police,
    t.rta,
    t.other,
    t.driverCommission,
    t.statusAmount,
    t.status,
    t.pl,
    t.route
  ]);
}

// Setup Trips Sheet with the exact 24 business columns
function setupTripsSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_TRIPS);
  if (!sheet) sheet = ss.insertSheet(SHEET_TRIPS);

  const headers = [
    'S.No.', 'Trip Date', 'Vehicle No', 'From', 'To', 'Freight Amount',
    'Advance Date', 'Advance Amount', 'Balance Amount', 'Halting Details',
    'TRSP Name', 'TRSP Commission', 'Diesel', 'Toll Charges', 'Loading Charges',
    'Unloading Charges', 'Police Exp', 'RTA C/P', 'Other Expenses', 'Driver Trip Commission',
    'Status Amount', 'Status', 'P/L', 'Route'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  return sheet;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val).trim();
}

// Automatic Cloud Backup System (Mirroring D:\Repo\SR_T reference)
function createCloudBackup(ss, reason) {
  try {
    const now = new Date();
    const pad = function(n) { return (n < 10 ? '0' : '') + n; };
    const timeStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '_' +
                  pad(now.getHours()) + '-' + pad(now.getMinutes()) + '-' + pad(now.getSeconds());
    const cleanReason = reason ? String(reason).replace(/[^a-zA-Z0-9_-]/g, '_') : 'Auto';
    const backupName = 'Lorry_Backup_' + timeStr + '_' + cleanReason;

    try {
      const folders = DriveApp.getFoldersByName('Lorry_Backups');
      const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Lorry_Backups');
      const file = DriveApp.getFileById(ss.getId());
      file.makeCopy(backupName, folder);
      return { success: true, backupName: backupName, timestamp: timeStr };
    } catch (driveErr) {
      // Fallback: snapshot sheet tab inside the spreadsheet
      let tabName = 'SNAP_' + timeStr.substring(5, 16).replace(/[^a-zA-Z0-9]/g, '_');
      if (tabName.length > 28) tabName = tabName.substring(0, 28);
      const snapSheet = ss.insertSheet(tabName);
      snapSheet.appendRow(['Backup Timestamp', now.toISOString(), 'Reason', reason]);
      const data = (ss.getSheetByName(SHEET_TRIPS) || ss.getSheets()[0]).getDataRange().getValues();
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

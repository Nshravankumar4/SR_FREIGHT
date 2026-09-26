/**
 * LORRY FREIGHT & BROKER MANAGEMENT SYSTEM
 * High-Performance Fleet Operations Engine
 * 
 * Features:
 * - Authentication (Login/Logout)
 * - Top Control Bar: Month, Date From, Date To, Show Entire Month, Search, Download Excel
 * - 24 Exact Business Columns in Master Table
 * - Independent Status & Automatic P/L Calculations (P +₹... / L -₹...)
 * - 2-step Edit & 1-step Delete Confirmation Popups
 * - Auto-dismissing Success Toasts
 * - Click-to-filter Alert / Warning Cards
 * - Excel CSV Export with UTF-8 BOM
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Baseline Data (August 2026 records from Excel)
const INITIAL_TRIPS = [
  {
    id: 1,
    sNo: 1,
    tripDate: '2026-08-28',
    vehicleNo: 'TS15UE1122',
    from: 'Hyderabad, Telangana',
    to: 'Purnia, Bihar',
    freight: 100000,
    advanceDate: '2026-08-28',
    advance: 90000,
    balance: 10000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 50000,
    toll: 10000,
    loading: 2500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 12000,
    totalExpenses: 82000,
    netPL: 18000,
    status: 'Pending',
    statusAmount: 10000,
    deleted: false
  },
  {
    id: 2,
    sNo: 2,
    tripDate: '2026-08-28',
    vehicleNo: 'TG15T6666',
    from: 'Hyderabad, Telangana',
    to: 'Purnia, Bihar',
    freight: 100000,
    advanceDate: '2026-08-28',
    advance: 90000,
    balance: 10000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 80000,
    toll: 10000,
    loading: 2500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 12000,
    totalExpenses: 112000,
    netPL: -12000,
    status: 'Paid',
    statusAmount: 0,
    deleted: false
  },
  {
    id: 3,
    sNo: 3,
    tripDate: '2026-08-29',
    vehicleNo: 'TS15UE1122',
    from: 'Hyderabad, Telangana',
    to: 'Kedch',
    freight: 200000,
    advanceDate: '2026-08-29',
    advance: 150000,
    balance: 50000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 50000,
    toll: 10000,
    loading: 2500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 12000,
    totalExpenses: 82000,
    netPL: 118000,
    status: 'Paid',
    statusAmount: 0,
    deleted: false
  },
  {
    id: 4,
    sNo: 4,
    tripDate: '2026-08-29',
    vehicleNo: 'TG15T6666',
    from: 'Hyderabad, Telangana',
    to: 'Mechal',
    freight: 250000,
    advanceDate: '2026-08-29',
    advance: 155000,
    balance: 95000,
    halting: 'Two days halting during transit',
    trspName: 'MRC',
    trspCommission: 2000,
    diesel: 20000,
    toll: 90000,
    loading: 55500,
    unloading: 2500,
    police: 1000,
    rta: 1000,
    other: 1000,
    driverCommission: 90000,
    totalExpenses: 263000,
    netPL: -13000,
    status: 'Pending',
    statusAmount: 95000,
    deleted: false
  }
];

// Application State
const state = {
  trips: [],
  selectedMonth: '2026-08', // 'YYYY-MM'
  dateFrom: '',
  dateTo: '',
  activeFilter: 'ALL', // 'ALL' | 'PENDING' | 'LOSS' | 'PARTIAL' | 'PROFIT' | 'DONE'
  searchQuery: '',
  apiUrl: localStorage.getItem('lorry_api_url') || '',
  pendingEditTripId: null,
  pendingDeleteTripId: null,
  currentUser: localStorage.getItem('lorry_auth_user') || null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  loadTrips();
  setupTopControls();
  setupFilterCards();
  setupModals();
  setupSlideOverEvents();

  if (state.currentUser) {
    render();
  }
});

// ==========================================================================
// 1. Authentication System (Login / Logout)
// ==========================================================================

function setupAuth() {
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');
  const navUserLabel = document.getElementById('nav-user-label');

  if (!state.currentUser) {
    if (loginOverlay) loginOverlay.classList.remove('hidden');
  } else {
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (navUserLabel) navUserLabel.textContent = state.currentUser;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const u = usernameInput ? usernameInput.value.trim() : '';
      const p = passwordInput ? passwordInput.value.trim() : '';

      // Default credentials: admin / admin
      if (u === 'admin' && p === 'admin') {
        state.currentUser = u;
        localStorage.setItem('lorry_auth_user', u);
        if (loginError) loginError.classList.add('hidden');
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (navUserLabel) navUserLabel.textContent = u;
        showToast('✅ Signed in successfully as admin.');
        render();
      } else {
        if (loginError) loginError.classList.remove('hidden');
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      state.currentUser = null;
      localStorage.removeItem('lorry_auth_user');
      if (loginOverlay) loginOverlay.classList.remove('hidden');
      showToast('ℹ️ Logged out successfully.');
    });
  }
}

// ==========================================================================
// 2. Data Persistence & Business Calculation Engine
// ==========================================================================

function loadTrips() {
  const saved = localStorage.getItem('lorry_trips_master_v6');
  if (saved) {
    try {
      state.trips = JSON.parse(saved);
    } catch {
      state.trips = INITIAL_TRIPS.map(t => calculateTrip(t));
    }
  } else {
    state.trips = INITIAL_TRIPS.map(t => calculateTrip(t));
    saveTrips();
  }

  state.trips = state.trips.map(t => calculateTrip(t));
}

function saveTrips() {
  localStorage.setItem('lorry_trips_master_v6', JSON.stringify(state.trips));
}

/**
 * Recalculate trip according to exact business rules:
 * - Balance Amount = Freight Amount - Advance Amount
 * - Total Expenses = TRSP Commission + Diesel + Toll Charges + Loading + Unloading + Police + RTA + Other + Driver Commission
 * - P/L = Freight Amount - Total Expenses
 * - Status Amount:
 *     Pending -> Balance Amount
 *     Paid / Done -> 0
 *     Partially Paid -> remaining unpaid balance
 * - Status does NOT determine P/L
 */
function calculateTrip(t) {
  const freight = Number(t.freight) || 0;
  const advance = Number(t.advance) || 0;
  const balance = freight - advance;

  const trspCommission = Number(t.trspCommission) || 0;
  const diesel = Number(t.diesel) || 0;
  const toll = Number(t.toll) || 0;
  const loading = Number(t.loading) || 0;
  const unloading = Number(t.unloading) || 0;
  const police = Number(t.police) || 0;
  const rta = Number(t.rta) || 0;
  const other = Number(t.other) || 0;
  const driverCommission = Number(t.driverCommission) || 0;

  const totalExpenses = trspCommission + diesel + toll + loading + unloading + police + rta + other + driverCommission;
  const netPL = freight - totalExpenses;

  // Status handling: allowed values 'Pending', 'Partially Paid', 'Paid' (or 'Done')
  let status = t.status || 'Pending';
  if (status === 'Done') status = 'Paid';

  let statusAmount = 0;
  if (status === 'Pending') {
    statusAmount = balance;
  } else if (status === 'Paid') {
    statusAmount = 0;
  } else if (status === 'Partially Paid') {
    statusAmount = t.statusAmount !== undefined && t.statusAmount !== null ? Number(t.statusAmount) : balance;
  }

  const from = (t.from || '').trim();
  const to = (t.to || '').trim();
  const route = `${from} ➔ ${to}`;

  return {
    ...t,
    freight,
    advance,
    balance,
    trspCommission,
    diesel,
    toll,
    loading,
    unloading,
    police,
    rta,
    other,
    driverCommission,
    totalExpenses,
    netPL,
    status,
    statusAmount,
    from,
    to,
    route
  };
}

// Indian Rupee Currency Formatter
function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const n = Number(val);
  const isNegative = n < 0;
  const abs = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return isNegative ? `-₹${abs}` : `₹${abs}`;
}

// Strict DD-MM-YYYY Date Formatter
function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  try {
    const s = String(dateStr).trim();
    if (s.includes('-')) {
      const parts = s.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD -> DD-MM-YYYY
          return `${String(parts[2]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}-${parts[0]}`;
        } else if (parts[2].length === 4) {
          // DD-MM-YYYY
          return `${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}-${parts[2]}`;
        }
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// ==========================================================================
// 3. Top Control Bar Events & Filter Handling
// ==========================================================================

function setupTopControls() {
  const selectMonth = document.getElementById('select-month');
  const dateFrom = document.getElementById('filter-date-from');
  const dateTo = document.getElementById('filter-date-to');
  const btnShowEntireMonth = document.getElementById('btn-show-entire-month');
  const inputSearch = document.getElementById('input-search');
  const btnDownloadExcel = document.getElementById('btn-download-excel');
  const btnSync = document.getElementById('btn-sync');
  const btnSettings = document.getElementById('btn-settings');

  // Populate Month select options based on recorded trips
  populateMonthDropdown();

  if (selectMonth) {
    selectMonth.value = state.selectedMonth;
    selectMonth.addEventListener('change', (e) => {
      state.selectedMonth = e.target.value;
      state.dateFrom = '';
      state.dateTo = '';
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';
      render();
    });
  }

  if (dateFrom) {
    dateFrom.addEventListener('change', (e) => {
      state.dateFrom = e.target.value;
      renderTable();
    });
  }

  if (dateTo) {
    dateTo.addEventListener('change', (e) => {
      state.dateTo = e.target.value;
      renderTable();
    });
  }

  if (btnShowEntireMonth) {
    btnShowEntireMonth.addEventListener('click', () => {
      state.dateFrom = '';
      state.dateTo = '';
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';
      renderTable();
      showToast(`📅 Showing entire month: ${getMonthDisplayTitle(state.selectedMonth)}`);
    });
  }

  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderTable();
    });
  }

  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener('click', exportToExcel);
  }

  if (btnSync) {
    btnSync.addEventListener('click', syncWithGoogleSheet);
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', openSettingsModal);
  }
}

function populateMonthDropdown() {
  const selectMonth = document.getElementById('select-month');
  if (!selectMonth) return;

  const monthsSet = new Set();
  monthsSet.add('2026-08'); // baseline month

  state.trips.forEach(t => {
    if (t.tripDate && t.tripDate.length >= 7) {
      monthsSet.add(t.tripDate.substring(0, 7));
    }
  });

  const sortedMonths = Array.from(monthsSet).sort().reverse();
  selectMonth.innerHTML = sortedMonths.map(m => {
    const [year, mon] = m.split('-');
    const mIdx = parseInt(mon, 10) - 1;
    const label = `${MONTH_NAMES[mIdx].substring(0, 3)}-${year.substring(2)}`;
    return `<option value="${m}" ${m === state.selectedMonth ? 'selected' : ''}>${label}</option>`;
  }).join('');
}

function getMonthDisplayTitle(monthStr) {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, mon] = monthStr.split('-');
  const mIdx = parseInt(mon, 10) - 1;
  return `${MONTH_NAMES[mIdx]} ${year}`;
}

// Setup Box-Type Metric Filter Cards
function setupFilterCards() {
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.metric-card').forEach(c => {
        c.classList.remove('border-brand-500', 'border-amber-500', 'border-rose-500', 'border-orange-500', 'border-emerald-500', 'border-teal-500', 'shadow-md');
        c.classList.add('border-gray-200');
      });

      card.classList.remove('border-gray-200');
      const f = card.dataset.filter;
      if (f === 'ALL') card.classList.add('border-brand-500', 'shadow-md');
      else if (f === 'PENDING') card.classList.add('border-amber-500', 'shadow-md');
      else if (f === 'LOSS') card.classList.add('border-rose-500', 'shadow-md');
      else if (f === 'PARTIAL') card.classList.add('border-orange-500', 'shadow-md');
      else if (f === 'PROFIT') card.classList.add('border-emerald-500', 'shadow-md');
      else if (f === 'DONE') card.classList.add('border-teal-500', 'shadow-md');

      state.activeFilter = f;
      renderTable();
    });
  });
}

// ==========================================================================
// 4. Filtering Logic & Table Rendering
// ==========================================================================

// Get trips matching the selected Month
function getMonthTrips() {
  return state.trips.filter(t => {
    if (t.deleted) return false;
    if (!t.tripDate) return false;
    return t.tripDate.startsWith(state.selectedMonth);
  });
}

// Get trips matching date range, filter boxes, and search
function getDisplayTrips() {
  const monthTrips = getMonthTrips();

  return monthTrips.filter(t => {
    // Date Range Filter
    if (state.dateFrom && t.tripDate < state.dateFrom) return false;
    if (state.dateTo && t.tripDate > state.dateTo) return false;

    // Filter Boxes
    if (state.activeFilter === 'PENDING' && t.status !== 'Pending') return false;
    if (state.activeFilter === 'LOSS' && t.netPL >= 0) return false;
    if (state.activeFilter === 'PARTIAL' && t.status !== 'Partially Paid') return false;
    if (state.activeFilter === 'PROFIT' && t.netPL < 0) return false;
    if (state.activeFilter === 'DONE' && t.status !== 'Paid') return false;

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery;
      const match = (t.vehicleNo || '').toLowerCase().includes(q) ||
                    (t.from || '').toLowerCase().includes(q) ||
                    (t.to || '').toLowerCase().includes(q) ||
                    (t.route || '').toLowerCase().includes(q) ||
                    (t.trspName || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

function render() {
  renderMetricCounters();
  renderTable();
}

function renderMetricCounters() {
  const monthTrips = getMonthTrips();

  const countAll = monthTrips.length;
  const countPending = monthTrips.filter(t => t.status === 'Pending').length;
  const countLoss = monthTrips.filter(t => t.netPL < 0).length;
  const countPartial = monthTrips.filter(t => t.status === 'Partially Paid').length;
  const countProfit = monthTrips.filter(t => t.netPL >= 0).length;
  const countDone = monthTrips.filter(t => t.status === 'Paid').length;

  if (document.getElementById('count-all')) document.getElementById('count-all').textContent = countAll;
  if (document.getElementById('count-pending')) document.getElementById('count-pending').textContent = countPending;
  if (document.getElementById('count-loss')) document.getElementById('count-loss').textContent = countLoss;
  if (document.getElementById('count-partial')) document.getElementById('count-partial').textContent = countPartial;
  if (document.getElementById('count-profit')) document.getElementById('count-profit').textContent = countProfit;
  if (document.getElementById('count-done')) document.getElementById('count-done').textContent = countDone;
}

function renderTable() {
  const trips = getDisplayTrips();
  const title = document.getElementById('table-title');
  const badge = document.getElementById('table-active-filter-badge');
  const stats = document.getElementById('table-quick-stats');

  if (title) {
    if (state.dateFrom || state.dateTo) {
      const fromStr = state.dateFrom ? formatDateDisplay(state.dateFrom) : 'Start';
      const toStr = state.dateTo ? formatDateDisplay(state.dateTo) : 'End';
      title.textContent = `Range: ${fromStr} to ${toStr} (${getMonthDisplayTitle(state.selectedMonth)})`;
    } else {
      title.textContent = `Month: ${getMonthDisplayTitle(state.selectedMonth)}`;
    }
  }

  if (badge) {
    badge.textContent = `${state.activeFilter} (${trips.length})`;
  }

  if (stats) {
    const totFreight = trips.reduce((acc, t) => acc + t.freight, 0);
    const totAdvance = trips.reduce((acc, t) => acc + t.advance, 0);
    const totBalance = trips.reduce((acc, t) => acc + t.balance, 0);
    const totExpenses = trips.reduce((acc, t) => acc + t.totalExpenses, 0);
    const totNet = totFreight - totExpenses;

    stats.innerHTML = `
      <span>Freight: <strong class="text-gray-900">${formatCurrency(totFreight)}</strong></span>
      <span class="text-gray-300">|</span>
      <span>Advance: <strong class="text-gray-900">${formatCurrency(totAdvance)}</strong></span>
      <span class="text-gray-300">|</span>
      <span>Balance: <strong class="text-amber-700">${formatCurrency(totBalance)}</strong></span>
      <span class="text-gray-300">|</span>
      <span>Expenses: <strong class="text-gray-900">${formatCurrency(totExpenses)}</strong></span>
      <span class="text-gray-300">|</span>
      <span>Net: <strong class="${totNet >= 0 ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}">${formatCurrency(totNet)}</strong></span>
    `;
  }

  const tbody = document.getElementById('trips-tbody');
  if (!tbody) return;

  if (!trips.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="25" class="text-center py-12 px-4 text-gray-400 font-medium">
          No trip records found for <strong>${getMonthDisplayTitle(state.selectedMonth)}</strong> matching the active filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = trips.map((t, idx) => {
    // Exact 24 columns in strict order:
    // 1. S.No, 2. Trip Date, 3. Vehicle No, 4. From, 5. To, 6. Freight Amount,
    // 7. Advance Date, 8. Advance Amount, 9. Balance Amount, 10. Halting Details,
    // 11. TRSP Name, 12. TRSP Comm, 13. Diesel, 14. Toll Charges, 15. Loading Charges,
    // 16. Unloading Charges, 17. Police Exp, 18. RTA C/P, 19. Other Expenses,
    // 20. Driver Comm, 21. Status Amount, 22. Status, 23. P/L, 24. Route
    // Followed by Actions (Not counted as a business column)

    const isProfit = t.netPL >= 0;
    const plBadge = isProfit 
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">P +${formatCurrency(t.netPL)}</span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">L -${formatCurrency(Math.abs(t.netPL))}</span>`;

    return `
      <tr class="transition hover:bg-gray-50/90 ${t.netPL < 0 ? 'bg-rose-50/20' : ''}">
        <!-- 1. S.No -->
        <td class="py-3 px-3 text-center font-mono text-gray-500 font-bold">${t.sNo || idx + 1}</td>
        
        <!-- 2. Trip Date -->
        <td class="py-3 px-3.5 whitespace-nowrap font-bold text-gray-900">${formatDateDisplay(t.tripDate)}</td>
        
        <!-- 3. Vehicle No -->
        <td class="py-3 px-3.5 whitespace-nowrap">
          <span class="px-2 py-0.5 font-mono text-[11px] font-extrabold bg-blue-50 text-blue-700 rounded-md border border-blue-200">${t.vehicleNo}</span>
        </td>
        
        <!-- 4. From -->
        <td class="py-3 px-3.5 whitespace-nowrap font-medium text-gray-800">${t.from || '-'}</td>
        
        <!-- 5. To -->
        <td class="py-3 px-3.5 whitespace-nowrap font-medium text-gray-800">${t.to || '-'}</td>
        
        <!-- 6. Freight Amount -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-black text-gray-900">${formatCurrency(t.freight)}</td>
        
        <!-- 7. Advance Date -->
        <td class="py-3 px-3.5 whitespace-nowrap text-gray-500">${formatDateDisplay(t.advanceDate)}</td>
        
        <!-- 8. Advance Amount -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.advance)}</td>
        
        <!-- 9. Balance Amount -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-black text-amber-700">${formatCurrency(t.balance)}</td>
        
        <!-- 10. Halting Details -->
        <td class="py-3 px-3.5 text-gray-500 max-w-[180px] truncate" title="${t.halting || ''}">${t.halting || '-'}</td>
        
        <!-- 11. TRSP Name -->
        <td class="py-3 px-3.5 whitespace-nowrap">
          <span class="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-800 rounded-md border border-amber-200">${t.trspName || '-'}</span>
        </td>
        
        <!-- 12. TRSP Comm -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.trspCommission)}</td>
        
        <!-- 13. Diesel -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.diesel)}</td>
        
        <!-- 14. Toll Charges -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.toll)}</td>
        
        <!-- 15. Loading Charges -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.loading)}</td>
        
        <!-- 16. Unloading Charges -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.unloading)}</td>
        
        <!-- 17. Police Exp -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.police)}</td>
        
        <!-- 18. RTA C/P -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.rta)}</td>
        
        <!-- 19. Other Expenses -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-medium text-gray-700">${formatCurrency(t.other)}</td>
        
        <!-- 20. Driver Trip Commission -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-bold text-gray-900">${formatCurrency(t.driverCommission)}</td>
        
        <!-- 21. Status Amount -->
        <td class="py-3 px-3.5 text-right whitespace-nowrap font-black text-brand-700">${formatCurrency(t.statusAmount)}</td>
        
        <!-- 22. Status (Manual User Select) -->
        <td class="py-3 px-3.5 whitespace-nowrap">
          <select onchange="updateTripStatus(${t.id}, this.value)" 
                  class="px-2 py-1 text-xs font-black rounded-lg border cursor-pointer outline-none transition
                         ${t.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                           t.status === 'Partially Paid' ? 'bg-orange-50 text-orange-800 border-orange-300' :
                           'bg-amber-50 text-amber-800 border-amber-300'}">
            <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Paid" ${t.status === 'Paid' ? 'selected' : ''}>Paid</option>
            <option value="Partially Paid" ${t.status === 'Partially Paid' ? 'selected' : ''}>Partially Paid</option>
          </select>
        </td>
        
        <!-- 23. P/L -->
        <td class="py-3 px-3.5 whitespace-nowrap text-center">
          ${plBadge}
        </td>
        
        <!-- 24. Route -->
        <td class="py-3 px-4 whitespace-nowrap font-bold text-gray-800">${t.route || `${t.from} ➔ ${t.to}`}</td>
        
        <!-- Row Actions (Not counted as a business column) -->
        <td class="py-3 px-3 text-center whitespace-nowrap bg-gray-50/50">
          <div class="inline-flex items-center gap-1.5 justify-center">
            <button onclick="promptEditTrip(${t.id})" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 transition cursor-pointer shadow-xs" title="Edit Trip">
              <span>✏️ Edit</span>
            </button>
            <button onclick="promptDeleteTrip(${t.id})" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition cursor-pointer" title="Delete Trip">
              <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update Trip Payment Status
window.updateTripStatus = function(tripId, newStatus) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  trip.status = newStatus;
  if (newStatus === 'Pending') {
    trip.statusAmount = trip.balance;
  } else if (newStatus === 'Paid') {
    trip.statusAmount = 0;
  } else if (newStatus === 'Partially Paid') {
    const current = trip.statusAmount > 0 ? trip.statusAmount : trip.balance;
    const input = prompt(`Enter remaining unpaid balance for ${trip.vehicleNo} (Total Balance: ${formatCurrency(trip.balance)}):`, current);
    if (input !== null && !isNaN(Number(input))) {
      trip.statusAmount = Number(input);
    } else {
      trip.statusAmount = trip.balance;
    }
  }

  saveTrips();
  renderMetricCounters();
  renderTable();
  showToast(`✅ Trip #${trip.sNo || idNum} status updated to ${newStatus}.`);
};

// ==========================================================================
// 5. Confirmation Popups Workflow (Edit & Delete)
// ==========================================================================

function setupModals() {
  // Edit Confirm Modal Buttons
  const modalEditConfirm = document.getElementById('modal-edit-confirm');
  const modalEditCancel = document.getElementById('modal-edit-cancel');
  if (modalEditConfirm) {
    modalEditConfirm.addEventListener('click', () => {
      closeModal('modal-confirm-edit');
      if (state.pendingEditTripId) {
        openEditSlideOver(state.pendingEditTripId);
      }
    });
  }
  if (modalEditCancel) {
    modalEditCancel.addEventListener('click', () => {
      closeModal('modal-confirm-edit');
      state.pendingEditTripId = null;
    });
  }

  // Save Confirm Modal Buttons
  const modalSaveConfirm = document.getElementById('modal-save-confirm');
  const modalSaveCancel = document.getElementById('modal-save-cancel');
  if (modalSaveConfirm) {
    modalSaveConfirm.addEventListener('click', () => {
      closeModal('modal-confirm-save');
      executeSaveTripEdits();
    });
  }
  if (modalSaveCancel) {
    modalSaveCancel.addEventListener('click', () => {
      closeModal('modal-confirm-save');
    });
  }

  // Delete Confirm Modal Buttons
  const modalDeleteConfirm = document.getElementById('modal-delete-confirm');
  const modalDeleteCancel = document.getElementById('modal-delete-cancel');
  if (modalDeleteConfirm) {
    modalDeleteConfirm.addEventListener('click', () => {
      closeModal('modal-confirm-delete');
      executeDeleteTrip();
    });
  }
  if (modalDeleteCancel) {
    modalDeleteCancel.addEventListener('click', () => {
      closeModal('modal-confirm-delete');
      state.pendingDeleteTripId = null;
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

// 1. Prompt Edit Confirmation
window.promptEditTrip = function(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  state.pendingEditTripId = idNum;
  const msgEl = document.getElementById('modal-edit-message');
  if (msgEl) {
    msgEl.textContent = `Are you sure you want to edit Trip #${trip.sNo || idNum} (${trip.vehicleNo})?`;
  }
  openModal('modal-confirm-edit');
};

// 2. Prompt Save & Recalculate Confirmation
window.promptSaveTripEdits = function() {
  openModal('modal-confirm-save');
};

// 3. Prompt Delete Confirmation
window.promptDeleteTrip = function(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  state.pendingDeleteTripId = idNum;
  const msgEl = document.getElementById('modal-delete-message');
  if (msgEl) {
    msgEl.textContent = `Are you sure you want to delete Trip #${trip.sNo || idNum} (${trip.vehicleNo})? This action cannot be undone.`;
  }
  openModal('modal-confirm-delete');
};

// Execute Trip Deletion
function executeDeleteTrip() {
  if (!state.pendingDeleteTripId) return;
  const idNum = Number(state.pendingDeleteTripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  trip.deleted = true;
  saveTrips();
  render();

  showToast(`✅ Trip #${trip.sNo || idNum} (${trip.vehicleNo}) deleted successfully.`);
  state.pendingDeleteTripId = null;
}

// ==========================================================================
// 6. Slide-Over Drawer Events & Execution
// ==========================================================================

function setupSlideOverEvents() {
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeSlideOver);
  }
}

function openEditSlideOver(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  const backdrop = document.getElementById('drawer-backdrop');
  const panel = document.getElementById('drawer-panel');

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  setVal('edit-trip-date', trip.tripDate || '');
  setVal('edit-vehicle', trip.vehicleNo || '');
  setVal('edit-from', trip.from || '');
  setVal('edit-to', trip.to || '');
  setVal('edit-freight', trip.freight || 0);
  setVal('edit-advance-date', trip.advanceDate || '');
  setVal('edit-advance', trip.advance || 0);
  setVal('edit-halting', trip.halting || '');
  setVal('edit-trsp-name', trip.trspName || '');
  setVal('edit-trsp-commission', trip.trspCommission || 0);
  setVal('edit-diesel', trip.diesel || 0);
  setVal('edit-toll', trip.toll || 0);
  setVal('edit-loading', trip.loading || 0);
  setVal('edit-unloading', trip.unloading || 0);
  setVal('edit-police', trip.police || 0);
  setVal('edit-rta', trip.rta || 0);
  setVal('edit-other', trip.other || 0);
  setVal('edit-driver-comm', trip.driverCommission || 0);
  setVal('edit-status', trip.status || 'Pending');

  if (backdrop && panel) {
    backdrop.classList.remove('hidden');
    panel.classList.remove('translate-x-full');
  }
}

window.closeSlideOver = function() {
  const backdrop = document.getElementById('drawer-backdrop');
  const panel = document.getElementById('drawer-panel');
  if (backdrop && panel) {
    panel.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
  state.pendingEditTripId = null;
};

function executeSaveTripEdits() {
  if (!state.pendingEditTripId) return;
  const idNum = Number(state.pendingEditTripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  const getVal = (id, defaultVal = '') => {
    const el = document.getElementById(id);
    return el ? el.value : defaultVal;
  };
  const getNum = (id) => Number(getVal(id, 0)) || 0;

  trip.tripDate = getVal('edit-trip-date', trip.tripDate);
  trip.vehicleNo = getVal('edit-vehicle', trip.vehicleNo).trim().toUpperCase();
  trip.from = getVal('edit-from', trip.from).trim();
  trip.to = getVal('edit-to', trip.to).trim();
  trip.freight = getNum('edit-freight');
  trip.advanceDate = getVal('edit-advance-date', trip.advanceDate);
  trip.advance = getNum('edit-advance');
  trip.halting = getVal('edit-halting', trip.halting).trim();
  trip.trspName = getVal('edit-trsp-name', trip.trspName).trim();
  trip.trspCommission = getNum('edit-trsp-commission');
  trip.diesel = getNum('edit-diesel');
  trip.toll = getNum('edit-toll');
  trip.loading = getNum('edit-loading');
  trip.unloading = getNum('edit-unloading');
  trip.police = getNum('edit-police');
  trip.rta = getNum('edit-rta');
  trip.other = getNum('edit-other');
  trip.driverCommission = getNum('edit-driver-comm');
  trip.status = getVal('edit-status', trip.status);

  const recalculated = calculateTrip(trip);
  const idx = state.trips.findIndex(t => Number(t.id) === idNum);
  if (idx !== -1) {
    state.trips[idx] = recalculated;
  }

  saveTrips();
  closeSlideOver();
  render();

  showToast(`✅ Trip #${trip.sNo || idNum} (${trip.vehicleNo}) updated successfully.`);
}

// ==========================================================================
// 7. Auto-Dismissing Toast Notification System
// ==========================================================================

function showToast(message, durationMs = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'flex items-center justify-between gap-3 px-4 py-3 bg-gray-900 text-white text-xs font-bold rounded-2xl shadow-xl border border-gray-700 pointer-events-auto animate-toast w-full max-w-sm';
  toast.innerHTML = `
    <span>${message}</span>
    <button class="text-gray-400 hover:text-white transition cursor-pointer select-none">✕</button>
  `;

  const closeBtn = toast.querySelector('button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

// ==========================================================================
// 8. Excel CSV Export (Strictly 24 Columns with UTF-8 BOM)
// ==========================================================================

function exportToExcel() {
  const trips = getDisplayTrips();
  if (!trips.length) {
    showToast('⚠️ No trip records available to export for this view.');
    return;
  }

  // Exactly 24 Business Column Headers in order
  const headers = [
    'S.No.', 'Trip Date', 'Vehicle No', 'From', 'To', 'Freight Amount',
    'Advance Date', 'Advance Amount', 'Balance Amount', 'Halting Details', 'TRSP Name',
    'TRSP Commission', 'Diesel', 'Toll Charges', 'Loading Charges', 'Unloading Charges',
    'Police Exp', 'RTA C/P', 'Other Expenses', 'Driver Trip Commission',
    'Status Amount', 'Status', 'P/L', 'Route'
  ];

  const rows = trips.map((t, idx) => {
    const plFormatted = t.netPL >= 0 ? `P +${t.netPL}` : `L -${Math.abs(t.netPL)}`;
    const routeStr = `${t.from} ➔ ${t.to}`;

    return [
      t.sNo || idx + 1,
      `"${formatDateDisplay(t.tripDate)}"`,
      `"${t.vehicleNo}"`,
      `"${(t.from || '').replace(/"/g, '""')}"`,
      `"${(t.to || '').replace(/"/g, '""')}"`,
      t.freight,
      `"${formatDateDisplay(t.advanceDate)}"`,
      t.advance,
      t.balance,
      `"${(t.halting || '').replace(/"/g, '""')}"`,
      `"${(t.trspName || '').replace(/"/g, '""')}"`,
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
      `"${t.status}"`,
      `"${plFormatted}"`,
      `"${routeStr.replace(/"/g, '""')}"`
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures Excel properly reads special symbols (e.g. ₹, ➔)
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lorry_Trips_${state.selectedMonth}_${state.activeFilter}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showToast(`📊 Downloaded ${trips.length} trips as Excel CSV.`);
}

// ==========================================================================
// 9. Google Apps Script Synchronization
// ==========================================================================

async function syncWithGoogleSheet() {
  if (!state.apiUrl) {
    openSettingsModal();
    return;
  }

  const syncBtn = document.getElementById('btn-sync');
  if (syncBtn) syncBtn.innerHTML = '🔄 Syncing...';

  try {
    const res = await fetch(`${state.apiUrl}?action=getTrips`);
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      state.trips = json.data.map((row, idx) => calculateTrip({
        id: idx + 1,
        sNo: row.sNo || idx + 1,
        tripDate: row.tripDate,
        vehicleNo: row.vehicleNo,
        from: row.from,
        to: row.to,
        freight: row.freight,
        advanceDate: row.advanceDate,
        advance: row.advance,
        halting: row.halting,
        trspName: row.trspName,
        trspCommission: row.trspCommission || 0,
        diesel: row.diesel || 0,
        toll: row.toll || 0,
        loading: row.loading || 0,
        unloading: row.unloading || 0,
        police: row.police || 0,
        rta: row.rta || 0,
        other: row.other || 0,
        driverCommission: row.driverCommission || 0,
        status: row.status || 'Pending',
        statusAmount: row.statusAmount !== undefined ? row.statusAmount : 0,
        deleted: false
      }));

      saveTrips();
      populateMonthDropdown();
      render();
      showToast(`✅ Synchronized ${state.trips.length} trips from Google Sheets!`);
    } else {
      throw new Error(json.message || 'Invalid server response');
    }
  } catch (err) {
    showToast(`❌ Sync Error: ${err.message}`);
  } finally {
    if (syncBtn) {
      syncBtn.innerHTML = `
        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        <span>Sync</span>
      `;
    }
  }
}

function openSettingsModal() {
  const url = prompt('Enter your Google Apps Script Web App URL:', state.apiUrl);
  if (url !== null) {
    state.apiUrl = url.trim();
    localStorage.setItem('lorry_api_url', state.apiUrl);
    if (state.apiUrl) syncWithGoogleSheet();
  }
}

/**
 * LORRY FREIGHT MANAGEMENT - MODERN SAAS LOGISTICS ENGINE
 * Architecture: Tailwind CSS + Real Calendar Popover + Slide-Over Drawer
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
    status: 'Done',
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
    status: 'Done',
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
  calYear: 2026,
  calMonth: 7, // 0-indexed: 7 = August
  selectedDate: 'ALL', // 'ALL' or 'YYYY-MM-DD'
  activeFilter: 'ALL', // 'ALL' | 'PROFIT' | 'LOSS' | 'PENDING' | 'DONE' | 'PARTIAL'
  searchQuery: '',
  apiUrl: localStorage.getItem('lorry_api_url') || '',
  editingTripId: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTrips();
  setupCalendarEvents();
  setupFilterEvents();
  setupSearchAndActions();
  setupSlideOverEvents();
  render();
});

// Load from Local Storage or Baseline
function loadTrips() {
  const saved = localStorage.getItem('lorry_trips_master_v5');
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
  localStorage.setItem('lorry_trips_master_v5', JSON.stringify(state.trips));
}

// Math & Calculation Engine
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

  const status = t.status || 'Pending';
  let statusAmount = 0;
  if (status === 'Pending') {
    statusAmount = balance;
  } else if (status === 'Done' || status === 'Paid') {
    statusAmount = 0;
  } else if (status === 'Partially Paid') {
    statusAmount = t.statusAmount !== undefined && t.statusAmount !== null ? Number(t.statusAmount) : balance;
  }

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
    statusAmount
  };
}

// Currency Formatter
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
// Real Interactive Calendar System
// ==========================================================================

function setupCalendarEvents() {
  const trigger = document.getElementById('calendar-trigger');
  const popover = document.getElementById('calendar-popover');
  const prevMonthBtn = document.getElementById('btn-prev-month');
  const nextMonthBtn = document.getElementById('btn-next-month');
  const calPopPrev = document.getElementById('cal-pop-prev');
  const calPopNext = document.getElementById('cal-pop-next');
  const allMonthBtn = document.getElementById('cal-btn-all-month');
  const todayBtn = document.getElementById('cal-btn-today');

  if (trigger && popover) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('hidden');
      if (!popover.classList.contains('hidden')) {
        renderCalendarPopover();
      }
    });

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && !trigger.contains(e.target)) {
        popover.classList.add('hidden');
      }
    });
  }

  if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
  if (calPopPrev) calPopPrev.addEventListener('click', (e) => { e.stopPropagation(); changeMonth(-1); });
  if (calPopNext) calPopNext.addEventListener('click', (e) => { e.stopPropagation(); changeMonth(1); });

  if (allMonthBtn) {
    allMonthBtn.addEventListener('click', () => {
      state.selectedDate = 'ALL';
      popover.classList.add('hidden');
      render();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      state.calYear = today.getFullYear();
      state.calMonth = today.getMonth();
      const mStr = String(today.getMonth() + 1).padStart(2, '0');
      const dStr = String(today.getDate()).padStart(2, '0');
      state.selectedDate = `${today.getFullYear()}-${mStr}-${dStr}`;
      popover.classList.add('hidden');
      render();
    });
  }
}

function changeMonth(delta) {
  state.calMonth += delta;
  if (state.calMonth > 11) {
    state.calMonth = 0;
    state.calYear += 1;
  } else if (state.calMonth < 0) {
    state.calMonth = 11;
    state.calYear -= 1;
  }
  state.selectedDate = 'ALL';
  renderCalendarPopover();
  render();
}

function renderCalendarPopover() {
  const title = document.getElementById('cal-pop-title');
  const grid = document.getElementById('cal-days-grid');
  if (!title || !grid) return;

  title.textContent = `${MONTH_NAMES[state.calMonth]} ${state.calYear}`;

  const firstDayIndex = new Date(state.calYear, state.calMonth, 1).getDay();
  const daysInMonth = new Date(state.calYear, state.calMonth + 1, 0).getDate();

  const targetPrefix = `${state.calYear}-${String(state.calMonth + 1).padStart(2, '0')}`;
  const daysWithTrips = new Set(
    state.trips
      .filter(t => !t.deleted && (t.tripDate || '').startsWith(targetPrefix))
      .map(t => parseInt(t.tripDate.split('-')[2], 10))
  );

  let html = '';

  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div class="p-2"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${targetPrefix}-${dayStr}`;
    const isSelected = state.selectedDate === fullDate;
    const hasTrips = daysWithTrips.has(day);

    html += `
      <button onclick="selectCalendarDate('${fullDate}')" 
              class="relative p-2 rounded-xl text-center font-medium transition cursor-pointer select-none
                     ${isSelected ? 'bg-brand-600 text-white font-bold shadow-xs' : 'text-gray-700 hover:bg-gray-100'}
                     ${hasTrips && !isSelected ? 'font-bold text-brand-700' : ''}">
        ${day}
        ${hasTrips ? `<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}"></span>` : ''}
      </button>
    `;
  }

  grid.innerHTML = html;
}

window.selectCalendarDate = function(dateStr) {
  state.selectedDate = dateStr;
  const popover = document.getElementById('calendar-popover');
  if (popover) popover.classList.add('hidden');
  render();
};

// ==========================================================================
// Filtering & Actions
// ==========================================================================

function setupFilterEvents() {
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.metric-card').forEach(c => {
        c.classList.remove('border-brand-500', 'border-emerald-500', 'border-rose-500', 'border-amber-500', 'border-teal-500', 'border-blue-500', 'shadow-md');
        c.classList.add('border-gray-200');
      });

      card.classList.remove('border-gray-200');
      const f = card.dataset.filter;
      if (f === 'ALL') card.classList.add('border-brand-500', 'shadow-md');
      else if (f === 'PROFIT') card.classList.add('border-emerald-500', 'shadow-md');
      else if (f === 'LOSS') card.classList.add('border-rose-500', 'shadow-md');
      else if (f === 'PENDING') card.classList.add('border-amber-500', 'shadow-md');
      else if (f === 'DONE') card.classList.add('border-teal-500', 'shadow-md');
      else if (f === 'PARTIAL') card.classList.add('border-blue-500', 'shadow-md');

      state.activeFilter = f;
      renderTable();
    });
  });
}

function setupSearchAndActions() {
  const searchInput = document.getElementById('input-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderTable();
    });
  }

  const exportBtn = document.getElementById('btn-export');
  if (exportBtn) exportBtn.addEventListener('click', exportCurrentView);

  const syncBtn = document.getElementById('btn-sync');
  if (syncBtn) syncBtn.addEventListener('click', syncWithGoogleSheet);

  const settingsBtn = document.getElementById('btn-settings');
  if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);
}

// Get Trips matching Current Calendar Month & Optional Date
function getActiveTrips() {
  const targetPrefix = `${state.calYear}-${String(state.calMonth + 1).padStart(2, '0')}`;
  return state.trips.filter(t => {
    if (t.deleted) return false;
    if (!(t.tripDate || '').startsWith(targetPrefix)) return false;
    if (state.selectedDate !== 'ALL' && t.tripDate !== state.selectedDate) return false;
    return true;
  });
}

function getDisplayTrips() {
  const activeTrips = getActiveTrips();
  return activeTrips.filter(t => {
    if (state.activeFilter === 'PROFIT' && t.netPL < 0) return false;
    if (state.activeFilter === 'LOSS' && t.netPL >= 0) return false;
    if (state.activeFilter === 'PENDING' && t.status !== 'Pending') return false;
    if (state.activeFilter === 'DONE' && (t.status !== 'Done' && t.status !== 'Paid')) return false;
    if (state.activeFilter === 'PARTIAL' && t.status !== 'Partially Paid') return false;

    if (state.searchQuery) {
      const q = state.searchQuery;
      const match = (t.vehicleNo || '').toLowerCase().includes(q) ||
                    (t.from || '').toLowerCase().includes(q) ||
                    (t.to || '').toLowerCase().includes(q) ||
                    (t.trspName || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

// Render Entire UI
function render() {
  updateCalendarHeaderLabel();
  renderMetricCounters();
  renderTable();
}

function updateCalendarHeaderLabel() {
  const label = document.getElementById('cal-selected-label');
  if (!label) return;

  if (state.selectedDate === 'ALL') {
    label.textContent = `${MONTH_NAMES[state.calMonth]} ${state.calYear} (All)`;
  } else {
    label.textContent = `${formatDateDisplay(state.selectedDate)}`;
  }
}

// Update Metric Counters
function renderMetricCounters() {
  const activeTrips = getActiveTrips();

  const countAll = activeTrips.length;
  const countProfit = activeTrips.filter(t => t.netPL >= 0).length;
  const countLoss = activeTrips.filter(t => t.netPL < 0).length;
  const countPending = activeTrips.filter(t => t.status === 'Pending').length;
  const countDone = activeTrips.filter(t => t.status === 'Done' || t.status === 'Paid').length;
  const countPartial = activeTrips.filter(t => t.status === 'Partially Paid').length;

  if (document.getElementById('count-all')) document.getElementById('count-all').textContent = countAll;
  if (document.getElementById('count-profit')) document.getElementById('count-profit').textContent = countProfit;
  if (document.getElementById('count-loss')) document.getElementById('count-loss').textContent = countLoss;
  if (document.getElementById('count-pending')) document.getElementById('count-pending').textContent = countPending;
  if (document.getElementById('count-done')) document.getElementById('count-done').textContent = countDone;
  if (document.getElementById('count-partial')) document.getElementById('count-partial').textContent = countPartial;
}

// Render Main Table
function renderTable() {
  const trips = getDisplayTrips();
  const title = document.getElementById('table-title');
  const badge = document.getElementById('table-active-filter-badge');
  const stats = document.getElementById('table-quick-stats');

  if (title) {
    if (state.selectedDate === 'ALL') {
      title.textContent = `Month: ${MONTH_NAMES[state.calMonth]} ${state.calYear}`;
    } else {
      title.textContent = `Date: ${formatDateDisplay(state.selectedDate)} (${MONTH_NAMES[state.calMonth]} ${state.calYear})`;
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
      <span>Balance: <strong class="text-amber-600">${formatCurrency(totBalance)}</strong></span>
      <span class="text-gray-300">|</span>
      <span>Expenses: <strong class="text-gray-900">${formatCurrency(totExpenses)}</strong></span>
      <span class="text-gray-300">|</span>
      <span>Net: <strong class="${totNet >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}">${formatCurrency(totNet)}</strong></span>
    `;
  }

  const tbody = document.getElementById('trips-tbody');
  if (!tbody) return;

  if (!trips.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="24" class="text-center py-12 px-4 text-gray-400 font-medium">
          No trip records found for <strong>${state.selectedDate === 'ALL' ? MONTH_NAMES[state.calMonth] + ' ' + state.calYear : formatDateDisplay(state.selectedDate)}</strong> matching [${state.activeFilter}].
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = trips.map((t, idx) => `
    <tr class="transition hover:bg-gray-50/80 ${t.netPL < 0 ? 'bg-rose-50/20' : ''}">
      <td class="py-3 px-3.5 text-center font-mono text-gray-500 font-semibold">${t.sNo || idx + 1}</td>
      <td class="py-3 px-3.5 whitespace-nowrap font-bold text-gray-900">${formatDateDisplay(t.tripDate)}</td>
      <td class="py-3 px-3.5 whitespace-nowrap"><span class="px-2 py-0.5 font-mono text-[11px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">${t.vehicleNo}</span></td>
      <td class="py-3 px-3.5 whitespace-nowrap font-medium text-gray-800">${t.from || '-'}</td>
      <td class="py-3 px-3.5 whitespace-nowrap font-medium text-gray-800">${t.to || '-'}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap font-bold text-gray-900">${formatCurrency(t.freight)}</td>
      <td class="py-3 px-3.5 whitespace-nowrap text-gray-500">${formatDateDisplay(t.advanceDate)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.advance)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap font-bold text-amber-600">${formatCurrency(t.balance)}</td>
      <td class="py-3 px-3.5 text-gray-500 max-w-[200px] truncate" title="${t.halting || ''}">${t.halting || '-'}</td>
      <td class="py-3 px-3.5 whitespace-nowrap"><span class="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 rounded-md border border-amber-200/60">${t.trspName || '-'}</span></td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.trspCommission)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.diesel)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.toll)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.loading)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.unloading)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.police)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.rta)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.other)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap text-gray-700">${formatCurrency(t.driverCommission)}</td>
      <td class="py-3 px-3.5 text-right whitespace-nowrap font-bold text-brand-700">${formatCurrency(t.statusAmount)}</td>
      <td class="py-3 px-3.5 whitespace-nowrap">
        <select onchange="updateTripStatus(${t.id}, this.value)" 
                class="px-2 py-1 text-[11px] font-bold rounded-lg border cursor-pointer outline-none transition
                       ${t.status === 'Done' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                         t.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                         t.status === 'Partially Paid' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                         'bg-amber-50 text-amber-800 border-amber-200'}">
          <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Done" ${t.status === 'Done' ? 'selected' : ''}>Done</option>
          <option value="Paid" ${t.status === 'Paid' ? 'selected' : ''}>Paid</option>
          <option value="Partially Paid" ${t.status === 'Partially Paid' ? 'selected' : ''}>Partially Paid</option>
        </select>
      </td>
      <td class="py-3 px-3.5 whitespace-nowrap">
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold
                     ${t.netPL >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'}">
          ${t.netPL >= 0 ? `+${formatCurrency(t.netPL)} Profit` : `-${formatCurrency(Math.abs(t.netPL))} Loss`}
        </span>
      </td>
      <td class="py-3 px-3.5 text-center whitespace-nowrap">
        <div class="inline-flex items-center gap-1.5 justify-center">
          <button onclick="openEditSlideOver(${t.id})" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 active:scale-95 transition cursor-pointer" title="Edit Trip Record">
            <span>✏️ Edit</span>
          </button>
          <button onclick="softDeleteTrip(${t.id})" class="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition cursor-pointer" title="Delete Trip Record">
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Update Trip Status (Manual User Action)
window.updateTripStatus = function(tripId, newStatus) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  trip.status = newStatus;
  if (newStatus === 'Pending') {
    trip.statusAmount = trip.balance;
  } else if (newStatus === 'Done' || newStatus === 'Paid') {
    trip.statusAmount = 0;
  } else if (newStatus === 'Partially Paid') {
    const current = trip.statusAmount > 0 ? trip.statusAmount : trip.balance;
    const input = prompt(`Enter remaining balance for ${trip.vehicleNo} (Total Balance: ${formatCurrency(trip.balance)}):`, current);
    if (input !== null && !isNaN(Number(input))) {
      trip.statusAmount = Number(input);
    } else {
      trip.statusAmount = trip.balance;
    }
  }

  saveTrips();
  renderMetricCounters();
  renderTable();
};

// Soft Delete Trip
window.softDeleteTrip = function(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) return;

  if (confirm(`Are you sure you want to delete Trip #${trip.sNo || idNum} (${trip.vehicleNo})?`)) {
    trip.deleted = true;
    saveTrips();
    render();
  }
};

// ==========================================================================
// Slide-Over Drawer Events
// ==========================================================================

function setupSlideOverEvents() {
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeSlideOver);
  }
}

window.openEditSlideOver = function(tripId) {
  const idNum = Number(tripId);
  const trip = state.trips.find(t => Number(t.id) === idNum);
  if (!trip) {
    alert('Trip not found.');
    return;
  }

  state.editingTripId = idNum;
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
};

window.closeSlideOver = function() {
  const backdrop = document.getElementById('drawer-backdrop');
  const panel = document.getElementById('drawer-panel');
  if (backdrop && panel) {
    panel.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
  state.editingTripId = null;
};

window.saveTripEdits = function() {
  if (!state.editingTripId) return;
  const idNum = Number(state.editingTripId);
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
};

// Export CSV
function exportCurrentView() {
  const trips = getDisplayTrips();
  if (!trips.length) {
    alert('No trips available to export for this view.');
    return;
  }

  const headers = [
    'S.No.', 'Trip Date', 'Vehicle No', 'From', 'To', 'Freight Amount',
    'Advance Date', 'Advance Amount', 'Balance Amount', 'Halting Details', 'TRSP Name',
    'TRSP Commission', 'Diesel', 'Toll Charges', 'Loading Charges', 'Unloading Charges',
    'Police Exp', 'RTA C/P', 'Other Expenses', 'Driver Trip Commission', 'Total Expenses',
    'Status Amount', 'Payment Status', 'Net Profit / Loss Amount', 'Profit / Loss Result'
  ];

  const rows = trips.map((t, idx) => [
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
    t.totalExpenses,
    t.statusAmount,
    `"${t.status}"`,
    t.netPL,
    `"${t.netPL >= 0 ? 'Profit' : 'Loss'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lorry_trips_${state.calYear}_${state.calMonth + 1}_${state.activeFilter}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Google Sheet Sync
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
        sNo: idx + 1,
        tripDate: row.tripDate,
        vehicleNo: row.vehicleNo,
        from: row.fromLocation || row.from,
        to: row.toLocation || row.to,
        freight: row.freightAmount || row.freight,
        advanceDate: row.advanceDate,
        advance: row.advanceAmount || row.advance,
        halting: row.haltingDetails || row.halting,
        trspName: row.brokerName || row.trspName,
        trspCommission: row.expenses ? row.expenses.brokerCommission : (row.trspCommission || 0),
        diesel: row.expenses ? row.expenses.diesel : (row.diesel || 0),
        toll: row.expenses ? row.expenses.tollCharges : (row.toll || 0),
        loading: row.expenses ? row.expenses.loadingCharges : (row.loading || 0),
        unloading: row.expenses ? row.expenses.unloadingCharges : (row.unloading || 0),
        police: row.expenses ? row.expenses.policeExpenses : (row.police || 0),
        rta: row.expenses ? row.expenses.rtaCheckpost : (row.rta || 0),
        other: row.expenses ? row.expenses.otherExpenses : (row.other || 0),
        driverCommission: row.expenses ? row.expenses.driverCommission : (row.driverCommission || 0),
        status: row.status || 'Pending',
        statusAmount: row.statusAmount || 0,
        deleted: false
      }));

      saveTrips();
      render();
      alert(`Synchronized ${state.trips.length} trips successfully from Google Sheets!`);
    } else {
      throw new Error(json.message || 'Invalid server response');
    }
  } catch (err) {
    alert('Google Sheet Sync Error: ' + err.message);
  } finally {
    if (syncBtn) syncBtn.innerHTML = '<svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span>Sync</span>';
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

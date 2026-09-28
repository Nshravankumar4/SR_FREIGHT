/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - PROFESSIONAL EXCEL-STYLE VIEW & EXPORT
 * Version: 2.4.2
 */

const ExcelView = {
  getTodayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  getMonthOptionsHTML() {
    const months = [
      { val: '2026-08', label: 'August 2026' },
      { val: '2026-09', label: 'September 2026' },
      { val: '2026-10', label: 'October 2026' },
      { val: '2026-11', label: 'November 2026' },
      { val: '2026-12', label: 'December 2026' },
      { val: '2026-07', label: 'July 2026' },
      { val: '2026-06', label: 'June 2026' },
      { val: '2026-05', label: 'May 2026' },
      { val: '2026-04', label: 'April 2026' }
    ];
    const current = appState.filters.selectedMonth || '2026-08';
    return months.map(m => `<option value="${m.val}" ${m.val === current ? 'selected' : ''}>${m.label}</option>`).join('');
  },

  setScope(scope) {
    appState.filters.viewType = scope;

    const btnMap = {
      TODAY: 'excel-btn-today',
      SELECTED_DATE: 'excel-btn-selected-date',
      DATE_RANGE: 'excel-btn-date-range',
      ENTIRE_MONTH: 'excel-btn-entire-month',
      ALL_TRIPS: 'excel-btn-all-trips'
    };

    document.querySelectorAll('.excel-scope-btn').forEach(btn => {
      btn.className = 'excel-scope-btn px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer';
    });

    const activeBtn = document.getElementById(btnMap[scope]);
    if (activeBtn) {
      activeBtn.className = 'excel-scope-btn px-3 py-2 text-xs font-black rounded-xl bg-blue-600 text-white shadow-xs border border-blue-600 cursor-pointer';
    }

    this.renderScopeInputs();
    this.render();
  },

  renderScopeInputs() {
    const container = document.getElementById('excel-dynamic-scope-inputs');
    const tagEl = document.getElementById('excel-active-scope-tag');
    if (!container) return;

    const viewType = appState.filters.viewType || 'ALL_TRIPS';

    if (viewType === 'TODAY') {
      const today = this.getTodayISO();
      if (tagEl) tagEl.textContent = `TODAY (${Utils.formatDisplayDate(today)})`;
      container.innerHTML = `
        <div class="flex items-center gap-2 py-1">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Target Dispatch Date:</span>
          <span class="px-2.5 py-1 font-mono text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700">${Utils.formatDisplayDate(today)}</span>
        </div>
      `;
    } else if (viewType === 'SELECTED_DATE') {
      if (tagEl) tagEl.textContent = `SELECTED: ${Utils.formatDisplayDate(appState.filters.selectedDate || '2026-08-28')}`;
      container.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <label for="excel-input-date" class="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Dispatch Date:</label>
          <input type="date" id="excel-input-date" value="${appState.filters.selectedDate || '2026-08-28'}" class="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
          <button onclick="ExcelView.applySelectedDate()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer">APPLY</button>
        </div>
      `;
    } else if (viewType === 'DATE_RANGE') {
      if (tagEl) tagEl.textContent = `RANGE: ${Utils.formatDisplayDate(appState.filters.dateFrom)} ➔ ${Utils.formatDisplayDate(appState.filters.dateTo)}`;
      container.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <div class="flex items-center gap-2">
            <label for="excel-date-from" class="text-xs font-bold text-slate-700 dark:text-slate-300">From:</label>
            <input type="date" id="excel-date-from" value="${appState.filters.dateFrom || '2026-08-28'}" class="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
          </div>
          <div class="flex items-center gap-2">
            <label for="excel-date-to" class="text-xs font-bold text-slate-700 dark:text-slate-300">To:</label>
            <input type="date" id="excel-date-to" value="${appState.filters.dateTo || '2026-08-29'}" class="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
          </div>
          <button onclick="ExcelView.applyDateRange()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer">APPLY RANGE</button>
        </div>
      `;
    } else if (viewType === 'ENTIRE_MONTH') {
      if (tagEl) tagEl.textContent = `MONTH: ${appState.filters.selectedMonth || '2026-08'}`;
      container.innerHTML = `
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <label for="excel-month-select" class="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Operational Month:</label>
          <select id="excel-month-select" class="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
            ${this.getMonthOptionsHTML()}
          </select>
          <button onclick="ExcelView.applyEntireMonth()" class="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer">APPLY MONTH</button>
        </div>
      `;
    } else {
      if (tagEl) tagEl.textContent = 'ALL FLEET TRIPS';
      container.innerHTML = `
        <div class="text-[11px] text-slate-400 font-medium py-1">
          Exporting all historical fleet trip records for current vehicle.
        </div>
      `;
    }
  },

  applySelectedDate() {
    const input = document.getElementById('excel-input-date');
    if (input && input.value) {
      appState.filters.selectedDate = input.value;
      this.renderScopeInputs();
      this.render();
      Utils.showToast(`Showing Excel records for ${Utils.formatDisplayDate(input.value)}`);
    }
  },

  applyDateRange() {
    const f = document.getElementById('excel-date-from');
    const t = document.getElementById('excel-date-to');
    if (f && t && f.value && t.value) {
      if (f.value > t.value) {
        alert("From date cannot be after To date.");
        return;
      }
      appState.filters.dateFrom = f.value;
      appState.filters.dateTo = t.value;
      this.renderScopeInputs();
      this.render();
      Utils.showToast(`Showing range: ${Utils.formatDisplayDate(f.value)} to ${Utils.formatDisplayDate(t.value)}`);
    }
  },

  applyEntireMonth() {
    const s = document.getElementById('excel-month-select');
    if (s && s.value) {
      appState.filters.selectedMonth = s.value;
      this.renderScopeInputs();
      this.render();
      Utils.showToast(`Showing month ${s.value}`);
    }
  },

  /**
   * Main Excel View Render
   */
  render() {
    const vNo = appState.currentVehicle;
    if (!vNo) {
      Router.navigate('vehicles');
      return;
    }

    // Vehicle header badge
    const vBadge = document.getElementById('excel-vehicle-badge');
    if (vBadge) vBadge.textContent = `Vehicle: ${vNo}`;

    // Scope controls
    const scopeContainer = document.getElementById('excel-dynamic-scope-inputs');
    if (scopeContainer && !scopeContainer.innerHTML.trim()) {
      this.renderScopeInputs();
    }

    // Single source of truth for filtered trips: vehicle + date scope
    const trips = VehicleWorkspace.getFilteredTrips({ includeStatus: false, includeSearch: false });

    // Aggregations for Export Preview Card
    let totalFreight = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    let totalBalance = 0;

    trips.forEach(t => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      totalFreight += calc.freight;
      totalExpenses += calc.totalExpenses;
      totalProfit += calc.profitLoss;
      totalBalance += calc.remainingBalance;
    });

    // Update Export Preview Card
    const previewVehicle = document.getElementById('excel-preview-vehicle-range');
    if (previewVehicle) {
      const viewType = appState.filters.viewType || 'ALL_TRIPS';
      let scopeDesc = 'All Historical Records';
      if (viewType === 'TODAY') scopeDesc = `Today (${Utils.formatDisplayDate(this.getTodayISO())})`;
      else if (viewType === 'SELECTED_DATE') scopeDesc = Utils.formatDisplayDate(appState.filters.selectedDate);
      else if (viewType === 'DATE_RANGE') scopeDesc = `${Utils.formatDisplayDate(appState.filters.dateFrom)} to ${Utils.formatDisplayDate(appState.filters.dateTo)}`;
      else if (viewType === 'ENTIRE_MONTH') scopeDesc = `Month: ${appState.filters.selectedMonth}`;

      previewVehicle.textContent = `${vNo} • ${scopeDesc}`;
    }

    const setPreview = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setPreview('excel-preview-trips', trips.length);
    setPreview('excel-preview-freight', Utils.displayCurrency(totalFreight));
    setPreview('excel-preview-expenses', Utils.displayCurrency(totalExpenses));
    setPreview('excel-preview-profit', `${totalProfit >= 0 ? '+' : ''}${Utils.displayCurrency(totalProfit)}`);
    setPreview('excel-preview-balance', Utils.displayCurrency(totalBalance));

    // Dynamic Download Button Label
    const downloadLabel = document.getElementById('excel-download-label');
    if (downloadLabel) {
      downloadLabel.textContent = `Download ${trips.length} Trips (.XLSX)`;
    }

    // Render Table Grid
    const tbody = document.getElementById('excel-table-body');
    if (!tbody) return;

    if (trips.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="23" class="py-8 text-center text-slate-400">
            No records found for ${vNo} in selected date scope.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = trips.map((t, idx) => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      const isCleared = calc.remainingBalance === 0;

      const expVal = (raw, calcVal) => (raw === '' || raw === null || raw === undefined) ? '—' : Utils.displayNumber(calcVal);

      return `
        <tr class="border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-2 px-2.5 text-center font-bold">${t.sNo || (idx + 1)}</td>
          <td class="py-2 px-2.5 whitespace-nowrap">${Utils.displayDate(t.tripDate)}</td>
          <td class="py-2 px-2.5 font-bold">${t.vehicleNo}</td>
          <td class="py-2 px-2.5 whitespace-nowrap">${Utils.displayText(t.from)}</td>
          <td class="py-2 px-2.5 whitespace-nowrap">${Utils.displayText(t.to)}</td>
          <td class="py-2 px-2.5 text-right font-bold">${Utils.displayNumber(calc.freight)}</td>
          <td class="py-2 px-2.5 text-right">${(t.advanceAmount === '' || t.advanceAmount === null || t.advanceAmount === undefined) ? '—' : Utils.displayNumber(calc.advance)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.diesel, calc.diesel)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.tollCharges !== undefined ? t.tollCharges : t.toll, calc.toll)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.rtaExp !== undefined ? t.rtaExp : t.rta, calc.rta)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.policeExp !== undefined ? t.policeExp : t.police, calc.police)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.loadingCharges !== undefined ? t.loadingCharges : t.loading, calc.loading)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.unloadingCharges !== undefined ? t.unloadingCharges : t.unloading, calc.unloading)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.driverExp, calc.driverExp)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.trspCommission, calc.trspCommission)}</td>
          <td class="py-2 px-2.5 text-right">${expVal(t.otherExpenses, calc.otherExpenses)}</td>
          <td class="py-2 px-2.5 text-right font-bold text-amber-600">${Utils.displayNumber(calc.totalExpenses)}</td>
          <td class="py-2 px-2.5 text-right font-bold ${calc.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
            ${calc.profitLoss >= 0 ? '+' : ''}${Utils.displayNumber(calc.profitLoss)}
          </td>
          <td class="py-2 px-2.5 text-right font-semibold">${Utils.displayNumber(calc.originalBalance)}</td>
          <td class="py-2 px-2.5 text-right font-bold text-emerald-600">${Utils.displayNumber(calc.totalReceived)}</td>
          <td class="py-2 px-2.5 text-right font-black ${isCleared ? 'text-emerald-600' : 'text-rose-600'}">
            ${Utils.displayNumber(calc.remainingBalance)}
          </td>
          <td class="py-2 px-2.5 text-center font-bold ${isCleared ? 'text-emerald-600' : 'text-rose-600'}">
            ${isCleared ? 'CLEARED' : 'PENDING'}
          </td>
          <td class="py-2 px-2.5 text-center uppercase">${calc.tripStatus}</td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Generate clear, unambiguous vehicle-scoped filenames
   */
  generateFilename(extension = 'xlsx') {
    const vNo = appState.currentVehicle || 'FLEET';
    const viewType = appState.filters.viewType || 'ALL_TRIPS';
    const today = this.getTodayISO();

    if (viewType === 'TODAY') {
      return `${vNo}_Trips_Today_${today}.${extension}`;
    } else if (viewType === 'SELECTED_DATE') {
      const d = appState.filters.selectedDate || today;
      return `${vNo}_Trips_${d}.${extension}`;
    } else if (viewType === 'DATE_RANGE') {
      const from = appState.filters.dateFrom || 'start';
      const to = appState.filters.dateTo || today;
      return `${vNo}_Trips_${from}_to_${to}.${extension}`;
    } else if (viewType === 'ENTIRE_MONTH') {
      const m = appState.filters.selectedMonth || 'month';
      return `${vNo}_Trips_${m}.${extension}`;
    }
    return `${vNo}_Trips_ALL_${today}.${extension}`;
  },

  /**
   * Export the current vehicle's records to CSV
   */
  exportCsv() {
    const vNo = appState.currentVehicle;
    if (!vNo) return;

    const trips = VehicleWorkspace.getFilteredTrips({ includeStatus: false, includeSearch: false });
    if (trips.length === 0) {
      alert(`No records to export for ${vNo} in selected date scope.`);
      return;
    }

    const headers = [
      'S.No', 'Trip Date', 'Vehicle No', 'From', 'To', 'Freight Amount', 'Advance Amount',
      'Diesel', 'Toll Charges', 'RTA C/P', 'Police Exp', 'Loading Charges', 'Unloading Charges',
      'Driver Trip Expense', 'TRSP Commission', 'Other Expenses', 'Other Expense Notes',
      'Total Expenses', 'Profit/Loss', 'Original Balance', 'Total Received', 'Remaining Balance',
      'Payment Status', 'Trip Status'
    ];

    const rows = trips.map((t, idx) => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      return [
        t.sNo || (idx + 1),
        Utils.formatDisplayDate(t.tripDate),
        t.vehicleNo,
        `"${(t.from || '').replace(/"/g, '""')}"`,
        `"${(t.to || '').replace(/"/g, '""')}"`,
        calc.freight,
        calc.advance,
        calc.diesel,
        calc.toll,
        calc.rta,
        calc.police,
        calc.loading,
        calc.unloading,
        calc.driverExp,
        calc.trspCommission,
        calc.otherExpenses,
        `"${(t.otherExpenseNotes || '').replace(/"/g, '""')}"`,
        calc.totalExpenses,
        calc.profitLoss,
        calc.originalBalance,
        calc.totalReceived,
        calc.remainingBalance,
        calc.remainingBalance === 0 ? 'CLEARED' : 'PENDING',
        calc.tripStatus
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", this.generateFilename('csv'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Export records to true styled Excel (.xlsx) workbook using ExcelJS
   */
  async exportToExcel() {
    const vNo = appState.currentVehicle;
    if (!vNo) return;

    const trips = VehicleWorkspace.getFilteredTrips({ includeStatus: false, includeSearch: false });

    if (!trips.length) {
      Utils.showToast(`⚠️ No trip records available to export for ${vNo} in selected scope.`);
      return;
    }

    if (typeof ExcelJS === 'undefined') {
      Utils.showToast('ℹ️ ExcelJS library not detected. Falling back to CSV export...');
      this.exportCsv();
      return;
    }

    Utils.showToast(`⏳ Generating Excel file for ${trips.length} trips...`);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SR_T Freight Management System';
      workbook.lastModifiedBy = 'SR_T Fleet Engine';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(`Trips - ${vNo}`, {
        views: [{ showGridLines: true }]
      });

      const headers = [
        '1. S.No.', '2. Trip Date', '3. Vehicle No', '4. From', '5. To', '6. Freight Amount',
        '7. Advance Date', '8. Advance Amount', '9. Halting Details', '10. TRSP Name',
        '11. TRSP Commission', '12. Diesel', '13. Toll Charges', '14. Loading Charges', '15. Unloading Charges',
        '16. Police Exp', '17. RTA C/P', '18. Other Expenses', '19. Driver Trip Commission',
        '20. Sum OF Total Exp', '21. Total Exp Given', '22. Status', '23. P/L', '24. Date of Balance Recd',
        '25. Balance Amount'
      ];

      worksheet.columns = headers.map(h => ({ header: h, key: h, width: 16 }));

      // Header Row Styling: Professional Deep Navy Blue
      const headerRow = worksheet.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF334155' } },
          bottom: { style: 'medium', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF334155' } },
          right: { style: 'thin', color: { argb: 'FF334155' } }
        };
      });

      // Data Rows
      trips.forEach((t, idx) => {
        const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
        const isProfit = calc.profitLoss >= 0;
        const plFormatted = isProfit 
          ? `P +₹${calc.profitLoss.toLocaleString('en-IN')}` 
          : `L -₹${Math.abs(calc.profitLoss).toLocaleString('en-IN')}`;

        const lastReceipt = Array.isArray(t.balanceReceipts) && t.balanceReceipts.length > 0
          ? t.balanceReceipts[t.balanceReceipts.length - 1]
          : null;
        const balanceRecdDate = lastReceipt ? (lastReceipt.receivedDate || lastReceipt.date) : (t.balanceReceivedDate || '-');

        const rowValues = [
          t.sNo || idx + 1,
          Utils.formatDisplayDate(t.tripDate),
          t.vehicleNo,
          t.from || '',
          t.to || '',
          calc.freight,
          Utils.formatDisplayDate(t.advanceDate),
          calc.advance,
          t.haltingDetails || t.halting || '',
          t.trspName || '',
          calc.trspCommission,
          calc.diesel,
          calc.toll,
          calc.loading,
          calc.unloading,
          calc.police,
          calc.rta,
          calc.otherExpenses,
          calc.driverExp,
          calc.totalExpenses,
          calc.advance + calc.totalExpenses,
          calc.tripStatus,
          plFormatted,
          Utils.formatDisplayDate(balanceRecdDate),
          calc.remainingBalance
        ];

        const row = worksheet.addRow(rowValues);
        row.height = 22;

        // Alternate Row Striping
        if (idx % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' }
            };
          });
        }
      });

      // Export file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = this.generateFilename('xlsx');

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      Utils.showToast(`✅ Downloaded: ${filename}`);
    } catch (err) {
      console.error("Export Excel error:", err);
      Utils.showToast("❌ Failed to generate Excel workbook. Falling back to CSV...", "error");
      this.exportCsv();
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExcelView;
}

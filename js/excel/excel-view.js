/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - READ-ONLY EXCEL-STYLE VIEW
 * Version: 2.4.2
 */

const ExcelView = {
  render() {
    const vNo = appState.currentVehicle;
    if (!vNo) {
      Router.navigate('vehicles');
      return;
    }

    const titleEl = document.getElementById('excel-view-title');
    if (titleEl) {
      titleEl.textContent = `📊 Read-Only Excel Ledger: ${vNo}`;
    }

    const tbody = document.getElementById('excel-table-body');
    if (!tbody) return;

    const trips = VehicleWorkspace.getActiveTrips();

    if (trips.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="23" class="py-8 text-center text-slate-400">
            No records found for ${vNo}.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = trips.map((t, idx) => {
      const calc = FinancialEngine.calculateTrip(t, t.balanceReceipts || []);
      const isCleared = calc.remainingBalance === 0;

      return `
        <tr class="border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-2 px-2.5 text-center font-bold">${t.sNo || (idx + 1)}</td>
          <td class="py-2 px-2.5 whitespace-nowrap">${Utils.formatDisplayDate(t.tripDate)}</td>
          <td class="py-2 px-2.5 font-bold">${t.vehicleNo}</td>
          <td class="py-2 px-2.5 whitespace-nowrap">${t.from || '-'}</td>
          <td class="py-2 px-2.5 whitespace-nowrap">${t.to || '-'}</td>
          <td class="py-2 px-2.5 text-right font-bold">${calc.freight.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.advance.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.diesel.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.toll.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.rta.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.police.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.loading.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.unloading.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.driverExp.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.trspCommission.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right">${calc.otherExpenses.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right font-bold text-amber-600">${calc.totalExpenses.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right font-bold ${calc.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
            ${calc.profitLoss >= 0 ? '+' : ''}${calc.profitLoss.toLocaleString('en-IN')}
          </td>
          <td class="py-2 px-2.5 text-right font-semibold">${calc.originalBalance.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right font-bold text-emerald-600">${calc.totalReceived.toLocaleString('en-IN')}</td>
          <td class="py-2 px-2.5 text-right font-black ${isCleared ? 'text-emerald-600' : 'text-rose-600'}">
            ${calc.remainingBalance.toLocaleString('en-IN')}
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
   * Export the current vehicle's records to CSV
   */
  exportCsv() {
    const vNo = appState.currentVehicle;
    if (!vNo) return;

    const trips = VehicleWorkspace.getActiveTrips();
    if (trips.length === 0) {
      alert(`No records to export for ${vNo}`);
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
    link.setAttribute("download", `Lorry_${vNo}_Trips_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Export records to true styled Excel (.xlsx) workbook using ExcelJS
   */
  async exportToExcel() {
    const vNo = appState.currentVehicle || 'ALL';
    const trips = typeof TripTable !== 'undefined' ? TripTable.getDisplayTrips() : VehicleWorkspace.getActiveTrips();

    if (!trips.length) {
      Utils.showToast('⚠️ No trip records available to export for this view.');
      return;
    }

    if (typeof ExcelJS === 'undefined') {
      Utils.showToast('ℹ️ ExcelJS library not detected. Falling back to CSV export...');
      this.exportCsv();
      return;
    }

    Utils.showToast('⏳ Generating styled Excel spreadsheet...');

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

      // Header Row Styling: Professional Navy Blue
      const headerRow = worksheet.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' } // Deep Navy Blue
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
        row.height = 24;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };

          // Numeric currency columns
          if ([6, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25].includes(colNumber)) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '₹#,##0';
          }
          // Center alignments
          if ([1, 2, 3, 7, 22, 23, 24].includes(colNumber)) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      });

      // Auto-fit column widths
      worksheet.columns.forEach((column) => {
        let maxLen = 12;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLen = Math.max(maxLen, val.length + 3);
        });
        column.width = Math.min(maxLen, 35);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Lorry_Trips_${vNo}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);

      Utils.showToast(`✅ Excel workbook exported successfully for ${vNo}!`);
    } catch (err) {
      console.error("exportToExcel error:", err);
      Utils.showToast(`❌ Failed to export Excel: ${err.message}`, 'error');
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExcelView;
}


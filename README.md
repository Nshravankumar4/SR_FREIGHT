# LORRY FREIGHT & BROKER MANAGEMENT SYSTEM

A clean, modern, executive SaaS application for Lorry Freight Operations, Broker Reconciliation, and Fleet Financial Management.

---

## 🚀 Key Features

1. **Authentication (Login & Logout):**
   - Single-sign-on login card before dashboard access.
   - Session storage persistence with `[ Logout ]` button in the top navigation header.
   - Default credentials: `admin` / `admin`.

2. **Top Operational Control Bar:**
   - **View Trips Time Scope:** `[ TODAY ]`, `[ SELECTED DATE ]`, `[ DATE RANGE ]`, `[ ENTIRE MONTH ]`, and `[ ALL TRIPS ]` arranged across the top with responsive date pickers and month selector.
   - **Real-time Search:** Search across Vehicle No, Route, Origin/Destination, Broker, and S.No.
   - **Excel Export (.xlsx):** Powered by `ExcelJS` to export true spreadsheets with auto-fit column widths and UI badge colors.

3. **8 Big Vibrant Status & Audit Filter Cards:**
   - Prominent, clickable cards with live counters and distinct colors:
     - 📋 **ALL TRIPS** (Slate)
     - 🆕 **NEW DISPATCH** (Indigo)
     - 🟢 **PROFIT TRIPS** (Emerald, Net P/L ≥ ₹0)
     - 🔴 **LOSS TRIPS** (Rose, Net P/L < ₹0)
     - 🟠 **PENDING BALANCE** (Amber, awaiting freight balance)
     - 🟡 **PARTIALLY PAID** (Orange)
     - ✔️ **PAID & SETTLED** (Teal)
     - ⚠️ **BALANCE MISMATCH** (Crimson audit for `Freight - Advance != Balance`)
   - Clicking any button filters matching trips in active scope.

4. **Master Table with Dedicated "View Details" Column:**
   - **`👁️ Details` Column:** Located before `1. S.No`. Clicking **`👁️ View`** on any row highlights the trip and displays the comprehensive report in the panel down below the table.
   - **Exact 24 Business Columns:**
     1. `S.No.` 2. `Trip Date` 3. `Vehicle No` 4. `From` 5. `To` 6. `Freight Amount` 7. `Advance Date` 8. `Advance Amount` 9. `Balance Amount` 10. `Halting Details` 11. `TRSP Name` 12. `TRSP Commission` 13. `Diesel` 14. `Toll Charges` 15. `Loading Charges` 16. `Unloading Charges` 17. `Police Exp` 18. `RTA C/P` 19. `Other Expenses` 20. `Driver Trip Commission` 21. `Status Amount` 22. `Status` 23. `P/L` 24. `Route`.
   - **Actions Column:** `✏️ Edit` and `🗑️ Delete` separated from business data columns.

5. **Trip Details & Financial Breakdown Panel (Below the Table):**
   - Renders 4 high-impact metric cards, 9-expense itemized ledger, halting details, and profit analysis for the selected trip.

6. **Confirmation Popups & Success Toasts:**
   - Two-step confirmation for both Edit and Delete operations with instant toast notifications.

6. **Automated Calculations & Independence:**
   - `Balance Amount = Freight Amount - Advance Amount`
   - `Total Expenses = TRSP Commission + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Commission`
   - `P/L = Freight Amount - Total Expenses`
   - `Status`: Manually selected (`Pending`, `Partially Paid`, `Paid`). Status never overrides P/L logic.

---

## 📁 Repository Structure

```
D:\Repo\Lorry/
├── index.html                   # Master Responsive Operational Dashboard
├── css/
│   └── styles.css               # Supporting styles
├── js/
│   └── app.js                   # Application state, math engine, modals, and export
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script Web App (24 Columns + JSON API)
├── docs/
│   ├── GOOGLE_SHEET_SETUP.md    # 24-Column Google Sheet database layout
│   ├── GOOGLE_FORM_SETUP.md     # Google Form field guide
│   └── DEPLOYMENT_GUIDE.md      # Zero-cost Cloudflare Pages & Google Apps Script guide
├── test_plan.md                 # Verification and test cases
└── README.md
```

---

## 🏃 Quick Start (Local Testing)

1. Open PowerShell in `D:\Repo\Lorry`.
2. Start Python's built-in web server:
   ```powershell
   py -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.
4. Log in with `admin` / `admin`.
5. Test date ranges, warning boxes, two-step edit confirmations, delete confirmation, and Excel export.
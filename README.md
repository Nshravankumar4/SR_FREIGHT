# LORRY FREIGHT & BROKER MANAGEMENT SYSTEM

A clean, modern, executive SaaS application for Lorry Freight Operations, Broker Reconciliation, and Fleet Financial Management.

---

## 🚀 Key Features

1. **Role-Based Authentication & Permissions (RBAC):**
   - Clean login screen with `User ID`, `Password` (`type="password"`), and `👁️ Show / Hide Password` toggle.
   - Credentials are not prefilled or auto-logged in.
   - **Configured Users & Roles:**
     - **Admin**: User ID `Admin` | Password `Shravan` | Role: `Admin` (Full access: Add, Edit, Delete, Settings, View, Excel)
     - **Rudra**: User ID `Rudra` | Password `RudraSarika@2505` | Role: `User` (Add, Edit, View, Excel; **Delete** and **Settings** blocked)
   - **Dual-Layer Security:**
     - **UI Layer**: For Rudra, the `🗑️ Delete` button on trip rows and the `⚙️ Settings` button in the header are completely hidden. If invoked directly, toasts display: `❌ Only Admin can delete trips` / `❌ You do not have permission to access Settings`.
     - **Backend Layer (`Code.gs`)**: Google Apps Script rejects any `deleteTrip` or `updateSettings` POST requests from non-Admin roles with `{ "success": false, "error": "Delete permission denied" }`.
   - Top header displays logged-in user and role badge (`👤 Admin (Admin)` or `👤 Rudra (User)`), with a secure `[ Logout ]` button.

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
   - **Exact 25 Business Columns (No Route column):**
     1. `1. S.No` 2. `2. Trip Date` 3. `3. Vehicle No` 4. `4. From` 5. `5. To` 6. `6. Freight Amount` 7. `7. Advance Date` 8. `8. Advance Amount` 9. `9. Halting Details` 10. `10. TRSP Name` 11. `11. TRSP Comm` 12. `12. Diesel` 13. `13. Toll Charges` 14. `14. Loading Charges` 15. `15. Unloading Charges` 16. `16. Police Exp` 17. `17. RTA C/P` 18. `18. Other Expenses` 19. `19. Driver Comm` 20. `20. Sum OF Total Exp` 21. `21. Total Exp Given` 22. `22. Status` 23. `23. P/L` 24. `24. Date Balance Recd` 25. `25. Balance Amount`.
   - **Actions Column:** `✏️ Edit` and `🗑️ Delete` separated from business data columns.

5. **Trip Details & Financial Breakdown Panel (Below the Table):**
   - Renders 6 high-impact financial cards, 9-expense itemized ledger, halting details, and profit analysis for the selected trip.

6. **Confirmation Popups & Success Toasts:**
   - Two-step confirmation for both Edit and Delete operations with instant toast notifications.

7. **Exact Business Formulas:**
   - `20. Sum OF Total Exp = TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm` (Sum of 9 expenses)
   - `21. Total Exp Given = Advance Amount + Sum OF Total Exp`
   - `23. P/L = Freight Amount - Total Exp Given`
   - `25. Balance Amount = Freight Amount - Total Exp Given`
   - `Status`: Manually selected (`New`, `Pending`, `Partially Paid`, `Paid`). Status never overrides P/L logic.

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
4. Log in with:
   - **Admin**: User ID `Admin` / Password `Shravan` (Full permissions)
   - **Rudra**: User ID `Rudra` / Password `RudraSarika@2505` (User permissions, Delete & Settings restricted)
5. Test date ranges, warning boxes, two-step edit confirmations, delete confirmation, and Excel export.
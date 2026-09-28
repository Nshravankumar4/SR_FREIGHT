# 🧪 Test Plan & Verification Log: SR_T Lorry Freight Management System

## 1. Document Overview
- **Project Name:** SR_T Lorry Freight & Fleet Management System
- **Document Version:** 3.2.0 (Production Verified)
- **Target Environments:**
  - Cloudflare: [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/)
  - Vercel: [https://ytransport.vercel.app/](https://ytransport.vercel.app/)
  - Google Cloud Spreadsheet: [https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
  - Google Apps Script Web App: `https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec`
- **Objective:** Verify role-based security, instant balance payment propagation, zero data loss, exact financial formulas, read-only View voucher exports, and vehicle isolation.

---

## 2. Test Cases & Verification Results

### 2.1 Role & Security Enforcement (100% Passed)
- **TC-AUTH-01 (Admin Full Access):** Log in as `admin` with password `Shravan` ➔ Granted Full Admin access (Add, Edit, Delete trips, Delete receipts, Settings, Full Export).
- **TC-AUTH-02 (Employee Access):** Log in as `rudra` with password `RudraSarika@2505` ➔ Granted Employee operational access.
- **TC-AUTH-03 (Delete Trip Protection):** For employee `rudra`, the `🗑️ Delete` button on rows is completely hidden. Backend API rejects any unauthorized deletion.
- **TC-AUTH-04 (Delete Receipt Protection):** In the drawer and receipt table, `Delete` button on installment receipts is hidden for non-admins; non-admins see `Recorded`.
- **TC-AUTH-05 (Settings Guard):** For employee `rudra`, `#menu-btn-settings` is hidden. Direct URL hash `#settings` triggers error toast and redirects.
- **TC-AUTH-06 (Complete Logout Cleanup):** Clicking the bold red **Logout** button stops the poller, clears session and local caches, wipes `currentVehicle`, and redirects to `#view-login`. Refreshing does not reopen the vehicle workspace.

### 2.2 Instant Balance Payment Update Path (100% Passed)
- **TC-RCPT-01 (Immediate State & Math Update):**
  - Given: A trip with Freight ₹50,000 and Advance ₹20,000 (Original Balance ₹30,000).
  - When: User enters installment of ₹15,000 and clicks `Add Payment`.
  - Then:
    - `trip.balanceReceipts` receives the record.
    - Remaining balance instantly recalculates to ₹15,000.
    - Status changes from `🔴 PAYMENT PENDING` to `🟡 PARTIALLY RECEIVED`.
    - Main transaction row, drawer card, and dashboard receivable cards update immediately without waiting for poller.
- **TC-RCPT-02 (Multi-View Live Refresh):** Adding a payment while the View Modal or Outstanding Balance Modal is open immediately re-renders them with the new payment.
- **TC-RCPT-03 (Cross-Tab Broadcast):** Adding a payment in Tab A broadcasts over `BroadcastChannel: lorry_sync_channel`, causing Tab B to reload and display the updated figures.
- **TC-RCPT-04 (Overpayment Rejection):** Attempting to add an installment exceeding remaining balance (e.g. ₹35,000 against ₹30,000 balance) is immediately rejected with validation error toast.

### 2.3 Exact Financial Formulas (25 Columns Parity)
- **TC-MATH-01 (Operational Expenses):**
  $$\text{Total Expenses} = \sum 9 \text{ Expenses} = \text{Diesel} + \text{Toll} + \text{RTA} + \text{Police} + \text{Loading} + \text{Unloading} + \text{Driver} + \text{TRSP Comm} + \text{Other}$$
- **TC-MATH-02 (Total Exp Given):**
  $$\text{Total Exp Given} = \text{Advance Amount} + \text{Total Expenses}$$
- **TC-MATH-03 (Net Trip Profit / Loss):**
  $$\text{Profit / Loss} = \text{Freight Amount} - \text{Total Expenses}$$
- **TC-MATH-04 (Original Customer Balance):**
  $$\text{Original Balance} = \text{Freight Amount} - \text{Advance Amount}$$
- **TC-MATH-05 (Remaining Balance):**
  $$\text{Remaining Balance} = \text{Original Balance} - \text{Total Balance Received}$$
- **TC-MATH-06 (Golden Test Verification):**
  Freight ₹1,30,000; Advance ₹1,20,000; Expenses ₹1,19,200:
  $\implies \text{P/L} = \text{₹}10,800$; $\text{Original Balance} = \text{₹}10,000$.
  Receipt #1: ₹9,000 $\implies$ Remaining: ₹1,000 (🔴 Partial).
  Receipt #2: ₹1,000 $\implies$ Remaining: ₹0 (🟢 Cleared).
  Receipt of ₹10,800 against ₹10,000 balance $\implies$ REJECTED.

### 2.4 Multi-Vehicle Fleet Workspace Isolation
- **TC-VEH-01 (Workspace Scoping):** When `TS15UE1122` is selected, only `TS15UE1122` trips, monthly stats, and outstanding balances are displayed.
- **TC-VEH-02 (Vehicle Switch):** Switching to `TG15T6666` resets metrics and loads `TG15T6666` records without cross-contamination.
- **TC-VEH-03 (Backend Verification Chain):** `Code.gs` checks `Entity.vehicleNo === RequestedVehicle` on all mutations, preventing cross-vehicle writes.

### 2.5 UI & Export Verification
- **TC-UI-01 ("00" Display Prevention):** Empty unentered expenses, dates, and notes render as `—`. Only genuine zeros display as `₹0`.
- **TC-UI-02 (Read-Only View Modal):** View modal contains zero form fields. Displays shipment hero, 6 financial metric cards, itemized expenses, and payment ledger.
- **TC-UI-03 (Per-Trip Excel Voucher):** Clicking `📥 Excel Voucher` downloads an executive `.xlsx` voucher styled with headers and formulas.
- **TC-UI-04 (Official PDF / Print Receipt):** Clicking `📄 PDF / Print Receipt` opens a printable official **SR TRANSPORT** consignment voucher with driver and customer stamp lines.
- **TC-UI-05 (Dashboard Balance Alert & Popup):** If pending balance exists, an executive alert banner appears on top. Clicking `Review Balances` opens the interactive modal listing pending shipments with a 1-click `Settle Payment` shortcut.
- **TC-UI-06 (Monthly P&L Matrix):** Dashboard displays chronological monthly breakdown (Month, Trips, Freight, Expenses, Net Profit/Loss, Original Balance, Received, Pending).


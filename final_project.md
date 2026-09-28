# 🚚 SR_T LORRY FREIGHT & FLEET MANAGEMENT SYSTEM
## PRODUCTION MASTER SPECIFICATION & FINAL IMPLEMENTATION BLUEPRINT

**Target Workspace:** `D:\Repo\Lorry`  
**Document Version:** 3.2.0 (Authoritative Production Master Release)  
**Updated Date:** 2026-09-28  
**Repository Branch:** `Upgrade`  

---

## 1. 🔗 Live Connected Endpoints & Deployments

| Component | Target URL / Reference | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Cloudflare Pages / Workers** | [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/) | 🟢 Active | Edge-cached production client |
| **Vercel Edge Cloud** | [https://ytransport.vercel.app/](https://ytransport.vercel.app/) | 🟢 Active | High-availability global deployment |
| **Google Cloud Spreadsheet** | [Open Connected Google Sheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit) | 🟢 Active | Authoritative Database (Trips, Vehicles, BalanceReceipts) |
| **Google Apps Script Web App** | `https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec` | 🟢 Live (v3/v4) | Backend API with Concurrency Locks & Role Verification |
| **Active Deployment ID** | `AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S` | 🟢 Production | Google Apps Script Active Web App |

---

## 2. Core Architectural Upgrades & Bug Fixes

### 2.1 Resolution of the "00" Display Bug
- **Problem:** `Number(val) || 0` and unentered trip properties defaulted to numeric `0`, causing empty dates, notes, and unentered expenses to display as `00` or `0` across cards, tables, and drawers.
- **Solution:** Integrated centralized display formatters in `js/utils.js`:
  - `Utils.displayNumber(val)`: Returns `—` for blank/null/undefined; formats numbers with Indian grouping.
  - `Utils.displayCurrency(val)`: Returns `—` for blank/null/undefined; returns `₹0` only for explicit zero; formats positive amounts as `₹X,XX,XXX`.
  - `Utils.displayDate(val)`: Normalizes `dd-mm-yyyy`, `yyyy-mm-dd`, and Excel serial dates (`46262`) with strict protection against Unix epoch `1970` fallbacks.
  - `Utils.displayText(val)`: Returns `—` when unentered.

### 2.2 Complete & Authoritative Logout Flow
- **Problem:** Logging out previously left poller intervals running, retained active vehicle tokens, and reopened cached data on page refresh.
- **Solution:** Updated `Auth.logout()` in `js/auth.js` and `js/app.js`:
  1. Halts the cloud polling interval immediately (`App.stopBackgroundPoller()`).
  2. Closes any active modals or drawers.
  3. Wipes credentials and tokens from both `localStorage` and `sessionStorage`.
  4. Resets app state (`currentVehicle`, `trips`, `receipts`, `filters`, `pendingMutationCount`).
  5. Navigates cleanly back to `#view-login`.
  6. High-contrast **Red Logout Button** with icon and text placed prominently in the header and menu drawer.

### 2.3 Instant Balance Payment Update Path
- **Required Flow:**
  $$\text{Receipt Saved} \longrightarrow \text{Cloud Confirms} \longrightarrow \text{Fetch Latest Receipts} \longrightarrow \text{Recalculate} \longrightarrow \text{Update State} \longrightarrow \text{Multi-view Render} \longrightarrow \text{Broadcast}$$
- **Components Immediately Updated on Payment Add/Delete:**
  1. Transaction Table Row & Balance Pill
  2. Read-Only View Modal (if open)
  3. Edit Drawer Balance Settlement Card & Installments History Table
  4. Dashboard KPI Cards (Total Received, Remaining Receivable)
  5. Outstanding Balance Notice Banner & Recovery Modal
  6. Real-time Cross-Tab Broadcast via `BroadcastChannel: lorry_sync_channel`
  7. Client Storage Persistence (`Trips.persistState()`)

### 2.4 Outstanding Balance Recovery System
- **Dashboard Notice Banner:** When `remainingBalance > 0`, an executive alert banner appears on the dashboard displaying total pending amount and pending trips count.
- **Outstanding Balance Modal (`#modal-outstanding-balances`):**
  - Displays all unpaid trips for the active vehicle.
  - Shows S.No, Date, Route, Freight, Advance, Original Balance, Received, and Remaining Receivable.
  - Includes direct action button `[ 💳 Settle Payment ]` to instantly open the settlement drawer.

### 2.5 Monthly Profit & Loss Breakdown Table
- Aggregates all trips of the selected vehicle by operational month (e.g. September 2026, August 2026).
- Displays:
  - Operational Month
  - Total Trips Count
  - Gross Freight
  - Sum of 9 Operational Expenses
  - Net Profit / Loss with margin % and green/red badge
  - Original Balance
  - Total Received
  - Outstanding Balance with semantic status indicator (🟢 / 🔴)
  - Quick Filter button to jump to that month in the main ledger.

### 2.6 Strictly Read-Only View Trip Modal with Excel & PDF/Print
- **Strict Read-Only:** All editable form elements and accidental edit inputs removed.
- **Excel Voucher Export (`Trips.exportTripExcel`):** Uses ExcelJS to generate an executive-styled `.xlsx` voucher containing shipment info, 9 operational expenses, net margin, and customer balance installment history.
- **Official SR Transport PDF / Print Receipt (`Trips.printTripReceipt`):**
  - Generates an official consignment voucher with SR Transport branding, vehicle details, driver signature line, customer stamp box, and complete payment installment ledger.
  - Triggers standard print / PDF save dialog (`window.print()`).

### 2.7 Role-Based Access Control (Admin vs. Employee)
- **Admin (`admin` / `Shravan`):** Full access to Add, Edit, Delete trips, Delete payment receipts, Settings, and System Exports.
- **Employee (`rudra` / `RudraSarika@2505`):** Access to Add/Edit trips and Record payment installments.
  - `🗑️ Delete Trip` and `🗑️ Delete Receipt` buttons are completely hidden.
  - `⚙️ Settings` button is hidden; unauthorized navigation triggers a warning toast.
  - Backend `Code.gs` rejects any delete or settings mutation attempted with non-admin credentials.

---

## 3. Authoritative Financial Mathematics

The single source of truth across `js/calculations/financial.js` and `google-apps-script/Code.gs`:

$$\text{1. Total Expenses} = \text{Diesel} + \text{Toll} + \text{RTA} + \text{Police} + \text{Loading} + \text{Unloading} + \text{Driver Exp} + \text{TRSP Comm} + \text{Other Exp}$$

$$\text{2. Profit / Loss (Internal Business Metric)} = \text{Freight Amount} - \text{Total Expenses}$$

$$\text{3. Original Customer Balance (External Receivable)} = \text{Freight Amount} - \text{Advance Amount}$$

$$\text{4. Total Balance Received} = \sum_{\text{Trip Receipts}} \text{Received Amount}$$

$$\text{5. Remaining Customer Balance} = \text{Original Balance} - \text{Total Balance Received}$$

$$\text{6. Total Exp Given} = \text{Advance Amount} + \text{Total Expenses}$$

### Golden Example (Mathematical Verification)
- **Freight:** ₹1,30,000
- **Advance:** ₹1,20,000
- **Expenses (9 Sum):** ₹1,19,200
- **Profit / Loss:** $\text{₹}1,30,000 - \text{₹}1,19,200 = \mathbf{\text{₹}10,800}$ (Profit)
- **Original Customer Balance:** $\text{₹}1,30,000 - \text{₹}1,20,000 = \mathbf{\text{₹}10,000}$
- **After Receipt #1 (+₹9,000):** Total Received = ₹9,000; Remaining Balance = ₹1,000 (🔴 Partially Received)
- **After Receipt #2 (+₹1,000):** Total Received = ₹10,000; Remaining Balance = ₹0 (🟢 Cleared / Done)
- *Strict Rule:* Never confuse the ₹10,800 profit with the ₹10,000 customer balance.

---

## 4. Multi-Vehicle Fleet Workspace Isolation

The application operates as isolated workspaces for each registered vehicle:
1. **`TS15UE1122`**
2. **`TG15T6666`**

Switching vehicles via the header badge or slide-over drawer resets all active queries, date filters, monthly aggregations, and outstanding balances to strictly that vehicle's domain.

---

## 5. Universal Professional Footer & Branding
Every view features the standardized copyright and developer signature:
> `© 2026 SR Transport • Enterprise Freight & Fleet Management System • Developed for Fleet Operations • All Rights Reserved`

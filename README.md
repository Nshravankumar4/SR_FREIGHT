# SR_T LORRY FREIGHT & BROKER MANAGEMENT SYSTEM

A 100% Cloud-First, Enterprise SaaS Platform for Transport Operations, Real-Time Fleet Financials, and Automated Google Cloud Backups.

---

## 🌐 Live Production Deployments

* **Cloudflare Global Network:** [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/)
* **Vercel Edge Cloud:** [https://ytransport.vercel.app/](https://ytransport.vercel.app/)
* **Active Cloud Google Sheet:** [Connected Google Spreadsheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
* **Live Google Apps Script Web App:** `https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec`
* **Active Deployment ID:** `AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S` (Version 3)

---

## ⚡ Multi-User Real-Time Synchronization Engine

Just like in the reference architecture (`D:\Repo\SR_T`), the system operates across devices without data loss:

1. **Immediate Cloud Reflection with Mutation Locks:**
   - Whenever **Admin (Shravan)** or **Employee (Rudra)** adds or edits a trip, it acquires a mutation lock (`isSaving = true`, `pendingMutationCount++`).
   - The local state updates immediately and dispatches an asynchronous cloud mutation to Google Apps Script.
   - The background poller is temporarily held off (`Date.now() - lastSuccessfulMutation < 4000`) so the poller never overwrites pending or newly saved data.

2. **Continuous Background Polling & Tab Focus Sync:**
   - **4-Second Background Poller:** Automatically queries the cloud database every 4 seconds when the user is logged in.
   - **Tab Focus Auto-Sync:** As soon as a user clicks back to their browser tab (`window.focus` or `visibilitychange`), it instantly checks the cloud for newly added trips.
   - **Multi-Tab BroadcastChannel:** Any changes in one tab immediately synchronize across all open browser windows (`BroadcastChannel: lorry_sync_channel`).

3. **Zero Data Loss & 3-Layer Backup Architecture:**
   - **Layer 1 (LocalStorage Point-in-Time Snapshots):** Up to 25 rolling snapshots (`lorry_backup_snapshots_v242`) capturing exact trip datasets after every Add/Edit/Delete mutation.
   - **Layer 2 (Google Drive Clones):** Background trigger clones the master workbook into `Lorry_Backups` using Google Apps Script `DriveApp` on every mutation.
   - **Layer 3 (1-Click Recovery):** Admin can open Cloud Settings and click `[🔄 Restore]` next to any snapshot to instantly restore both local browser state and cloud Google Sheets.

---

## 🔐 Dual-Layer Role & Permissions Security

| Role | Username | Password | View & Export | Add/Edit Trips | Delete Trips | Balance Receipts | Renewals & Alerts | Cloud Settings |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin** | `admin` or `shravan` | `Shravan` | ✅ | ✅ | ✅ | Full (Add & Delete) | Full (Add, Edit, Delete) | ✅ |
| **Employee** | `rudra` | `RudraSarika@2505` | ✅ | ✅ | ❌ Restricted | Add Only | View Only | ❌ Restricted |

* **UI Layer:** The `🗑️ Delete` button, `⚙️ Settings` button, and renewal mutation controls are hidden for Rudra. Any direct programmatic calls trigger security alert toasts.
* **Backend Layer (`Code.gs`):** Google Apps Script strictly validates `role === 'Admin'` before deleting trips, receipts, renewals, or updating cloud settings.

---

## 🔔 Fleet Renewals & Expiry Alerts System

A standalone compliance and vehicle asset tracking module completely isolated from Trips and Financials:
* **Dedicated Sheet:** Stored in Google Sheets tab named **`Renewals`**.
* **Dynamic Status Calculations (No Hardcoding):** Urgency is dynamically evaluated against the current system date:
  - 🔴 **OVERDUE:** Expiry date is before current date (e.g. `TG15C2324` Bike Insurance).
  - 🔴 **DUE TODAY:** Expires today (pulsing high-priority badge).
  - 🟠 **DUE TOMORROW / THIS WEEK:** Due within 1 to 7 days (e.g. `TG15UE1122` & `TG15T6666` Quarterly Road Taxes).
  - 🟡 **DUE SOON:** Due within 30 days.
  - 🔵 **UPCOMING:** Due within 90 days.
  - 🟢 **ACTIVE:** Valid for >90 days (e.g. `TG15G1122` Car Insurance).
* **Multi-Schedule Reminder Alerts:** Multi-select reminder timelines (1, 7, 15, 30, 60, 90 days before due date).
* **Automated Expiry Popups:** Instant startup modal alerts operators of critical or overdue renewals with a 1-click shortcut to the renewals workspace.
* **Header & Drawer Badges:** Real-time red attention count badge on the top header bell button and menu drawer.

---

## 📊 Authoritative Financial Formulas (Version 2.4.2)

1. `Total Expenses` = `Diesel + Toll + RTA + Police + Loading + Unloading + Driver Exp + TRSP Comm + Other Expenses` (Sum of 9 Expenses)
2. `Profit / Loss` = `Freight Amount - Total Expenses` (Internal Business Margin)
3. `Original Balance` = `Freight Amount - Advance Amount` (External Customer Debt)
4. `Total Balance Received` = `Sum of BalanceReceipts`
5. `Remaining Balance` = `Original Balance - Total Balance Received` (Down to ₹0 with 🔴/🟢 indicator)
6. `Total Exp Given` = `Advance Amount + Total Expenses`

---

## 📁 Modular Repository Structure

```
D:\Repo\Lorry/
├── index.html                   # Master Responsive Layout (Trips, Dashboard, Excel, Renewals, Settings)
├── css/
│   ├── base.css                 # Typography & color variables
│   └── components.css           # Cards, buttons, tables, badges
├── js/
│   ├── app.js                   # Application lifecycle & bootloader
│   ├── config.js                # Global configuration & Web App endpoints
│   ├── state.js                 # Reactive application state
│   ├── router.js                # Hash router & vehicle navigation
│   ├── auth.js                  # Authentication & role guard
│   ├── api.js                   # Centralized API client for Apps Script
│   ├── utils.js                 # Formatting & date converters
│   ├── calculations/
│   │   └── financial.js         # Authoritative financial engine
│   ├── renewals/
│   │   ├── renewal-calculations.js # Dynamic status engine & time diff calculations
│   │   ├── renewals.js             # Canonical 28-doc dataset, state sync & badges
│   │   ├── renewal-table.js        # Urgency-sorted table & multi-filter controller
│   │   ├── renewal-form.js         # Add / Edit renewal modal with reminder checkboxes
│   │   └── renewal-alerts.js       # Critical attention popups & header bell handler
│   ├── vehicles/
│   │   ├── vehicle-list.js      # Vehicle selection screen
│   │   ├── vehicle-workspace.js # Vehicle-scoped context
│   │   └── vehicle-data.js      # Vehicle info & driver management
│   ├── trips/
│   │   ├── trips.js             # Trips orchestrator
│   │   ├── trip-table.js        # 25-column table renderer with 5 time scopes
│   │   ├── trip-form.js         # Add & edit form logic
│   │   └── trip-validation.js   # Input validation & overpayment checks
│   ├── receipts/
│   │   ├── receipts.js          # Receipt installment ledger
│   │   ├── receipt-table.js     # Receipt history table
│   │   └── receipt-form.js      # Add receipt payment modal
│   ├── dashboard/
│   │   └── dashboard.js         # KPI metrics & summaries
│   ├── excel/
│   │   └── excel-view.js        # Excel spreadsheet view & true XLSX exporter
│   └── settings/
│       └── settings.js          # Cloud settings & snapshots
├── google-apps-script/
│   └── Code.gs                  # Apps Script backend (Vehicles, Trips, Receipts, Renewals)
├── docs/
│   ├── GOOGLE_SHEET_SETUP.md    # 4-Sheet database specifications
│   ├── GOOGLE_FORM_SETUP.md     # Google Form field guide
│   └── DEPLOYMENT_GUIDE.md      # Deployment guide & credentials
├── test_suite.ps1               # 15-test automated verification suite
├── test_plan.md                 # Test plan & verification log
├── final_project.md             # Production master blueprint
└── README.md
```
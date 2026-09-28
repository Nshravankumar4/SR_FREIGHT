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

| Role | Username | Password | View & Export | Add Trips | Edit Trips | Delete Trips | Cloud Settings |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Admin** | `admin` or `shravan` | `Shravan` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Employee** | `rudra` | `RudraSarika@2505` | ✅ | ✅ | ✅ | ❌ Restricted | ❌ Restricted |

* **UI Layer:** The `🗑️ Delete` button and `⚙️ Settings` button are completely hidden for Rudra. Any direct programmatic calls trigger security alert toasts.
* **Backend Layer (`Code.gs`):** Google Apps Script strictly validates `role === 'Admin'` before deleting any row or updating cloud settings.

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
├── index.html                   # Master Responsive Layout (Trips, Dashboard, Excel, Settings)
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
│   └── Code.gs                  # Apps Script backend (Vehicles, Trips, Receipts)
├── docs/
│   ├── GOOGLE_SHEET_SETUP.md    # 3-Sheet database specifications
│   ├── GOOGLE_FORM_SETUP.md     # Google Form field guide
│   └── DEPLOYMENT_GUIDE.md      # Deployment guide & credentials
├── tests/
│   ├── financial-tests.js       # Financial engine unit tests
│   └── vehicle-isolation-tests.js # Multi-vehicle isolation tests
└── README.md
```
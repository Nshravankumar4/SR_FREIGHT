# SR_T LORRY FREIGHT & BROKER MANAGEMENT SYSTEM

A 100% Cloud-First, Enterprise SaaS Platform for Transport Operations, Real-Time Fleet Financials, and Automated Google Cloud Backups.

---

## 🌐 Live Production Deployments

* **Cloudflare Global Network:** [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/)
* **Vercel Edge Cloud:** [https://ytransport.vercel.app/](https://ytransport.vercel.app/)
* **Active Cloud Google Sheet:** [Connected Google Spreadsheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
* **Live Google Apps Script Web App:** `https://script.google.com/macros/s/AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ/exec`
* **Active Deployment ID:** `AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ`

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

3. **Zero Data Loss & 3-Layer Backup Architecture (Identical to `SR_T`):**
   - **Layer 1 (LocalStorage Point-in-Time Snapshots):** Up to 25 rolling snapshots (`lorry_backup_snapshots_v1`) capturing exact trip datasets after every Add/Edit/Delete mutation.
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

## 📊 Exact 25 Business Columns & Calculation Engine

1. `1. S.No.`
2. `2. Trip Date`
3. `3. Vehicle No`
4. `4. From`
5. `5. To`
6. `6. Freight Amount`
7. `7. Advance Date`
8. `8. Advance Amount`
9. `9. Halting Details`
10. `10. TRSP Name`
11. `11. TRSP Comm`
12. `12. Diesel`
13. `13. Toll Charges`
14. `14. Loading Charges`
15. `15. Unloading Charges`
16. `16. Police Exp`
17. `17. RTA C/P`
18. `18. Other Expenses`
19. `19. Driver Comm`
20. `20. Sum OF Total Exp` = `TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm`
21. `21. Total Exp Given` = `Advance Amount + Sum OF Total Exp`
22. `22. Status` (`New`, `Pending`, `Partially Paid`, `Paid`)
23. `23. P/L` = `Freight Amount - Total Exp Given`
24. `24. Date Balance Recd`
25. `25. Balance Amount` = `Freight Amount - Total Exp Given`

---

## 📁 Repository Structure

```
D:\Repo\Lorry/
├── index.html                   # Master Responsive Operational Dashboard & Settings Modal
├── css/
│   └── styles.css               # Supporting styles & animation keyframes
├── js/
│   └── app.js                   # State, Real-time Sync Engine, Role Guard, Calculations & ExcelJS
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script Web App (Multi-user API + Drive Backup Engine)
├── docs/
│   ├── GOOGLE_SHEET_SETUP.md    # 24-Column Google Sheet database layout
│   └── DEPLOYMENT_GUIDE.md      # Cloudflare & Vercel deployment guide
├── final_project.md             # Comprehensive architecture report & verification log
├── test_plan.md                 # End-to-end test cases and results
└── README.md
```
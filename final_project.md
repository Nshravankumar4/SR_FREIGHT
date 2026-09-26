# 🚚 SR_T LORRY FREIGHT & BROKER MANAGEMENT SYSTEM - FINAL ARCHITECTURE & REPORT

## 🌟 Executive Overview
The **SR_T Lorry Freight Management System** has been fully upgraded, debugged, and verified as a 100% cloud-first, enterprise-grade transport operations platform. It mirrors the proven multi-user architecture of the reference project (`D:\Repo\SR_T`), ensuring real-time bidirectional synchronization between **Admin (Shravan)** and **Employee (Rudra)** with automated Google Drive backups and zero data loss.

---

## 🔗 Live Connected Endpoints & Deployments

| Component | Target URL / Reference | Status |
| :--- | :--- | :---: |
| **Cloudflare Pages / Workers** | [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/) | 🟢 Active |
| **Vercel Edge Cloud** | [https://ytransport.vercel.app/](https://ytransport.vercel.app/) | 🟢 Active |
| **Google Cloud Spreadsheet** | [Open Connected Google Sheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit) | 🟢 Active & Pristine (4 Canonical Trips) |
| **Google Apps Script Web App** | `https://script.google.com/macros/s/AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ/exec` | 🟢 Verified & Live |
| **Active Deployment ID** | `AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ` | 🟢 Version 1 |

---

## 🛠️ Root Cause Diagnosis & Architectural Solutions

### 1. The "Immediate Reset on Edit/Add" Bug (Resolved)
- **Root Cause:**
  When a user saved or edited a trip, the local UI state changed, but the background poller (`autoSyncCloud`) running every 4 seconds immediately retrieved data from Google Sheets before Google Sheets had processed the POST mutation. The poller overwrote local state with old data, causing newly entered data to vanish. Furthermore, `executeSaveNewTrip`, `executeDeleteTrip`, and `executeSaveTripEdits` used `await sendCloudMutation(...)` inside regular synchronous functions, causing an unhandled parse error on launch.
- **Architectural Fix:**
  1. **Mutation Lock & Mutex Guards:** Added `isSaving`, `pendingMutationCount`, and `lastSuccessfulMutation`.
  2. **Poller Lockout:** `autoSyncCloud()` immediately aborts if `isSaving || pendingMutationCount > 0` or if less than 4 seconds have passed since `lastSuccessfulMutation`.
  3. **Non-Destructive Merge:** Pending mutations are identified with unique `tripId` (`crypto.randomUUID()`) and never overwritten by background polls.
  4. **Async Handlers:** Made `executeSaveNewTrip`, `executeDeleteTrip`, and `executeSaveTripEdits` proper `async` functions with try-finally blocks that reliably decrement `pendingMutationCount` and release `isSaving`.

### 2. Login Page Not Displaying / Dead Buttons (Resolved)
- **Root Cause:**
  1. `#login-overlay` had the Tailwind class `hidden` hardcoded in `index.html`.
  2. Syntax errors in `app.js` (unhandled `await` in sync functions, duplicate `prevHash` declaration) prevented script execution on page load, so `setupAuth()` never ran to remove `hidden`.
  3. `#modal-confirm-add` had duplicate event triggers (inline HTML `onclick="executeSaveNewTrip()"` and an `addEventListener` in `setupModals()`).
- **Architectural Fix:**
  1. Removed `hidden` class from `#login-overlay` in `index.html` so the login screen renders by default immediately.
  2. Default header badges set to "Not Signed In" / "Guest".
  3. Fixed all syntax errors in `app.js` and removed duplicate inline `onclick` handlers.
  4. Table redesigned with sticky `⚡ ACTIONS` column on the left containing `👁️ View`, `✏️ Edit`, and `🗑️ Delete` (Admin only).

---

## ⚡ Multi-User Real-Time Synchronization Engine

1. **Bidirectional Instant Sync:**
   - When **Admin** edits or adds a trip, it updates the Google Sheet immediately.
   - When **Rudra** adds or edits a trip from any device/mobile, it updates the Google Sheet immediately.
   - Within seconds, both screens reflect the exact same state without manual refreshes.

2. **Automated Background Poller & Focus Detection:**
   - Background poller checks the Google Sheet every 4 seconds (`setInterval`).
   - Immediate re-sync triggers as soon as the user returns to the tab (`window.focus` and `visibilitychange`).
   - `BroadcastChannel ('lorry_sync_channel')` coordinates instant tab-to-tab sync.

3. **Zero Data Loss & 3-Layer Backup Guarantee (Ref: `D:\Repo\SR_T`):**
   - **Layer 1: LocalStorage Point-in-Time Snapshots (`lorry_backup_snapshots_v1`):** Keeps a rolling ring buffer of up to 25 full snapshots. Every Add, Edit, Delete, or Manual Backup records the snapshot with timestamp, reason, row counts, user, and complete trip payload.
   - **Layer 2: Google Drive Automated File Cloning (`DriveApp`):** Apps Script automatically clones the master Google Spreadsheet into the `Lorry_Backups` folder in Google Drive (with automatic fallback to an internal `SNAP_` sheet tab if Drive permissions are restricted).
   - **Layer 3: 1-Click Point-in-Time Restore (Admin Only):** Admin can open Cloud Settings, view the history of snapshots, and restore the entire database state back to any moment. The restore updates the UI, local storage, and syncs the entire dataset back to Google Sheets via `restoreFullDataset`.

---

## 🔐 Dual-Layer Security & Roles Matrix

| Feature | Admin (`Shravan` / `Admin`) | Employee (`Rudra`) |
| :--- | :---: | :---: |
| **Username** | `admin` or `shravan` | `rudra` |
| **Password** | `Shravan` | `RudraSarika@2505` |
| **View Trips & Reports** | ✅ Full Access | ✅ Full Access |
| **Excel Export (.xlsx)** | ✅ Full Access | ✅ Full Access |
| **Filter by Status & Scope** | ✅ Full Access | ✅ Full Access |
| **Add New Trip** | ✅ Full Access | ✅ Full Access |
| **Edit Trip Details** | ✅ Full Access | ✅ Full Access |
| **Delete Trip** | ✅ Full Access | ❌ Blocked (UI Hidden + Backend Rejection) |
| **Cloud Settings & Backups**| ✅ Full Access | ❌ Blocked (UI Hidden + Backend Rejection) |

---

## 📊 25-Column Business Math Verification

* `20. Sum OF Total Exp` = TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm
* `21. Total Exp Given` = Advance Amount + Sum OF Total Exp
* `23. P/L` = Freight Amount - Total Exp Given
* `25. Balance Amount` = Freight Amount - Total Exp Given

---

## 🧪 Comprehensive Automated Test Results (100% Passed)

Automated end-to-end testing was conducted using Headless Chrome CDP (`scratch/test_e2e_full.py`):

| Test Suite | Scenario | Result |
| :--- | :--- | :---: |
| **TC-01** | Initial Load: Login screen is visible by default with no console errors | ✅ PASSED |
| **TC-02** | Rudra Login: Authenticates as Employee, Delete & Settings buttons blocked | ✅ PASSED |
| **TC-03** | Logout Flow: Clears session and returns to login modal immediately | ✅ PASSED |
| **TC-04** | Admin Login: Authenticates as Admin, Delete & Settings buttons enabled | ✅ PASSED |
| **TC-05** | Add Trip Flow: Modal opens, inputs validated, trip added, table & counters update | ✅ PASSED |
| **TC-06** | View Details Flow: Clicking `👁️ View` opens down-sheet audit panel with ledger | ✅ PASSED |
| **TC-07** | Edit Trip Flow: Slide-over opens, values update, save persists, row updates | ✅ PASSED |
| **TC-08** | Delete Trip Flow: Confirm modal opens, trip removed, counters decrement | ✅ PASSED |
| **TC-09** | Backup Engine: Snapshot recorded for every mutation in `lorry_backup_snapshots_v1` | ✅ PASSED |

**Live Google Sheet Database Status:**
All 4 canonical business trips are intact:
1. `TS15UE1122` (Hyderabad ➔ Purnia, Freight ₹2,00,000)
2. `TG15T6666` (Hyderabad ➔ Purnia, Freight ₹2,50,000)
3. `TS15UE1122` (Hyderabad ➔ Kedch, Freight ₹2,00,000)
4. `AP39UP9666` (Medchal ➔ Raipur, Freight ₹1,50,000)

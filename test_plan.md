# Test Plan & Verification Log: SR_T Lorry Freight & Broker Management System

## 1. Document Overview
- **Project Name:** SR_T Lorry Freight & Broker Management System
- **Document Version:** 3.1.0 (Production Verified)
- **Target Environments:**
  - Cloudflare: [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/)
  - Vercel: [https://ytransport.vercel.app/](https://ytransport.vercel.app/)
  - Google Cloud Spreadsheet: [https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
- **Objective:** Verify role-based access control, multi-user real-time synchronization, zero data loss, exact 25 business calculations, and automated Google Drive backups.

---

## 2. Test Cases & Verification Results

### 2.1 Role & Security Enforcement (100% Passed)
- **TC-AUTH-01 (Admin Login):** Log in as `admin` with password `Shravan` ➔ Granted Full Admin access (Add, Edit, Delete, Settings, Excel).
- **TC-AUTH-02 (Rudra Login):** Log in as `rudra` with password `RudraSarika@2505` ➔ Granted Employee access.
- **TC-AUTH-03 (Delete Protection):** For Rudra, the `🗑️ Delete` button on rows is completely hidden. Direct API deletion calls are rejected by `Code.gs` backend with `Delete permission denied`.
- **TC-AUTH-04 (Settings Protection):** For Rudra, the `⚙️ Settings` button is hidden. Direct attempts trigger permission denied toast.
- **TC-AUTH-05 (Logout):** Logging out clears session from `localStorage` and returns to Login Overlay immediately.

### 2.2 Multi-User Real-Time Cloud Synchronization
- **TC-SYNC-01 (Admin Add ➔ Rudra View):** When Admin adds a trip, it posts to Google Sheets. Rudra's open tab receives and displays the trip within 4 seconds or immediately on tab focus.
- **TC-SYNC-02 (Rudra Add ➔ Admin View):** When Rudra adds a trip, it updates the Google Sheet. Admin's screen automatically re-renders with the new trip.
- **TC-SYNC-03 (Zero Data Loss Seeding):** When connecting to an empty Google Sheet, the app automatically uploads existing trips so no records are lost.
- **TC-SYNC-04 (Cross-Tab Live Broadcast):** Edits made in one tab immediately synchronize across all open browser windows via `BroadcastChannel: lorry_sync_channel`.
- **TC-SYNC-05 (Mutation Lock & Poller Mutex):** During Add/Edit/Delete, `isSaving = true` and `pendingMutationCount > 0` lock the background poller from overwriting local changes. Background sync is paused until 4 seconds after `lastSuccessfulMutation`.

### 2.3 Automated Google Drive Cloud Backups
- **TC-BAK-01 (Auto-Backup on Mutation):** Every add, edit, or delete automatically clones the Google Sheet into the `Lorry_Backups` folder in Google Drive with timestamp and reason.
- **TC-BAK-02 (Snapshot Fallback):** If Drive cloning encounters permission limits, the backend automatically captures a snapshot tab (`SNAP_...`) inside the master spreadsheet.
- **TC-BAK-03 (Point-in-Time Rolling Buffer):** Browser maintains a rolling ring buffer of 25 snapshots in `lorry_backup_snapshots_v1` on every mutation.

### 2.4 Exact Financial Calculations (25 Columns)
- **TC-MATH-01 (Expenses):** `20. Sum OF Total Exp` = TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm.
- **TC-MATH-02 (Total Exp Given):** `21. Total Exp Given` = Advance Amount + Sum OF Total Exp.
- **TC-MATH-03 (P/L):** `23. P/L` = Freight Amount - Total Exp Given.
- **TC-MATH-04 (Balance):** `25. Balance Amount` = Freight Amount - Total Exp Given.

---

## 3. Automated Headless Chrome CDP Verification Log
Automated E2E test script `scratch/test_e2e_full.py` executed across all features:
- Test 1: Initial load & Login Overlay visibility ➔ PASS
- Test 2: Employee (Rudra) login & permission guards ➔ PASS
- Test 3: Session logout ➔ PASS
- Test 4: Administrator (Shravan) login ➔ PASS
- Test 5: Add Trip modal, validation, and table update ➔ PASS
- Test 6: View Trip Details slide-down audit drawer ➔ PASS
- Test 7: Edit Trip slide-over drawer, computation & persistence ➔ PASS
- Test 8: Delete Trip confirmation modal & state removal ➔ PASS
- Test 9: Snapshot backup persistence ➔ PASS

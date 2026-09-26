# Test Plan: SR_T Lorry Freight & Broker Management System

## 1. Document Overview
- **Project Name:** SR_T Lorry Freight & Broker Management System
- **Document Version:** 3.0.0 (Production Verified)
- **Target Environments:**
  - Vercel: [https://ytransport.vercel.app/](https://ytransport.vercel.app/)
  - Cloudflare: [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/)
  - Google Cloud Spreadsheet: [https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
- **Objective:** Verify role-based access control, multi-user real-time synchronization, zero data loss, exact 25 business calculations, and automated Google Drive backups.

---

## 2. Test Cases & Verification Results

### 2.1 Role & Security Enforcement (100% Passed)
- **TC-AUTH-01 (Admin Login):** Log in as `Admin` with password `Shravan` ➔ Granted Full Admin access (Add, Edit, Delete, Settings, Excel).
- **TC-AUTH-02 (Rudra Login):** Log in as `Rudra` with password `RudraSarika@2505` ➔ Granted Employee access.
- **TC-AUTH-03 (Delete Protection):** For Rudra, the `🗑️ Delete` button on rows is completely hidden. Direct API deletion calls are rejected by `Code.gs` backend with `Delete permission denied`.
- **TC-AUTH-04 (Settings Protection):** For Rudra, the `⚙️ Settings` button is hidden. Direct attempts trigger permission denied toast.
- **TC-AUTH-05 (Logout):** Logging out clears session from `localStorage` and resets the interface.

### 2.2 Multi-User Real-Time Cloud Synchronization
- **TC-SYNC-01 (Admin Add ➔ Rudra View):** When Admin adds a trip, it posts to Google Sheets. Rudra's open tab receives and displays the trip within 4 seconds or immediately on tab focus.
- **TC-SYNC-02 (Rudra Add ➔ Admin View):** When Rudra adds a trip, it updates the Google Sheet. Admin's screen automatically re-renders with the new trip.
- **TC-SYNC-03 (Zero Data Loss Seeding):** When connecting to an empty Google Sheet, the app automatically uploads existing trips so no records are lost.
- **TC-SYNC-04 (Cross-Tab Live Broadcast):** Edits made in one tab immediately synchronize across all open browser windows via `BroadcastChannel: lorry_sync_channel`.

### 2.3 Automated Google Drive Cloud Backups
- **TC-BAK-01 (Auto-Backup on Mutation):** Every add, edit, or delete automatically clones the Google Sheet into the `Lorry_Backups` folder in Google Drive with timestamp and reason.
- **TC-BAK-02 (Snapshot Fallback):** If Drive cloning encounters permission limits, the backend automatically captures a snapshot tab (`SNAP_...`) inside the master spreadsheet.

### 2.4 Exact Financial Calculations (25 Columns)
- **TC-MATH-01 (Expenses):** `20. Sum OF Total Exp` = TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm.
- **TC-MATH-02 (Total Exp Given):** `21. Total Exp Given` = Advance Amount + Sum OF Total Exp.
- **TC-MATH-03 (P/L):** `23. P/L` = Freight Amount - Total Exp Given.
- **TC-MATH-04 (Balance):** `25. Balance Amount` = Freight Amount - Total Exp Given.

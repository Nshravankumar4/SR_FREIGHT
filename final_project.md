# 🚚 SR_T LORRY FREIGHT & BROKER MANAGEMENT SYSTEM - FINAL ARCHITECTURE & REPORT

## 🌟 Executive Overview
The **SR_T Lorry Freight Management System** has been fully upgraded to a 100% cloud-first, enterprise-grade transport operations platform. It mirrors the proven multi-user architecture of the reference project (`D:\Repo\SR_T`), ensuring real-time bidirectional synchronization between **Admin (Shravan)** and **Employee (Rudra)** with automated Google Drive backups.

---

## 🔗 Live Connected Endpoints & Deployments

| Component | Target URL / Reference | Status |
| :--- | :--- | :---: |
| **Vercel Edge Cloud** | [https://ytransport.vercel.app/](https://ytransport.vercel.app/) | 🟢 Active |
| **Cloudflare Pages / Workers** | [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/) | 🟢 Active |
| **Google Cloud Spreadsheet** | [Open Connected Google Sheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit) | 🟢 Active |
| **Google Apps Script Web App** | `https://script.google.com/macros/s/AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ/exec` | 🟢 Verified |
| **Active Deployment ID** | `AKfycbyp5fBDoLJTAMS-x7K75yST2ZP0aKRWZs9mlyT2SH5ZGnQhvqrc_rfGPNTP8yymqjdQ` | 🟢 Verified |

---

## ⚡ Real-Time Multi-User Cloud Sync Engine

1. **Bidirectional Instant Sync:**
   - When **Admin** edits or adds a trip, it updates the Google Sheet immediately.
   - When **Rudra** adds or edits a trip from any device/mobile, it updates the Google Sheet immediately.
   - Within seconds, both screens reflect the exact same state without manual refreshes.

2. **Automated Background Poller & Focus Detection:**
   - Background poller (`setInterval`) checks the Google Sheet every 4 seconds.
   - Immediate re-sync triggers as soon as the user returns to the tab (`window.focus` and `visibilitychange`).
   - `BroadcastChannel ('lorry_sync_channel')` coordinates instant tab-to-tab sync.

3. **Zero Data Loss Guarantee:**
   - Smart self-seeding: if a new Google Sheet is opened, the app uploads existing records into it automatically.
   - Point-in-time automated backups: every addition, modification, or deletion creates a timestamped duplicate in Google Drive under folder `Lorry_Backups`.

---

## 🔐 Dual-Layer Security & Roles Matrix

| Feature | Admin (`Shravan` / `Admin`) | Employee (`Rudra` / `RudraSarika@2505`) |
| :--- | :---: | :---: |
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

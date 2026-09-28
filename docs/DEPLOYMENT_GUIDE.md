# SR_T Lorry Freight Management - End-to-End Setup & Deployment Guide

This guide provides the complete documentation for the live production architecture, connecting **Google Cloud Sheets ➔ Google Apps Script Web App ➔ Multi-User Real-Time Sync Engine ➔ Vercel & Cloudflare Edge Deployments**.

---

## 🌐 Live Production Resources

* **Vercel Production Deployment:** [https://ytransport.vercel.app/](https://ytransport.vercel.app/)
* **Cloudflare Global Deployment:** [https://y.srtransport.workers.dev/](https://y.srtransport.workers.dev/)
* **Active Master Google Sheet:** [Connected Google Spreadsheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
* **Google Apps Script Web App URL:** `https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec`
* **Active Deployment ID:** `AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S` (Version 3)

---

## 🏗️ Architecture Flow

```
                      ┌─────────────────────────────────────────┐
                      │    SR_T Frontends (Vercel/Cloudflare)   │
                      │  Admin (Shravan) & Employee (Rudra)     │
                      └────────────────────┬────────────────────┘
                                           │
                        Bidirectional Real-Time Sync (4s & Focus)
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    Google Apps Script Web App API       │
                      │           (Code.gs Backend)             │
                      │   - Vehicle-scoped write validation     │
                      │   - 9-Expense calculation parity        │
                      │   - Overpayment protection              │
                      │   - Triggers Drive Clone Backups        │
                      └────────────────────┬────────────────────┘
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
          ┌─────────────────────────────┐     ┌─────────────────────────────┐
          │     Master Google Sheet     │     │      Google Drive Cloud     │
          │  Vehicles | Trips | Receipts│     │      (Lorry_Backups Folder) │
          └─────────────────────────────┘     └─────────────────────────────┘
```

---

## 🔐 Credentials & Access Control

| User | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `Shravan` | Administrator | Full access: View, Add, Edit, Delete, Settings, Cloud Backups, Excel Export |
| **Rudra** | `RudraSarika@2505` | Employee | View, Add, Edit, Filter, Excel Export. **Delete & Settings strictly blocked.** |

---

## ⚙️ Google Apps Script Backend Deployment

1. Open your connected Google Sheet: [1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit).
2. Go to **Extensions ➔ Apps Script**.
3. Paste the contents of `google-apps-script/Code.gs`.
4. Click **Deploy ➔ Manage deployments** (or **New deployment**).
5. Ensure:
   * **Execute as:** `Me`
   * **Who has access:** `Anyone` *(Crucial for multi-user CORS-free cloud sync)*
6. Copy the **Web App URL** and configure in the app settings.

---

## ⚡ Multi-User Real-Time Sync Engine (Mirroring `SR_T`)

* **Background Auto-Poller:** Queries cloud every 4 seconds to detect newly added or edited trips.
* **Focus Auto-Sync:** Checks for changes immediately when returning to the tab (`window.focus` & `visibilitychange`).
* **BroadcastChannel:** Instantly syncs tabs on the same device without requiring a page refresh.
* **Google Drive Auto-Cloning:** Every add, edit, or delete automatically duplicates the sheet into the `Lorry_Backups` folder with a precise timestamp.

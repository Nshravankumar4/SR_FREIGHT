# SR_T Lorry Freight & Broker Management System — Master Technical & User Reference

---

## 1. System Overview & Core Architecture

The **SR_T Lorry Freight & Broker Management System** is an enterprise-grade Single-Page Application (SPA) designed specifically for fleet logistics operations, broker reconciliation, driver trip commissions, and financial profitability auditing.

### Operational Data Flow Pipeline
```
┌─────────────────────────────────┐
│           Google Form           │ (Field dispatch / driver entry)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│     Google Form Responses 1     │ (Raw spreadsheet log)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│       Google Apps Script        │ (Code.gs Web App / doGet & doPost)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│       Trips Google Sheet        │ (Master database of 24 business columns)
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│       Web Dashboard (SPA)       │ (index.html + Tailwind CSS + js/app.js + ExcelJS)
└─────────────────────────────────┘
```

- **Frontend Tech Stack**: Vanilla HTML5, Tailwind CSS, Vanilla ES6+ JavaScript, and `ExcelJS` library (for styled native `.xlsx` exports).
- **Backend Tech Stack**: Google Apps Script (`Code.gs`) deployed as a Web App reading and writing to Google Sheets.
- **Form Factor Compatibility**: 100% responsive for Windows Chrome, Microsoft Edge, mobile browsers (Android / iOS), and tablets.

---

## 2. Top-to-Bottom Dashboard Structure

The layout is arranged in a full-width **Top-to-Bottom** flow:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP EXECUTIVE HEADER: Brand Logo, Sync, + ADD TRIP, DOWNLOAD EXCEL (.XLSX), Logout      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 1 (TOP FULL WIDTH): VIEW TRIPS (Operational Time Scope)                        │
│ [📌 TODAY]  [🗓️ SELECTED DATE]  [↔️ DATE RANGE]  [📆 ENTIRE MONTH]  [📋 ALL TRIPS]       │
│ Dynamic Inputs: Date Pickers, Date Range, or Month Selector with instant filter       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 2 (TOP FULL WIDTH): STATUS & AUDIT FILTERS (8 Big Vibrant Filter Cards)        │
│ 📋 ALL TRIPS       (Slate)       |  🆕 NEW DISPATCH    (Indigo)                         │
│ 🟢 PROFIT TRIPS    (Emerald)     |  🔴 LOSS TRIPS      (Rose)                           │
│ 🟠 PENDING BALANCE (Amber)       |  🟡 PARTIALLY PAID  (Orange)                         │
│ ✔️ PAID & SETTLED  (Teal)        |  ⚠️ BALANCE MISMATCH (Crimson Alert)                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 3: TRIPS RECONCILIATION & MASTER DATA TABLE (FULL 100% WIDTH)                  │
│ Search Bar | Active Scope Badge | Total Matching Trips Counter                         │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ [👁️ Details] [1. S.No] [2. Trip Date] [3. Vehicle No] ... [24. Route] [Actions]      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 4: TRIP DETAILS & AUDIT BREAKDOWN PANEL (LOCATED DOWN BELOW THE SHEET)         │
│ Rendered when user clicks '👁️ View' on any trip row in the table above:                 │
│ • Header: Trip #, Vehicle Badge, Route, Status, Quick Edit, Close Details             │
│ • 4 High-Impact Metric Cards: Freight, Advance Date/Amt, Balance/Mismatch, Net P/L    │
│ • 9-Expense Itemized Ledger Grid (TRSP Comm, Diesel, Toll, Loading, Unloading, etc.)   │
│ • Operational Notes: Halting / Detention details, TRSP Broker Agency Name              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Master Business Columns (Exact 24 Columns + Navigation)

The master table contains **exactly 24 standard business columns**, preceded by a dedicated **`👁️ Details`** column on the left and followed by an **Actions** column on the right:

| Column # | Header Name | Data Type | Formula / Source | Example Value |
|---|---|---|---|---|
| **NAV** | `👁️ Details` | Action Button | Opens complete report down below | `👁️ View` |
| **1** | `S.No.` | Number | Sequential Trip Index (1, 2, 3...) | `1` |
| **2** | `Trip Date` | Date (DD-MM-YYYY) | Dispatch date | `28-08-2026` |
| **3** | `Vehicle No` | String | Vehicle registration number | `TS15UE1122` |
| **4** | `From` | String | Origin location | `Hyderabad, Telangana` |
| **5** | `To` | String | Destination location | `Purnia, Bihar` |
| **6** | `Freight Amount` | Currency (₹) | Total agreed contract revenue | `₹1,00,000` |
| **7** | `Advance Date` | Date (DD-MM-YYYY) | Date advance was credited | `28-08-2026` |
| **8** | `Advance Amount` | Currency (₹) | Advance payment received | `₹90,000` |
| **9** | `Balance Amount` | Currency (₹) | **Auto:** `Freight Amount - Advance Amount` | `₹10,000` |
| **10** | `Halting Details` | Text | Halting, demurrage, or transit delay notes | `2 days halting` |
| **11** | `TRSP Name` | String | Transport broker or agency name | `MRC Logistics` |
| **12** | `TRSP Commission` | Currency (₹) | Broker commission fee | `₹2,000` |
| **13** | `Diesel` | Currency (₹) | Fuel expenses en route | `₹50,000` |
| **14** | `Toll Charges` | Currency (₹) | FASTag & toll booth charges | `₹10,000` |
| **15** | `Loading Charges` | Currency (₹) | Origin loading labour fees | `₹2,500` |
| **16** | `Unloading Charges` | Currency (₹) | Destination unloading labour fees | `₹2,500` |
| **17** | `Police Exp` | Currency (₹) | En-route checkpoint charges | `₹1,000` |
| **18** | `RTA C/P` | Currency (₹) | Transport authority checkpost charges | `₹1,000` |
| **19** | `Other Expenses` | Currency (₹) | Miscellaneous en-route expenses | `₹1,000` |
| **20** | `Driver Trip Commission` | Currency (₹) | Commission or trip wages paid to driver | `₹12,000` |
| **21** | `Status Amount` | Currency (₹) | Outstanding balance to collect / settled amt | `₹10,000` |
| **22** | `Status` | Enum | `New`, `Pending`, `Partially Paid`, `Paid` | `🟠 Pending` |
| **23** | `P/L` | Badge | **Auto:** `Freight - Total Expenses` | `P +₹18,000` |
| **24** | `Route` | String | Origin ➔ Destination concatenated | `Hyderabad ➔ Purnia` |
| **ACT** | `Actions` | Action Group | Auxiliary management (`✏️ Edit`, `🗑️ Delete`) | `✏️ Edit` / `🗑️ Delete` |

---

## 4. Financial Calculations & Audit Engine

### 1. Balance Amount Calculation
$$\text{Balance Amount} = \text{Freight Amount} - \text{Advance Amount}$$

### 2. Total En-Route Expenses Sum
$$\text{Total Expenses} = \sum_{i=1}^{9} \text{Expense}_i$$
Includes: `TRSP Commission` + `Diesel` + `Toll Charges` + `Loading Charges` + `Unloading Charges` + `Police Exp` + `RTA C/P` + `Other Expenses` + `Driver Trip Commission`.

### 3. Net Profit / Loss (P/L)
$$\text{Net P/L} = \text{Freight Amount} - \text{Total Expenses}$$
- If $\text{Net P/L} \ge 0$: Displayed as `P +₹<Amount>` in bold emerald green (`bg-emerald-50 text-emerald-800 border-emerald-300`).
- If $\text{Net P/L} < 0$: Displayed as `L -₹<Amount>` in bold rose red (`bg-rose-50 text-rose-800 border-rose-300`).

### 4. Automated Balance Mismatch Detection
Audits whether the recorded balance matches the mathematical difference:
$$\text{Is Mismatched} = \big| \text{Balance Amount} - (\text{Freight Amount} - \text{Advance Amount}) \big| > 0.01$$
- When mismatched, the table balance cell displays a `⚠️ Mismatch` alert pill.
- The sidebar counter for **⚠️ BALANCE MISMATCH** automatically increments, allowing one-click filtering for audit reconciliation.

---

## 5. Dedicated "View Details" Feature & Down-Sheet Panel

### How it Works:
1. In the master table, each row has a prominent **`👁️ View`** button located on the far left (before `1. S.No`).
2. When the user clicks **`👁️ View`**:
   - The selected table row is highlighted with a clear blue selection ring (`ring-2 ring-blue-500 bg-blue-100/70`).
   - The application automatically scrolls smoothly down to the **Trip Details & Audit Breakdown Panel** (`#trip-details-panel`) below the sheet.
3. **What is displayed in the Down-Sheet Details Panel**:
   - **Header Bar**: Trip ID index (`#1`), Vehicle Registration Number, Origin ➔ Destination, Current Status badge, a shortcut `✏️ Edit This Trip` button, and a `✕ Close` button.
   - **Discrepancy Banner**: If a balance mismatch exists, a prominent red alert card specifies both the recorded balance and expected balance.
   - **4 High-Impact Metric Cards**:
     1. `Freight Amount` with Trip Date.
     2. `Advance Amount` with Advance Date.
     3. `Balance Amount` with Status Amount.
     4. `Net Profit / Loss` with Profit Margin percentage.
   - **9-Expense Itemized Ledger**: A clean 3-column breakdown displaying every expense category with exact figures, followed by the total operational cost.
   - **Operational Logistics Notes**: Full text of Halting & Demurrage notes and Transport Broker Agency details.

---

## 6. Big Vibrant Status & Audit Filter Cards

Arranged in an 8-column responsive grid across the top of the dashboard:

| Button | Key Theme | Description | Live Badge Behavior |
|---|---|---|---|
| **📋 ALL TRIPS** | Slate / Dark | Shows all trips in the active time scope | Displays total trip count in active scope |
| **🆕 NEW DISPATCH** | Indigo | Newly entered trips awaiting processing | Tallies trips with status = `New` |
| **🟢 PROFIT TRIPS** | Emerald | Trips yielding positive returns ($\text{Net P/L} \ge 0$) | Tallies profitable trips |
| **🔴 LOSS TRIPS** | Rose | Trips where expenses exceeded revenue ($\text{Net P/L} < 0$) | Tallies loss-making trips |
| **🟠 PENDING BALANCE** | Amber | Trips with outstanding freight balance | Tallies trips with status = `Pending` |
| **🟡 PARTIALLY PAID** | Orange | Trips where partial balance was received | Tallies trips with status = `Partially Paid` |
| **✔️ PAID & SETTLED** | Teal | Trips fully reconciled and closed | Tallies trips with status = `Paid` |
| **⚠️ BALANCE MISMATCH** | Crimson Alert | Discrepancies where $\text{Freight} - \text{Advance} \ne \text{Balance}$ | Tallies audited mismatch records |

---

## 7. Interactive Modals & Safety Controls

1. **Authentication Guard**:
   - Session-based login protecting business financial data (`admin` / `admin`).
   - Session state preserved in browser `localStorage`.
2. **`+ ADD TRIP` Modal**:
   - Live recalculation preview for Balance, Total Expenses, and Net P/L as inputs are typed.
   - Defaults to `New` status.
   - Newly added trips are appended in ascending sequential chronological order (`S.No` 1, 2, 3, 4, 5...).
3. **Two-Step Safe Editing (`✏️ Edit`)**:
   - Click Edit ➔ Slide-over opens ➔ Edit values with live calculation ➔ Click **Save & Recalculate** ➔ Confirmation modal prompts: *"Are you sure you want to save changes to Trip #X?"* ➔ Confirm ➔ Toast success notification.
4. **Two-Step Safe Deletion (`🗑️ Delete`)**:
   - Click Delete ➔ Prompt modal asks for confirmation ➔ Confirm ➔ Soft-deleted from active view ➔ Toast success notification.
5. **True Styled Excel Export (`ExcelJS`)**:
   - Exports native `.xlsx` binary spreadsheet.
   - Column auto-fit width calculation prevents `###` text truncation on long route fields.
   - Preserves navy header row (`#1E293B`) and exact UI status / profit colors.

---

## 8. Quick Start & Deployment Guide

### Running Locally on Windows
```powershell
# Navigate to project directory
cd d:\Repo\Lorry

# Start local server on port 8000
py -m http.server 8000
```
Open `http://localhost:8000` in Google Chrome or Microsoft Edge.

### Deploying the Google Apps Script Backend
1. Open your master Google Sheet (containing `Trips` and `Form Responses 1` tabs).
2. Open **Extensions** ➔ **Apps Script**.
3. Paste the contents of `google-apps-script/Code.gs`.
4. Click **Deploy** ➔ **New deployment** ➔ Type: **Web app**.
5. Configure:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Click **Deploy** and copy the Web App URL.
7. Click the **API Settings (⚙️)** button in the web app header, paste the URL, and click Sync.

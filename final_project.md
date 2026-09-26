# SR_T Lorry Freight & Broker Management System — Final Master Reference

---

## 1. System Overview & Architecture

The **SR_T Lorry Freight & Broker Management System** is a business-focused logistics management single-page application (SPA). It provides freight tracking, en-route expense accounting, driver trip commissions, payment reconciliation, balance auditing, and true `.xlsx` reporting.

### Operational Data Flow Pipeline
```
┌─────────────────────────┐
│       Google Form       │ (Field dispatch / driver entry)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Google Form Responses 1 │ (Raw spreadsheet log)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Google Apps Script      │ (Code.gs Web App / doGet & doPost)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│   Trips Google Sheet    │ (Master database of 24 business columns)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│   Web Dashboard (SPA)   │ (index.html + Tailwind CSS + js/app.js + ExcelJS)
└─────────────────────────┘
```

- **Frontend Tech Stack**: Vanilla HTML5, Tailwind CSS (via CDN), Vanilla ES6+ JavaScript, and `ExcelJS` for true spreadsheet generation.
- **Backend Tech Stack**: Google Apps Script (`Code.gs`) deployed as a Web App reading and writing to Google Sheets.
- **Design Philosophy**: Fast loading, zero build-step overhead, responsive layout, clear business metrics, and high audit visibility.

---

## 2. Master Business Columns (Exact 24 Columns)

The table below describes the 24 standard business columns maintained across Google Forms, Google Sheets, the Web UI, and Excel Exports:

| # | Column Name | Data Type | Example Value | Description & Formula |
|---|---|---|---|---|
| **1** | `S.No.` | Number | `1` | Sequential trip index (sorted ascending: 1, 2, 3...) |
| **2** | `Trip Date` | Date (DD-MM-YYYY) | `28-08-2026` | Date of dispatch |
| **3** | `Vehicle No` | String | `TS15UE1122` | Truck registration number |
| **4** | `From` | String | `Hyderabad, Telangana` | Origin point |
| **5** | `To` | String | `Purnia, Bihar` | Destination point |
| **6** | `Freight Amount` | Currency (₹) | `₹1,00,000` | Agreed contract freight revenue |
| **7** | `Advance Date` | Date (DD-MM-YYYY) | `28-08-2026` | Date advance payment was received |
| **8** | `Advance Amount` | Currency (₹) | `₹90,000` | Upfront cash/transfer received |
| **9** | `Balance Amount` | Currency (₹) | `₹10,000` | **Auto-calculated:** `Freight Amount - Advance Amount` |
| **10** | `Halting Details` | Text | `Two days halting during transit` | Delays, detention, or demurrage notes |
| **11** | `TRSP Name` | String | `MRC Logistics` | Transport agency / broker name |
| **12** | `TRSP Commission` | Currency (₹) | `₹2,000` | Broker commission fee paid |
| **13** | `Diesel` | Currency (₹) | `₹50,000` | Fuel expenditure en route |
| **14** | `Toll Charges` | Currency (₹) | `₹10,000` | FASTag and manual toll fees |
| **15** | `Loading Charges` | Currency (₹) | `₹2,500` | Labour and loading charges at origin |
| **16** | `Unloading Charges` | Currency (₹) | `₹2,500` | Unloading labour charges at destination |
| **17** | `Police Exp` | Currency (₹) | `₹1,000` | En-route checkpoint charges |
| **18** | `RTA C/P` | Currency (₹) | `₹1,000` | Regional Transport Authority / Checkpost charges |
| **19** | `Other Expenses` | Currency (₹) | `₹1,000` | Miscellaneous maintenance, tyre repairs, food |
| **20** | `Driver Trip Commission` | Currency (₹) | `₹12,000` | Payment / commission paid to driver |
| **21** | `Status Amount` | Currency (₹) | `₹10,000` | Remaining balance to collect / settled amount |
| **22** | `Status` | Enum | `Pending`, `Done`, `Partial`, `New` | Current collection status |
| **23** | `P/L` | Currency Badge | `P +₹18,000` or `L -₹56,685` | **Auto-calculated:** `Freight - Total Expenses` |
| **24** | `Route` | String | `Hyderabad, Telangana ➔ Purnia, Bihar` | Concatenated origin and destination |

> **Note on Actions Column**: An auxiliary **Actions** column (`✏️ Edit`, `🗑️ Delete`) is provided in the Web UI for managing records without altering the 24 business data columns.

---

## 3. Financial & Accounting Calculation Logic

### 1. Balance Amount
$$\text{Balance Amount} = \text{Freight Amount} - \text{Advance Amount}$$

### 2. Total En-Route Expenses
$$\text{Total Expenses} = \sum (\text{TRSP Commission} + \text{Diesel} + \text{Toll} + \text{Loading} + \text{Unloading} + \text{Police} + \text{RTA C/P} + \text{Other} + \text{Driver Commission})$$

### 3. Net Profit / Loss (P/L)
$$\text{Net P/L} = \text{Freight Amount} - \text{Total Expenses}$$
- If $\text{Net P/L} \ge 0$: Displayed as `P +₹<Amount>` in bold emerald green (`bg-emerald-50 text-emerald-800 border-emerald-300`).
- If $\text{Net P/L} < 0$: Displayed as `L -₹<Amount>` in bold rose red (`bg-rose-50 text-rose-800 border-rose-300`).

### 4. Automated Balance Mismatch Detection
To prevent spreadsheet entry human error, the system continuously audits every record:
$$\text{Is Mismatched} = \big| \text{Balance Amount} - (\text{Freight Amount} - \text{Advance Amount}) \big| > 0.01$$
- When mismatched, the UI highlights the balance cell with a `⚠️ Mismatch` warning badge.
- The sidebar dynamically updates the **⚠️ BALANCE MISMATCH** counter, allowing fleet managers to filter and reconcile faulty entries with a single click.

---

## 4. UI Dashboard Architecture (Two-Column Layout)

The dashboard layout is split into two primary areas on desktop displays (`lg:grid-cols-12`):

```
┌──────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ LEFT SIDEBAR (col-span-4 / col-span-3) │ RIGHT MAIN PANEL (col-span-8 / col-span-9)             │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. TIME SCOPE SELECTOR (VIEW TRIPS)  │ 1. Real-time Search Input                              │
│    - Today                           │ 2. Active Scope & Filter Badges                        │
│    - Selected Date (Calendar Picker) │ 3. Filter Result Counts                                │
│    - Date Range (From - To)          │ 4. Master 24-Column Scrollable Table                   │
│    - Entire Month (YYYY-MM)          │    - Sticky table header                               │
│    - All Trips                       │    - Dynamic status pills                              │
│                                      │    - Formatted Indian Rupee currency (₹)               │
│ 2. 8 BIG ACTION/AUDIT BUTTONS        │    - Two-step Edit and Delete buttons                  │
│    - 📋 ALL TRIPS                    │                                                        │
│    - 🆕 NEW                          │                                                        │
│    - 🟢 PROFIT TRIPS                 │                                                        │
│    - 🔴 LOSS TRIPS                   │                                                        │
│    - 🟠 PENDING                      │                                                        │
│    - 🟡 PARTIALLY PAID               │                                                        │
│    - 🟢 PAID & SETTLED               │                                                        │
│    - ⚠️ BALANCE MISMATCH             │                                                        │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### Why this design?
1. **No Cluttered Top Banners**: All redundant summary metric cards (`TOTAL FREIGHT`, `TOTAL ADVANCE`, `TOTAL BALANCE`, etc.) and the outstanding balance banner have been removed.
2. **Instant Operational Focus**: Clicking any big filter button instantly isolates trips needing attention (e.g. all `Pending` balances or all `Balance Mismatches`).
3. **Responsive Stacking**: On mobile or tablet devices, the sidebar smoothly stacks above the main data table.

---

## 5. Key Workflows & Features

### 1. Authentication
- Session-based access control protecting fleet financial data.
- Built-in credentials:
  - **Username**: `admin`
  - **Password**: `srt@123`
- Session persistence via browser `sessionStorage`.

### 2. Adding a Trip (`+ ADD TRIP`)
1. Click the **+ ADD TRIP** button in the top header.
2. Fill in the modal inputs (Vehicle No, Dates, From, To, Freight, Advance, Expenses).
3. The modal provides real-time preview calculation of **Balance**, **Total Expenses**, and **Net Profit/Loss**.
4. Status defaults to `New` (or choose `Pending`, `Done`, `Partial`).
5. Upon saving:
   - Trip is appended with an incremented S.No.
   - Trips are sorted **chronologically by S.No ascending (1, 2, 3, 4, 5...)** so new records appear in sequence without jumping to the top unexpectedly.
   - Instant toast notification confirms creation.

### 3. Two-Step Safe Editing (`✏️ Edit`)
1. Click **✏️ Edit** on any trip row to open the editing slide-over drawer.
2. Modify any field; changes automatically recalculate the live P/L preview.
3. Clicking **Save & Recalculate** displays a **confirmation modal** asking:
   > *"Are you sure you want to save changes to Trip #X (Vehicle)?"*
4. Confirming saves the record and presents a success message.

### 4. Safe Deletion Workflow (`🗑️ Delete`)
1. Click **🗑️ Delete** on any trip row.
2. A security modal prompts:
   > *"Are you sure you want to delete Trip #X (Vehicle)? This action cannot be undone."*
3. Once confirmed, the trip is removed from the dataset, filters recalculate, and a success confirmation appears.

### 5. True Excel Export (`.xlsx` with ExcelJS)
- Replaces outdated `.csv` downloads which caused `###` overflow errors on long route descriptions and lost all styling.
- Features:
  - Generates a native binary `.xlsx` workbook.
  - Formatted navy blue header row (`#1E293B`) with white bold text.
  - Auto-calculated column widths preventing text truncation.
  - Preserves exact UI color fills for status tags (`Done`, `Pending`, `Partial`, `New`) and Net Profit/Loss cells.
  - Formats financial amounts as standard currency.

### 6. Google Apps Script Backend Integration
The project includes a ready-to-deploy Google Apps Script in `google-apps-script/Code.gs`:
- `doGet(e)`: Serves the current trips dataset in JSON format.
- `doPost(e)`: Accepts actions (`addTrip`, `updateTrip`, `deleteTrip`, `syncBatch`) to write directly to the **Trips** sheet.

---

## 6. How to Run & Deploy

### Running Locally
To test the web application on your local machine using Python's built-in HTTP server:
```powershell
# Navigate to the project directory
cd d:\Repo\Lorry

# Start local server on port 8000
py -m http.server 8000
```
Open your browser at:
```
http://localhost:8000
```

### Deploying the Google Apps Script Backend
1. Open your master Google Sheet (containing `Trips` sheet and `Form Responses 1`).
2. Go to **Extensions** ➔ **Apps Script**.
3. Copy the contents of `google-apps-script/Code.gs` into the script editor.
4. Click **Deploy** ➔ **New deployment**.
5. Select type: **Web app**.
6. Set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
7. Click **Deploy** and copy the generated Web App URL.
8. Paste the Web App URL into `CONFIG.GAS_URL` in `js/app.js`:
   ```javascript
   const CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
     ...
   };
   ```

---

## 7. Quality Assurance Checklist

- [x] Summary metric boxes (`TOTAL FREIGHT`, `TOTAL ADVANCE`, etc.) completely removed.
- [x] `TOTAL OUTSTANDING BALANCE` banner completely removed.
- [x] Left sidebar layout cleanly organized with time scopes and 8 big filter buttons.
- [x] `New` status fully supported with modern indigo badge styling.
- [x] Balance mismatch algorithm flags `Freight - Advance != Balance` and tallies mismatches.
- [x] Newly added trips append in chronological order (S.No ascending: 1, 2, 3, 4, 5...).
- [x] Excel export outputs true `.xlsx` with auto-fit widths and preserved badge colors.
- [x] Two-step confirmation popups for both Edit and Delete actions.
- [x] 100% bracket and code syntax validated.

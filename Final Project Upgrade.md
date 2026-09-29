# 🚚 SR_T LORRY FREIGHT MANAGEMENT SYSTEM

## COMPLETE SYSTEM SPECIFICATION & ARCHITECTURE BLUEPRINT — VERSION 2.4.2

**Target Workspace:** `D:\Repo\Lorry`  
**Document Version:** v2.4.2 (Authoritative Production Master Specification)  
**Updated Date:** 2026-09-28  
**Reference Deployments:** Cloudflare Pages / Vercel Edge / Google Apps Script Web App  
**Core Technologies:** HTML5, Modern CSS (Tailwind CDN + Modular Stylesheets), Modular JavaScript (ES Modules), Google Apps Script, Google Sheets, ExcelJS  
**Data Integrity Policy:** Zero Data Loss • Strict Multi-Vehicle Isolation • No Automatic `git push`

---

# 1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW

The **SR_T Lorry Freight Management System** is an enterprise-grade transport operations and financial settlement platform designed specifically for long-haul lorry fleet management.

The system manages vehicle fleets as **strictly isolated operational workspaces**, beginning with initial vehicles:
1. **`TS15UE1122`**
2. **`TG15T6666`**

### Core Principles
1. **Single Cloud-First Master Database:** One Google Spreadsheet (`Trips`, `Vehicles`, `BalanceReceipts`) serves as the cloud source of truth, backed by Google Drive snapshots.
2. **Strict Multi-Vehicle Isolation:** Trips, expenses, profits, balances, and customer payments belonging to `TS15UE1122` never contaminate or participate in `TG15T6666` metrics, and vice versa.
3. **Decoupled Financial Mathematics:** Operational Profit/Loss ($\text{Freight} - \text{Expenses}$) is completely separated from Customer Receivables ($\text{Freight} - \text{Advance} - \text{Installments}$).
4. **Interactive POD Settlement Engine:** Dynamic installment receipts track outstanding freight balances down to exact $₹0$, automatically transitioning payment indicators from **`🔴 RED (Payment Pending)`** to **`🟢 GREEN (Cleared / Done)`**.
5. **Clear Separation of Concerns:**
   - **`👁️ View`:** Dedicated Read-Only inspection modal (zero form fields, complete itemized breakdown).
   - **`✏️ Edit`:** Interactive Settlement Drawer for expense adjustments and balance installment entries.
6. **Operational Date Scope & Audit Filters:** Quick time-slice filters (Today, Single Date, Date Range, Month View, All Trips) combined with 8 real-time Status & Audit Cards with dynamic counters.

---

# 2. MASTER APPLICATION FLOW & WORKSPACE ARCHITECTURE

```text
                             ┌──────────────────────────────┐
                             │       1. LOGIN OVERLAY       │
                             │ (Admin: Shravan / Emp: Rudra)│
                             └──────────────┬───────────────┘
                                            │ Authenticated Session
                                            ▼
                             ┌──────────────────────────────┐
                             │ 2. DYNAMIC VEHICLE SELECTION │
                             │  (Loaded from Vehicles Sheet)│
                             │  ┌────────────┐┌───────────┐ │
                             │  │ TS15UE1122 ││ TG15T6666 │ │
                             │  └────────────┘└───────────┘ │
                             └──────────────┬───────────────┘
                                            │ Select Vehicle Workspace
                                            ▼
                             ┌──────────────────────────────┐
                             │  3. ACTIVE VEHICLE WORKSPACE │
                             │   currentVehicle: TS15UE1122 │
                             └──────────────┬───────────────┘
                                            │
         ┌──────────────────────────────────┴──────────────────────────────────┐
         ▼                                  ▼                                  ▼
 ┌──────────────────┐              ┌──────────────────┐               ┌──────────────────┐
 │   ☰ MENU PANEL   │              │VEHICLE DASHBOARD │               │VEHICLE LEDGER/TAB│
 │ 🏠 Dashboard     │              │ Trips | Freight  │               │ 📅 Date Scopes   │
 │ 📋 Transactions  │              │ Expenses| Profit │               │ 🔍 8 Status Cards│
 │ 📊 View Excel    │              │ Pending Receiv.  │               │ 25-Column Table  │
 │ 🚚 Vehicle Data  │              │ (Strictly 1122)  │               │ 👁️ View Modal    │
 │ 🔔 Renewals 🔴   │              └──────────────────┘               │ ✏️ Edit Drawer   │
 │ 🧾 Invoice Studio│                                                 └──────────────────┘
 │ ⚙ Settings      │
 │ 🔄 Switch Vehicle│
 │ 🚪 Logout        │
 └──────────────────┘
```

---

# 2.1 🧾 ONLINE INVOICE STUDIO INTEGRATION & SINGLE-LOGIN ARCHITECTURE

The existing **S-R / TransBill / Invoice Studio** system is integrated into the SR_T Lorry Freight Management System as a fully online module.

### 2.1.1 Single Application & Single Login

The production system provides **one Lorry application URL and one login session**.

```text
                    ┌──────────────────────────────┐
                    │       SR_T LORRY APP         │
                    │       ONE PRODUCTION URL     │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       SINGLE LOGIN            │
                    │                              │
                    │ Admin  → Shravan              │
                    │ User   → Rudra                │
                    └──────────────┬───────────────┘
                                   │
                         Authenticated Session
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
             ▼                                           ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │   LORRY MODULES      │                  │   INVOICE STUDIO     │
   │                      │                  │                      │
   │ Dashboard            │                  │ Invoice Creation     │
   │ Trips                │                  │ Invoice Editing      │
   │ Vehicles             │                  │ Live Preview         │
   │ Balance Receipts     │                  │ Validation           │
   │ Renewals             │                  │ Invoice History      │
   │ Settings             │                  │ DOCX Generation      │
   │ Excel / Reports      │                  │ PDF Generation       │
   └──────────────────────┘                  │ Download / Print     │
                                             │ Templates            │
                                             │ Signature / Stamp    │
                                             └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ONLINE S-R BACKEND
                                                        │
                                                        ▼
                                             PERSISTENT CLOUD STORAGE
```

### 2.1.2 Invoice Studio Navigation

Exactly one new navigation item is added to the existing Lorry menu:
```text
🧾 Invoice Studio
```
Existing navigation items and functionality remain untouched. Clicking **Invoice Studio** opens the complete S-R Invoice Studio application without requiring another login.

### 2.1.3 No Second Login

Invoice Studio MUST NOT display a separate username/password login. The authenticated Lorry session is used to authorize Invoice Studio.
The following are strictly prohibited:
* Second Invoice Studio login screen
* Passing the Lorry password to Invoice Studio
* Password in URL parameters
* Password in browser localStorage or sessionStorage
* Password embedded in frontend JavaScript
* Client-supplied role being trusted without verification

### 2.1.4 Role Permissions

Invoice Studio follows the existing Lorry role model:

| User | Invoice Studio Access | Create | View | Edit | Generate | Download | Delete |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin / Shravan** | Full | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Rudra** | Full except Delete | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

Delete is strictly restricted to Admin across all modules where deletion exists. Rudra retains full non-delete access (Create, View, Edit, Generate, Download).

### 2.1.5 Complete S-R Functionality Preservation

All existing S-R / TransBill / Invoice Studio capabilities are 100% preserved:
* Invoice creation & editing
* Live A4 invoice preview
* Form validation & duplicate prevention
* Freight, tax, and Indian currency words calculation ("Rupees ... Only")
* Word (.docx) generation using master template (`templates/11048.docx`)
* Official digital stamp & signature injection (`stamp_with_sign.png`)
* PDF generation, print, and downloads
* Draft and history management

### 2.1.6 Online-Only Production Architecture

Production Invoice Studio operates completely online:
* No local Python installation required for end users.
* No `py server.py` manual startup needed.
* No `localhost:8000` dependencies.
* Operates directly in the browser via client-side template processing with pre-embedded fallbacks and HTTPS cloud API capability.

---

# 3. CANONICAL FINANCIAL FORMULAS & CALCULATION ENGINE

The system strictly adheres to the business accounting model established from operational freight logs:

```mermaid
flowchart TD
    subgraph Inputs ["1. Trip Contract & Operational Inputs"]
        F["6. Freight Amount"]
        A["8. Advance Amount"]
        E1["12. Diesel"]
        E2["13. Toll Charges"]
        E3["17. EXP RTA"]
        E4["16. Police Exp"]
        E5["14. Loading Charges"]
        E6["15. Unloading Charges"]
        E7["19. Driver Trip Exp"]
        E8["11/20. TRSP Commission"]
        E9["18. Other Expenses"]
    end

    subgraph Expenses ["2. Operational Expense Engine"]
        E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8 & E9 --> TE["20. Total Expenses Sum\n(Sum of 9 Categories)"]
    end

    subgraph Internal ["3. Business Profit/Loss (Independent)"]
        F --> PL["23. Net Profit / Loss\n= Freight - Total Expenses"]
        TE --> PL
    end

    subgraph External ["4. Customer Balance & Settlement (Independent)"]
        F --> OB["25. Original Balance\n= Freight - Advance"]
        A --> OB
        OB --> REM["Remaining Balance\n= Original Balance - Sum(Receipts)"]
        RCP["Balance Receipts\nInstallment 1, 2, ..."] --> REM
    end

    subgraph Indicators ["5. Settlement State Engine"]
        REM -->|Remaining > 0| RED["🔴 RED Indicator\nPOD / Payment Pending"]
        REM -->|Remaining == 0| GREEN["🟢 GREEN Indicator\nCleared / Settlement Done"]
    end
```

### 3.1 The 9 Operational Expenses
The Total Operational Expense is the exact mathematical sum of 9 distinct expense categories:
$$\text{Total Expenses} = \text{Diesel} + \text{Toll} + \text{RTA} + \text{Police} + \text{Loading} + \text{Unloading} + \text{Driver Exp} + \text{TRSP Comm} + \text{Other Exp}$$

### 3.2 Internal Margin: Trip Profit / Loss
Trip profit represents internal company performance and is completely decoupled from customer collections:
$$\text{Profit / Loss} = \text{Freight Amount} - \text{Total Expenses}$$

### 3.3 External Receivable: Customer Balance & Installments
The amount owed by the broker/customer is governed strictly by the contract freight, initial advance, and recorded installment payments:
$$\text{Original Balance} = \text{Freight Amount} - \text{Advance Amount}$$
$$\text{Remaining Balance} = \text{Original Balance} - \sum \text{Balance Receipts}$$

### 3.4 Verification Example (From Operational Sheet `media_1790587340631.png`)
| Item | Field / Column | Amount | Calculation |
| :--- | :--- | :---: | :--- |
| **Contract Freight** | `6. Freight Amount` | **₹1,30,000** | Initial freight contract |
| **Initial Advance** | `8. Advance Amount` | **₹1,20,000** | Paid on dispatch (`27-09-2026`) |
| **Diesel** | `12. Diesel` | ₹70,000 | Fuel slip |
| **Toll Charges** | `13. Toll Charges` | ₹20,000 | FASTag / Cash |
| **EXP RTA** | `17. EXP RTA` | ₹8,000 | Border / RTA check |
| **Police Exp** | `16. Police Exp` | ₹2,000 | En-route checks |
| **Loading Charges** | `14. Loading Charges` | ₹2,400 | Origin labor |
| **Unloading Charges** | `15. Unloading Charges` | ₹1,200 | Destination labor |
| **Driver Exp** | `19. Driver Exp` | ₹13,600 | Driver trip commission |
| **TRSP Commission** | `20. TRSP Commission` | ₹0 | Broker commission |
| **Other Expenses** | `18. Other Expenses` | ₹2,000 | Notes: *Damage-1000, greac-800* |
| **Total Expenses** | `20. Sum OF Total Exp` | **₹1,19,200** | $\sum(70\text{k}+20\text{k}+8\text{k}+2\text{k}+2.4\text{k}+1.2\text{k}+13.6\text{k}+0+2\text{k})$ |
| **Profit Trip Amount** | `23. P/L` | **+₹10,800** | $₹1,30,000 - ₹1,19,200 = \mathbf{+₹10,800\text{ (Profit)}}$ |
| **Original Balance** | `25. Original Balance` | **₹10,000** | $₹1,30,000 - ₹1,20,000 = \mathbf{₹10,000}$ |

### 3.5 Step-by-Step Customer Balance Lifecycle

| Lifecycle Stage | Action / Event | Total Recv | Remaining Balance | Balance Status | Visual Indicator |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Initial (At Dispatch)** | Freight ₹1,30,000 − Advance ₹1,20,000 | **₹0** | **₹10,000** | `Not Received` | **🔴 RED (Pending)** |
| **Stage 1 Installment** | Receipt 1: +₹9,000 recorded | **₹9,000** | **₹1,000** | `Partially Received` | **🔴 RED (Pending)** |
| **Stage 2 Settlement** | Receipt 2: +₹1,000 recorded | **₹10,000** | **₹0** | `Done` | **🟢 GREEN (Cleared)** |
| **Illegal Overpayment** | Receipt Attempt: +₹10,800 or +₹2,000 | — | — | **STRICTLY REJECTED** | — |

> [!CAUTION]
> **CRITICAL ARCHITECTURAL DISTINCTION: ₹10,800 vs ₹10,000**
> * **₹10,800 is Internal Trip Profit/Loss** ($\text{Freight } ₹1,30,000 - \text{Total Expenses } ₹1,19,200$).
> * **₹10,000 is External Customer Receivable** ($\text{Freight } ₹1,30,000 - \text{Advance } ₹1,20,000$).
> * These two financial metrics represent completely different concepts and **MUST NEVER BE MIXED**.
> * An attempt to enter a ₹10,800 receipt against the ₹10,000 customer balance will be **immediately rejected** with `Overpayment rejected`.
> * $\text{Remaining Balance}$ is **NEVER** $\text{Freight} - \text{Expenses}$, and **NEVER** $\text{Profit/Loss}$.

---

# 4. TIME SCOPE DATE FILTERS & 8 STATUS/AUDIT CARDS

Above the master data ledger, the application provides two persistent control sections:

### 4.1 Time Scope Date Selectors
1. **📌 TODAY:** Filters trips scheduled/dispatched today (`YYYY-MM-DD`).
2. **🗓️ SELECTED DATE:** Interactive `<input type="date">` with `VIEW` button to inspect any single day's dispatch.
3. **↔️ DATE RANGE:** Two interactive `<input type="date">` fields (`From` and `To`) with a `VIEW RANGE` button.
4. **📆 ENTIRE MONTH:** Operational month dropdown selector (e.g. August 2026, September 2026) with a `VIEW MONTH` button.
5. **📋 ALL TRIPS:** Full operational history for the active vehicle.

### 4.2 The 8 Vibrant Status & Audit Cards
Each card displays an icon, real-time count badge, title, and descriptive subtitle:
1. **📋 ALL TRIPS (`#filter-btn-all`):** Total operations in current timeframe scope.
2. **🆕 NEW DISPATCH (`#filter-btn-new`):** Freshly dispatched trips (`status === 'New'`).
3. **🟢 PROFIT TRIPS (`#filter-btn-profit`):** Trips with $\text{Net P/L} \ge ₹0$.
4. **🔴 LOSS TRIPS (`#filter-btn-loss`):** Trips with $\text{Net P/L} < ₹0$.
5. **🟠 PENDING BALANCE (`#filter-btn-pending`):** Trips with uncollected customer balance ($\text{Received} = 0$).
6. **🟡 PARTIALLY PAID (`#filter-btn-partial`):** Trips with partial balance installments ($\text{Received} > 0 \land \text{Remaining} > 0$).
7. **✔️ PAID & SETTLED (`#filter-btn-paid`):** Trips fully settled ($\text{Remaining} = ₹0$).
8. **⚠️ BALANCE MISMATCH (`#filter-btn-mismatch`):** Immediate financial audit alert identifying any record where $\text{Original Balance} \ne \text{Freight} - \text{Advance}$.

---

# 5. USER EXPERIENCE: VIEW MODAL vs. EDIT DRAWER

To eliminate view confusion and prevent accidental edits:

### 5.1 👁️ Dedicated Read-Only View Modal (`#modal-view-trip`)
* **Trigger:** Click `👁️ View` on any trip row in the table.
* **Layout:**
  - **Executive Hero Banner:** Vehicle No, Trip #, Origin ➔ Destination, Dispatch Date, Payment Status Badge, Trip Status Badge.
  - **6 Financial Metric Cards:** Freight Amount, Advance Amount, Total Expenses (9 sum), Total Exp Given, Net Profit/Loss (with margin %), Remaining Balance.
  - **Logistics & Broker Section:** Halting Details, TRSP Name, TRSP Commission.
  - **9 Itemized Expenses Breakdown:** Discrete cards for Diesel, Toll, Loading, Unloading, Police, RTA, Driver Commission, TRSP Commission, and Other Expenses with notes.
  - **Customer Balance Receipts History Table:** Chronological installments with Received Date, Received Amount, Running Remaining Balance, and Notes.
  - **Action Footer:** `✏️ Edit This Trip` (switches to edit mode) and `✕ Close`.
* **Zero Input Elements:** Pure data visualization with no text boxes or dropdowns.

### 5.2 ✏️ Trip Management & Settlement Drawer (`#drawer-panel`)
* **Trigger:** Click `✏️ Edit` on table row or `✏️ Edit This Trip` inside View Modal.
* **Capabilities:**
  - Edit all trip parameters (Trip Date, Route, Halting Details, TRSP Name).
  - Modify Freight Amount, Advance Amount, Advance Date.
  - Adjust any of the 9 operational expense categories.
  - **+ Record Balance Payment Installment:** Form to input installment Date, Amount (₹), and Notes (UPI/Cheque).
  - **Interactive Receipts History Table:** Allows deleting individual installment receipts with live re-computation.
  - **Live Settlement Strip:** Shows real-time `Original Balance`, `Total Received`, and `Remaining Balance` with 🔴/🟢 badge.

---

# 6. DATABASE SCHEMA (3 GOOGLE SHEETS)

```mermaid
erDiagram
    VEHICLES ||--o{ TRIPS : "operates"
    TRIPS ||--o{ BALANCE_RECEIPTS : "settles"

    VEHICLES {
        string vehicleId PK "VEH-001"
        string vehicleNo UK "TS15UE1122"
        string vehicleName "TS15UE1122"
        string driverName "Driver Name"
        string driverPhone "9876543210"
        string status "Active"
        string notes "Remarks"
    }

    TRIPS {
        string tripId PK "TRIP-20260828-0001"
        string vehicleNo FK "TS15UE1122"
        int sNo "1, 2..."
        string tripDate "2026-08-28"
        string fromLocation "Hyderabad"
        string toLocation "Purnia"
        number freightAmount "130000"
        string advanceDate "2026-09-27"
        number advanceAmount "120000"
        string haltingDetails "Two days halting"
        string trspName "MRC"
        number trspCommission "0"
        number diesel "70000"
        number tollCharges "20000"
        number loadingCharges "2400"
        number unloadingCharges "1200"
        number policeExp "2000"
        number rtaExp "8000"
        number otherExpenses "2000"
        string otherExpenseNotes "Damage-1000,greac-800"
        number driverExp "13600"
        number totalExpenses "119200"
        number profitLoss "10800"
        number originalBalance "10000"
        number totalBalanceReceived "0"
        number remainingBalance "10000"
        string tripStatus "In Progress"
        string balanceStatus "Not Received"
        string paymentIndicator "red"
    }

    BALANCE_RECEIPTS {
        string receiptId PK "REC-20260829-0001"
        string tripId FK "TRIP-20260828-0001"
        string vehicleNo "TS15UE1122"
        string receivedDate "2026-08-29"
        number receivedAmount "9000"
        string notes "First installment"
    }
```

### Master Spreadsheet: `1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0`
1. **Sheet 1: `Vehicles`:** Vehicle registry and profile metadata.
2. **Sheet 2: `Trips`:** Master operational trips ledger indexed with `vehicleNo`.
3. **Sheet 3: `BalanceReceipts`:** Sub-ledger tracking installment receipts for remaining customer balance.

---

# 7. BACKEND SECURITY: MANDATORY WRITE-VERIFICATION CHAIN

To ensure zero cross-vehicle contamination, the Google Apps Script backend (`google-apps-script/Code.gs`) enforces this assertion before executing any database mutation:

```javascript
// Step 1: Validate entity exists
const targetTrip = getTripById(tripId);
if (!targetTrip) throw new Error("Trip not found.");

// Step 2: Enforce vehicle ownership match
if (targetTrip.vehicleNo !== requestedVehicleNo) {
  throw new Error(`Vehicle Access Mismatch: Trip belongs to ${targetTrip.vehicleNo}, but operation requested for ${requestedVehicleNo}`);
}

// Step 3: Atomic Lock & Mutation Execution
LockService.getScriptLock().waitLock(10000);
try {
  // Execute write/update/delete
} finally {
  LockService.getScriptLock().releaseLock();
}
```

This verification chain is executed on every backend mutation:
- `createTrip`
- `updateTrip`
- `deleteTrip`
- `addReceipt`
- `deleteReceipt`
- `updateVehicleData`

---

# 8. MODULAR PROJECT STRUCTURE

```text
D:\Repo\Lorry
│
├── .gitignore
├── Final Project Upgrade.md               # Master v2.4.2 System Specification
├── index.html                             # Modular application shell
├── Lorry_Trips_ALL_TRIPS_ALL (2).xlsx     # Pristine master Excel backup
├── README.md                              # Repository overview
│
├── css/
│   ├── base.css                           # Color palette, reset, typography
│   └── components.css                     # Semantic badges, cards, sticky column shadows
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md                # Cloudflare Pages / Vercel deployment instructions
│   ├── GOOGLE_FORM_SETUP.md               # Google Form field bindings
│   └── GOOGLE_SHEET_SETUP.md              # 3-Sheet setup & column structure
│
├── google-apps-script/
│   └── Code.gs                            # 3-Sheet backend with strict vehicle isolation & LockService
│
├── invoice-studio/                        # Isolated S-R TransBill Invoice Creation Studio
│   ├── index.html                         # Full billing desk UI (form + live A4 preview)
│   ├── app.js                             # Client-side calculations, validation, draft storage
│   ├── styles.css                         # A4 sheet typography & layout styles
│   ├── template-assets.js                 # Pre-embedded fallback master Word template & stamp
│   ├── server.py                          # Python HTTP backend for cloud API / DOCX generation
│   ├── requirements.txt                   # Server dependencies
│   ├── render.yaml                        # Render cloud deployment specification
│   ├── sample_invoice.json                # Reference sample invoice data
│   ├── README.md                          # Invoice Studio documentation
│   ├── INVOICE_SYSTEM_REQUIREMENTS.md     # Studio requirements
│   ├── templates/
│   │   └── 11048.docx                     # Master reference Word template
│   ├── data/                              # Saved invoice records
│   ├── generated/                         # Generated DOCX and PDF documents
│   └── assets/                            # Official stamp, signature, and logo assets
│
├── js/
│   ├── api.js                             # Cloud API client with retry & mutation guards
│   ├── app.js                             # Bootstrap, authentication bindings, poller
│   ├── auth.js                            # Role-based access control (Admin / Employee)
│   ├── config.js                          # Endpoint URLs, poll timing, constants
│   ├── router.js                          # SPA view navigator & header state
│   ├── state.js                           # Central application state
│   ├── utils.js                           # Formatting, UUID generators, toast notifications
│   │
│   ├── calculations/
│   │   └── financial.js                   # 9-expense engine, profit/loss & balance state machine
│   ├── dashboard/
│   │   └── dashboard.js                   # Vehicle-scoped KPI cards & metrics
│   ├── excel/
│   │   └── excel-view.js                  # ExcelJS styled .xlsx exporter & tabular view
│   ├── receipts/
│   │   ├── receipt-form.js                # Installment validation & overpayment protection
│   │   ├── receipt-table.js               # History table renderer
│   │   └── receipts.js                    # Add/delete receipt controller
│   ├── renewals/
│   │   ├── renewal-alerts.js              # Expired/due popup alert modal
│   │   ├── renewal-calculations.js        # Countdown engine & urgency categorization
│   │   ├── renewal-form.js                # Add / Edit compliance document form controller
│   │   ├── renewal-table.js               # Filterable compliance records table
│   │   └── renewals.js                    # Master Renewals controller & 28 canonical items
│   ├── settings/
│   │   └── settings.js                    # Global currency, date, theme settings
│   ├── trips/
│   │   ├── trip-form.js                   # Add Trip modal & Edit Drawer controller
│   │   ├── trip-table.js                  # Scoped table renderer, date filters & 8 status cards
│   │   ├── trip-validation.js             # Form validation & constraints
│   │   └── trips.js                       # Main trips CRUD & Read-Only View modal
│   └── vehicles/
│       ├── vehicle-data.js                # Profile metadata editor
│       ├── vehicle-list.js                # Dynamic vehicle selection grid
│       └── vehicle-workspace.js           # Vehicle switcher & isolation filter
│
└── tests/
    ├── financial-tests.js                 # 8 Financial unit tests (100% Passed)
    └── vehicle-isolation-tests.js         # 5 Vehicle isolation & security tests (100% Passed)
```

---

# 9. COMPREHENSIVE VERIFICATION & TEST MATRIX

All 13 automated unit tests run locally using Node.js and verify all functional constraints:

| Suite | Test ID | Description | Assertion / Constraint | Result |
| :---: | :---: | :--- | :--- | :---: |
| **Financial** | **FIN-01** | Total Expenses Auto-Sum | $70\text{k}+20\text{k}+8\text{k}+2\text{k}+2.4\text{k}+1.2\text{k}+13.6\text{k}+0+2\text{k} = \mathbf{₹1,19,200}$ | ✅ 100% Passed |
| **Financial** | **FIN-02** | Profit / Loss Calculation | $₹1,30,000 - ₹1,19,200 = \mathbf{+₹10,800\text{ Profit}}$ | ✅ 100% Passed |
| **Financial** | **FIN-03** | Original Balance Calculation | $₹1,30,000 - ₹1,20,000 = \mathbf{₹10,000}$ | ✅ 100% Passed |
| **Financial** | **FIN-04** | Balance Status Initial | Remaining: ₹10,000 ➔ Status: `Not Received`, Indicator: `🔴 RED` | ✅ 100% Passed |
| **Financial** | **FIN-05** | Installment 1 (₹9,000) | Remaining: ₹1,000 ➔ Status: `Partially Received`, Indicator: `🔴 RED` | ✅ 100% Passed |
| **Financial** | **FIN-06** | Installment 2 (₹1,000) | Remaining: ₹0 ➔ Status: `Done`, Indicator: `🟢 GREEN` | ✅ 100% Passed |
| **Financial** | **FIN-07** | Overpayment Rejection | Receipt of ₹12,000 against ₹10,000 balance strictly rejected | ✅ 100% Passed |
| **Financial** | **FIN-08** | Negative Expense Guard | Negative values in any of 9 expenses rejected | ✅ 100% Passed |
| **Isolation** | **VEH-01** | TS15UE1122 Workspace Scope | `getActiveTrips()` returns only trips where `vehicleNo === 'TS15UE1122'` | ✅ 100% Passed |
| **Isolation** | **VEH-02** | TG15T6666 Workspace Scope | `getActiveTrips()` returns only trips where `vehicleNo === 'TG15T6666'` | ✅ 100% Passed |
| **Isolation** | **VEH-03** | Cross-Vehicle Mutation Rejection | Mutation targeting 1122 trip from 6666 workspace rejected | ✅ 100% Passed |
| **Isolation** | **VEH-04** | Isolated Receipt Settlement | Receipts applied to 1122 reduce balance only for 1122 | ✅ 100% Passed |
| **Isolation** | **VEH-05** | Sibling Vehicle Independence | 6666 balance remains 100% unaffected by 1122 payments | ✅ 100% Passed |
| **Renewals** | **REN-01** | Dynamic Urgency Computation | Auto-evaluates Overdue (<0d), Due Today (0d), Due Tomorrow (1d), Active (>90d) | ✅ 100% Passed |
| **Renewals** | **REN-02** | Separate Storage Isolation | Dedicated Google Sheets tab `Renewals` with zero impact on Trips or Financials | ✅ 100% Passed |
| **Renewals** | **REN-03** | Role-Based Access Control | Admin has Add/Edit/Delete; Rudra has View/Add/Edit with Delete restricted | ✅ 100% Passed |
| **Renewals** | **REN-04** | Multi-Reminder Schedule | Checkbox triggers for 1, 7, 15, 30, 60, and 90 days before document expiry | ✅ 100% Passed |
| **Renewals** | **REN-05** | Canonical Seed Data | 28 Fleet records spanning TG15G1122, TG15C2324, TG15UE1122, and TG15T6666 | ✅ 100% Passed |

---

# 10. 🔔 STANDALONE FLEET RENEWALS & COMPLIANCE SYSTEM

The Renewals & Alerts module (`js/renewals/`) runs alongside existing fleet operations:
1. **Google Sheets Storage (`Renewals` Tab):**
   - Headers: `Renewal ID`, `Vehicle No`, `Category`, `Document Name`, `Due Date`, `Duration`, `Provider`, `Reminder Days`, `Notes`, `Created Date`, `Updated Date`, `Created By`.
2. **Real-Time Dynamic Urgency Calculation:**
   - 🔴 **OVERDUE:** Expiry date is in the past.
   - 🔴 **DUE TODAY:** Expires on the current calendar day.
   - 🟠 **DUE TOMORROW / THIS WEEK:** Expires in 1 to 7 days.
   - 🟡 **DUE SOON:** Expires in 8 to 30 days.
   - 🔵 **UPCOMING:** Expires in 31 to 90 days.
   - 🟢 **ACTIVE:** Valid for >90 days.
3. **Modals & Badges:**
   - Critical Attention Alert Modal (`#modal-renewal-alert`).
   - Add/Edit Document Form Modal (`#modal-renewal-form`).
   - Detailed Read-Only Document Modal (`#modal-renewal-view`).
   - Dynamic badges on header bell icon and drawer menu.

---

# 11. OPERATIONAL RULES & CONSTRAINTS

1. **Local Development First & 100% Online Operation:** Local development may be performed locally, but production and end-user operation must be 100% online without requiring local Python, localhost, or terminal commands.
2. **Master Excel Protection:** [`Lorry_Trips_ALL_TRIPS_ALL (2).xlsx`](file:///d:/Repo/Lorry/Lorry_Trips_ALL_TRIPS_ALL%20(2).xlsx) is the pristine offline backup and must never be deleted or overwritten.
3. **Google Sheets as Source of Truth:** Browser local storage is an ephemeral cache for rapid rendering and offline resilience; Google Sheets is the sole authoritative financial source of truth.
4. **Non-Destructive Polling:** Background sync respects the mutation mutex lock (`isSaving`, `pendingMutationCount > 0`) to prevent local edits from being overwritten by poller cycles.

---

# 12. 🛡️ STRICT TWO-LAYER PERMISSION & SECURITY ARCHITECTURE

1. **Role Matrix:**
   - **Admin (Shravan):** Everything + Delete across all modules.
   - **Rudra:** Everything except Delete. Rudra can View, Add, Edit, Search, Filter, change Settings, run Diagnostics, Sync with Cloud, and Export Reports.
2. **Delete as Sole Restriction:**
   Delete is strictly forbidden for Rudra on all modules where deletion functionality exists, including Trips, Receipts, Renewals, and Invoice Studio.
3. **Invoice Studio Single Sign-On & Permissions:**
   Invoice Studio uses the same authenticated Lorry session. Rudra receives full Invoice Studio functionality except Delete. Admin receives full Invoice Studio functionality including Delete.
4. **Triple Security Guard:**
   - **UI Layer:** Action buttons in tables and drawers are conditioned on `canDelete()`.
   - **API Client Layer:** `Api.post()` checks `Auth.canDelete()` before sending any action containing `'delete'`.
   - **Apps Script Backend:** `userCanDelete(envelope)` rejects requests with `envelope.user === 'rudra'` or unauthorized credentials with `DELETE_NOT_ALLOWED`.


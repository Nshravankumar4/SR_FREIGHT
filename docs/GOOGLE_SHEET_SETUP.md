# Master Google Sheet Structure & Financial Calculation Engine

* **Connected Google Spreadsheet:** [Open Live Google Sheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
* **Spreadsheet ID:** `1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0`
* **Dedicated Sheets:**
  1. `Trips` — Master operational trips ledger indexed with `Trip ID` and `Vehicle No`.
  2. `Vehicles` — Vehicle registry and metadata (`TS15UE1122`, `TG15T6666`, etc.).
  3. `BalanceReceipts` — Installment payment receipts sub-ledger.
* **Cloud Backup Folder (Google Drive):** `Lorry_Backups`

---

## 📋 Column Layout: `Trips` Sheet

| Col | Header | Description | Calculation / Type |
|:---:|---|---|---|
| **A** | `Trip ID` | Permanent Unique Identifier | Unique ID (e.g. `TRIP-20260828-1122-1001`) |
| **B** | `1. S.No` | Serial Number | Sequence (1, 2, 3...) |
| **C** | `2. Trip Date` | Trip Dispatch Date | `YYYY-MM-DD` |
| **D** | `3. Vehicle No` | Vehicle Registration | e.g. `TS15UE1122`, `TG15T6666` |
| **E** | `4. From` | Origin City / Location | e.g. `Hyderabad, Telangana` |
| **F** | `5. To` | Destination City / Location | e.g. `Purnia, Bihar` |
| **G** | `6. Freight Amount` | Agreed Total Freight Revenue | Numeric (₹) |
| **H** | `7. Advance Date` | Date Advance Received | `YYYY-MM-DD` |
| **I** | `8. Advance Amount` | Advance Amount Paid | Numeric (₹) |
| **J** | `9. Halting Details` | En-route transit / delay notes | Text (e.g. `Two days halting during transit`) |
| **K** | `10. TRSP Name` | Transport Broker / Agency | Text (e.g. `MRC`, `Direct`) |
| **L** | `11. TRSP Comm` | Brokerage Commission | Numeric (₹) |
| **M** | `12. Diesel` | Fuel Expenses | Numeric (₹) |
| **N** | `13. Toll Charges` | FASTag / Toll Expenses | Numeric (₹) |
| **O** | `14. Loading Charges` | Labor / Loading Charges | Numeric (₹) |
| **P** | `15. Unloading Charges` | Labor / Unloading Charges | Numeric (₹) |
| **Q** | `16. Police Exp` | Traffic / Police Expenses | Numeric (₹) |
| **R** | `17. RTA C/P` | RTA Checkpost Charges | Numeric (₹) |
| **S** | `18. Other Expenses` | En-route Miscellaneous | Numeric (₹) |
| **T** | `19. Driver Trip Exp` | Driver Bata / Trip Commission | Numeric (₹) |
| **U** | `Other Expense Notes` | Itemized Notes for other expenses | Text (e.g. `Damage-1000,greac-800`) |
| **V** | `20. Sum OF Total Exp`| Sum of 9 Operations Expenses | `= SUM(L + M + N + O + P + Q + R + S + T)` |
| **W** | `23. Profit/Loss` | Internal Business Margin | `= Freight Amount - Total Expenses` |
| **X** | `22. Trip Status` | Operational Lifecycle Status | `In Progress`, `Completed`, `Pending`, `Paid` |
| **Y** | `25. Original Balance`| Initial Customer Debt | `= Freight Amount - Advance Amount` |
| **Z** | `Total Balance Recd` | Sum of Balance Receipts | Sub-ledger Sum (`BalanceReceipts`) |
| **AA**| `Remaining Balance` | Net Pending Receivable | `= Original Balance - Total Balance Recd` |
| **AB**| `Balance Status` | Payment Settlement State | `Not Received` ➔ `Partially Received` ➔ `Done` |
| **AC**| `Payment Indicator` | Semantic Visual Indicator | `red` (Remaining > 0) / `green` (Remaining == 0) |
| **AD**| `Created At` | Record Creation Timestamp | ISO Timestamp |
| **AE**| `Updated At` | Record Modification Timestamp | ISO Timestamp |

---

## 🧮 Authoritative Financial Core (Zero-Conflict Math)

### 1. Total Expenses (Sum of 9 Operational Expenses)
$$\text{Total Expenses} = \text{Diesel} + \text{Toll} + \text{RTA} + \text{Police} + \text{Loading} + \text{Unloading} + \text{Driver Exp} + \text{TRSP Comm} + \text{Other Expenses}$$

### 2. Profit / Loss (Internal Business Performance)
$$\text{Profit / Loss} = \text{Freight Amount} - \text{Total Expenses}$$

### 3. Customer Original Balance (External Debt)
$$\text{Original Balance} = \text{Freight Amount} - \text{Advance Amount}$$

### 4. Remaining Customer Balance (Net Receivable)
$$\text{Remaining Balance} = \text{Original Balance} - \sum \text{Balance Receipts}$$

> [!IMPORTANT]
> **NEVER MIX PROFIT/LOSS WITH CUSTOMER BALANCE:**
> * **₹10,800 is Profit/Loss** ($\text{Freight } ₹1,30,000 - \text{Expenses } ₹1,19,200$).
> * **₹10,000 is Customer Balance** ($\text{Freight } ₹1,30,000 - \text{Advance } ₹1,20,000$).
> * $\text{Remaining Balance}$ is **NEVER** $\text{Freight} - \text{Expenses}$.
> * $\text{Remaining Balance}$ is **NEVER** $\text{Profit/Loss}$.

---

## 🔄 Dual-Layer Cloud Synchronization & Mutation Locks

1. **Mutation Lockout (`isSaving = true`, `pendingMutationCount > 0`):**
   When Admin or Rudra adds or edits a trip, local mutation lock engages. Background polling is paused until cloud save completes and 4 seconds have passed.

2. **Apps Script Concurrency Lock (`LockService`):**
   `Code.gs` executes with `LockService.getScriptLock().waitLock(30000)` to ensure concurrent writes from multiple tabs/users never collide or corrupt the sheet.

3. **Recalculation Utility (`recalculateAllTrips()`):**
   `Code.gs` includes `recalculateAllTrips()` to recalculate and repair stored historical totals in Google Sheets using the pure authoritative math without using expenses to compute customer balance.

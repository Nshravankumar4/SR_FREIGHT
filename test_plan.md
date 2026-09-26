# Test Plan: Lorry Freight & Broker Management System

## 1. Document Overview
- **Project Name:** Lorry Freight & Broker Management System
- **Document Version:** 1.0.0
- **Source Reference:** `Lorry_gright and Broker list.xlsx`
- **Target Systems:** Data Migration Engine, Core Financial Calculation Logic, SQLite Database, and Dashboard UI / Reports.
- **Objective:** Verify data integrity, financial calculation accuracy, monthly block aggregation, and system stability under normal and edge-case operational conditions.

---

## 2. Scope of Testing

### 2.1 In-Scope
- **Data Ingestion & Parsing:** Extracting existing records from `Lorry_gright and Broker list.xlsx` across all monthly blocks without data corruption.
- **Financial Calculations:**
  - Balance Amount calculation: `Balance = Freight Amount - Advance Amount`
  - Total Trip Expense calculation: `Total Expenses = SUM(Broker Commission + Diesel + Toll + Loading + Unloading + Police Exp + RTA C/P + Other + Driver Commission)`
  - Net Profit / Loss calculation: `Net P&L = Freight Amount - Total Expenses`
  - Status Flag assignment: `P` (Profit) when `Net P&L >= 0`, `L` (Loss) when `Net P&L < 0`
- **Monthly Block Segregation:** Grouping trips by month/year dynamically (replacing manual Excel block creation).
- **Vehicle & Broker Tracking:** Cross-referencing trips by vehicle registration number and transport broker name.
- **Edge Cases & Error Handling:** Zero advance, advance equal to freight, advance exceeding freight, missing expenses, invalid date formats.

### 2.2 Out-of-Scope
- Real-time GPS vehicle tracking.
- Bank gateway API integration (advance/balance payment receipts are logged manually).

---

## 3. Test Environment & Requirements

- **Operating System:** Windows 10/11
- **Language / Runtime:** Python 3.14+
- **Test Frameworks:** `unittest` / `pytest`
- **Dependencies:** `openpyxl` (or built-in XML parser for Excel), `sqlite3`
- **Test Data Source:** `D:\Repo\Lorry\Lorry_gright and Broker list.xlsx`

---

## 4. Test Matrix & Detailed Test Cases

### 4.1 Real-World Data Verification (Baseline Test Cases from Excel)

| Test ID | Trip Date | Vehicle No | Route (From ➔ To) | Agreed Freight | Advance Recd | Total Expenses | Expected Net P&L | Expected Status | Source Ref |
|---|---|---|---|---|---|---|---|---|---|
| **TC-01** | 2026-08-28 | `Ts15ue1122` | Hyderabad ➔ Purnia | ₹1,00,000 | ₹90,000 | ₹82,000 | **₹18,000** | **P (Profit)** | Excel Row 11 |
| **TC-02** | 2026-08-28 | `TG15T6666` | Hyderabad ➔ Purnia | ₹1,00,000 | ₹90,000 | ₹1,12,000 | **-₹12,000** | **L (Loss)** | Excel Row 14 |
| **TC-03** | 2026-08-29 | `Ts15ue1122` | Hyderabad ➔ Kedch | ₹2,00,000 | ₹1,50,000 | ₹82,000 | **₹1,18,000** | **P (Profit)** | Excel Row 19 |
| **TC-04** | 2026-08-29 | `TG15T6666` | Hyderabad ➔ Mechal | ₹2,50,000 | ₹1,55,000 | ₹2,63,000 | **-₹13,000** | **L (Loss)** | Excel Row 22 |

---

### 4.2 Functional Test Cases

#### Module 1: Revenue & Advance Calculations
- **TC-REV-01: Standard Balance Calculation**
  - *Input:* Freight = ₹1,00,000, Advance = ₹90,000
  - *Expected Result:* Balance Due = ₹10,000
- **TC-REV-02: Zero Advance Received**
  - *Input:* Freight = ₹1,00,000, Advance = ₹0
  - *Expected Result:* Balance Due = ₹1,00,000
- **TC-REV-03: Full Advance Received**
  - *Input:* Freight = ₹1,00,000, Advance = ₹1,00,000
  - *Expected Result:* Balance Due = ₹0
- **TC-REV-04: Overpayment / Excess Advance Validation**
  - *Input:* Freight = ₹1,00,000, Advance = ₹1,10,000
  - *Expected Result:* System warning flag: negative balance or confirmation prompt required.

#### Module 2: Trip Expense Aggregations
- **TC-EXP-01: Complete 9-Item Expense Sum**
  - *Inputs:*
    - Broker Commission: ₹2,000
    - Diesel: ₹50,000
    - Toll Charges: ₹10,000
    - Loading Charges: ₹2,500
    - Unloading Charges: ₹2,500
    - Police Expenses: ₹1,000
    - RTA C/P: ₹1,000
    - Other Expenses: ₹1,000
    - Driver Commission: ₹12,000
  - *Expected Result:* Total Expenses = ₹82,000
- **TC-EXP-02: Partial Expenses / Zero Nil Items**
  - *Inputs:* Diesel = ₹40,000, Toll = ₹5,000, all other expenses = ₹0
  - *Expected Result:* Total Expenses = ₹45,000 (no `None` or `NaN` errors).
- **TC-EXP-03: Negative Expense Input Prevention**
  - *Input:* Diesel = -₹5,000
  - *Expected Result:* Validation error triggered; expense amounts cannot be negative.

#### Module 3: Profit & Loss (P&L) Evaluation
- **TC-PL-01: Profitable Trip Flagging**
  - *Inputs:* Freight = ₹1,00,000, Total Expenses = ₹82,000
  - *Expected Result:* Net Amount = +₹18,000, Status = `P`
- **TC-PL-02: Loss-Making Trip Flagging**
  - *Inputs:* Freight = ₹1,00,000, Total Expenses = ₹1,12,000
  - *Expected Result:* Net Amount = -₹12,000, Status = `L`
- **TC-PL-03: Break-Even Trip**
  - *Inputs:* Freight = ₹1,00,000, Total Expenses = ₹1,00,000
  - *Expected Result:* Net Amount = ₹0, Status = `P` (or `Break-Even`)

#### Module 4: Monthly Block & Grouping Operations
- **TC-BLK-01: Auto-Grouping by Month**
  - *Inputs:* Trips with dates `2026-08-28`, `2026-08-29`, `2026-09-05`
  - *Expected Result:* System separates trips into `August 2026` block and `September 2026` block without requiring manual spreadsheet layout setup.
- **TC-BLK-02: Monthly Rollup Totals**
  - *Inputs:* August 2026 trips (Row 11, 14, 19, 22)
  - *Expected Totals:*
    - Total August Freight: ₹6,50,000
    - Total August Advances: ₹4,85,000
    - Total August Balance Pending: ₹1,65,000
    - Total August Expenses: ₹5,39,000
    - Net August P&L: ₹1,11,000 (Profit)

---

## 5. Non-Functional Testing

| Category | Test Objective | Pass Criteria |
|---|---|---|
| **Data Integrity** | Validate data types (Dates as ISO `YYYY-MM-DD`, Currencies as Decimal/Float). | Zero NaN or invalid date string conversions. |
| **Idempotency** | Re-running Excel migration multiple times. | Existing trips are updated or skipped, avoiding duplicate rows. |
| **Performance** | Querying 5,000 trips across 5 years. | Monthly block load time under 300ms. |

---

## 6. Execution & Verification Checklist

- [ ] Verify Excel reader accurately extracts all rows from `Lorry_gright and Broker list.xlsx`.
- [ ] Confirm numeric conversion parses formatted currency strings without error.
- [ ] Run automated unit test suite for all calculation formulas.
- [ ] Validate vehicle casing normalization (e.g., `Ts15ue1122` ➔ `TS15UE1122`).
- [ ] Verify monthly block aggregation totals against Excel manual totals.

---

## 7. Sign-Off & Approval Criteria

The system passes testing when:
1. All baseline records (Rows 11, 14, 19, 22) match Excel outputs with 100% precision.
2. 0% calculation discrepancies on Balance Due, Total Expenses, and Net Profit/Loss.
3. Automated test pass rate is 100% across all functional test cases.


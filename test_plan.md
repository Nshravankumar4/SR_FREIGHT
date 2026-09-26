# Test Plan: Lorry Freight & Broker Management System

## 1. Document Overview
- **Project Name:** Lorry Freight & Broker Management System
- **Document Version:** 2.0.0
- **Source Reference:** Baseline August 2026 Fleet Records
- **Target Systems:** Single-Page Web Dashboard (`index.html`, `js/app.js`), Google Apps Script Backend (`Code.gs`), and Google Sheets Master Database.
- **Objective:** Verify data integrity, financial calculation accuracy, exact 24 business columns, confirmation popups, toasts, Excel exports, and payment status independence.

---

## 2. Scope of Testing

### 2.1 In-Scope
- **Authentication & Session:**
  - Login overlay gating dashboard access (default `admin` / `admin`).
  - Top navigation display with user badge and active `[ Logout ]` button.
- **Top Control & Filter Bar:**
  - Month dropdown selector (`Month [ Aug-26 ▼ ]`).
  - Date From / Date To range filtering.
  - `[ SHOW ENTIRE MONTH ]` button resetting date boundaries.
  - Real-time search across Vehicle, Route, Locations, and Broker.
  - `[ DOWNLOAD EXCEL ]` exporting exact 24 business columns with UTF-8 BOM.
- **24 Business Columns in Master Table:**
  - Columns 1 to 24 in exact order without artificial action/timestamp columns.
  - Row Action menu (`✏️ Edit`, `🗑️ Delete`) separated from business data columns.
- **Financial Calculations & Business Rules:**
  - Balance Amount: `Freight Amount - Advance Amount`.
  - Total Expenses: `TRSP Commission + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Commission`.
  - P/L: `Freight Amount - Total Expenses` (Displayed as `P +₹...` or `L -₹...`).
  - Status Amount: `Pending` -> Balance, `Paid` -> ₹0, `Partially Paid` -> remaining unpaid balance.
  - Independence of Status and P/L (Profit+Pending, Loss+Paid, etc.).
- **Confirmation Popups & Success Messages:**
  - Edit Flow: Prompt `"Are you sure you want to edit Trip #X (Vehicle)?"` ➔ Slide-over drawer ➔ Save prompt `"Are you sure you want to save these changes and recalculate this trip?"` ➔ Toast: `"✅ Trip #X (Vehicle) updated successfully."`
  - Delete Flow: Prompt `"Are you sure you want to delete Trip #X (Vehicle)? This action cannot be undone."` ➔ Soft delete ➔ Toast: `"✅ Trip #X (Vehicle) deleted successfully."`
- **Dashboard Warning / Filter Cards:**
  - `⚠️ PENDING PAYMENTS`, `🔴 LOSS-MAKING TRIPS`, `🟠 PARTIALLY PAID`, `🟢 PROFIT TRIPS`, `✅ SETTLED / PAID`.
  - Click-to-filter reactivity.

---

## 3. Real-World Baseline Test Cases (August 2026 Data)

| Test ID | Trip Date | Vehicle No | Route (From ➔ To) | Agreed Freight | Advance Recd | Total Expenses | Expected Net P&L | Expected Status |
|---|---|---|---|---|---|---|---|---|
| **TC-01** | 2026-08-28 | `TS15UE1122` | Hyderabad ➔ Purnia | ₹1,00,000 | ₹90,000 | ₹82,000 | **+₹18,000** | **Pending** (Status Amt: ₹10,000) |
| **TC-02** | 2026-08-28 | `TG15T6666` | Hyderabad ➔ Purnia | ₹1,00,000 | ₹90,000 | ₹1,12,000 | **-₹12,000** | **Paid** (Status Amt: ₹0) |
| **TC-03** | 2026-08-29 | `TS15UE1122` | Hyderabad ➔ Kedch | ₹2,00,000 | ₹1,50,000 | ₹82,000 | **+₹1,18,000** | **Paid** (Status Amt: ₹0) |
| **TC-04** | 2026-08-29 | `TG15T6666` | Hyderabad ➔ Mechal | ₹2,50,000 | ₹1,55,000 | ₹2,63,000 | **-₹13,000** | **Pending** (Status Amt: ₹95,000) |

### Baseline August 2026 Rollup Totals:
- **Total Freight:** ₹6,50,000
- **Total Advances:** ₹4,85,000
- **Total Balance Pending:** ₹1,65,000
- **Total En-route Expenses:** ₹5,39,000
- **Net Operational Profit:** ₹1,11,000

---

## 4. Functional Test Matrix

### 4.1 Authentication & Controls
- **TC-AUTH-01 (Login Success):** Enter `admin` / `admin` -> Dashboard loads, user badge displays `admin`.
- **TC-AUTH-02 (Login Rejection):** Enter invalid password -> Error alert displayed, dashboard blocked.
- **TC-AUTH-03 (Logout):** Click `[ Logout ]` -> Session cleared, login overlay reappears.
- **TC-CTRL-01 (Month Selection):** Select `Aug-26` -> Displays August 2026 trips only.
- **TC-CTRL-02 (Date Range Filter):** Enter `2026-08-28` to `2026-08-28` -> Displays only the 2 trips on that date.
- **TC-CTRL-03 (Show Entire Month):** Click `[ SHOW ENTIRE MONTH ]` -> Clears date range inputs and restores all trips for the month.
- **TC-CTRL-04 (Excel Download):** Click `[ DOWNLOAD EXCEL ]` -> Generates CSV with exact 24 business headers and UTF-8 BOM.

### 4.2 Interactive Modals & Toast Workflows
- **TC-MOD-01 (Edit Confirmation):** Click `✏️ Edit` on Trip #1 -> Modal prompts `"Are you sure you want to edit Trip #1 (TS15UE1122)?"`.
- **TC-MOD-02 (Slide-Over & Save Confirmation):** Click `YES, EDIT` -> Drawer opens with prefilled fields. Change freight and click `Save & Recalculate` -> Second modal prompts `"Are you sure you want to save these changes and recalculate this trip?"`.
- **TC-MOD-03 (Toast on Save):** Confirm save -> Drawer closes, table updates, and toast `"✅ Trip #1 (TS15UE1122) updated successfully."` appears for 4s.
- **TC-MOD-04 (Delete Confirmation):** Click `🗑️ Delete` on Trip #2 -> Modal prompts `"Are you sure you want to delete Trip #2 (TG15T6666)? This action cannot be undone."`.
- **TC-MOD-05 (Toast on Delete):** Confirm delete -> Record removed from view, and toast `"✅ Trip #2 (TG15T6666) deleted successfully."` appears.

### 4.3 Business Columns & Calculations
- **TC-COL-01 (24 Column Count):** Verify master table has exactly 24 business columns matching specification.
- **TC-COL-02 (Route Column):** Col 24 shows `${From} ➔ ${To}` dynamically.
- **TC-COL-03 (P/L Format):** Col 23 displays `P +₹...` (green badge) for profits and `L -₹...` (red badge) for losses.
- **TC-COL-04 (Status Amount):** Verify `Pending` matches balance, `Paid` displays `₹0`.

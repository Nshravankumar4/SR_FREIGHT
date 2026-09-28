# Google Form Setup & Field Guide

This document specifies the exact fields, question types, validation rules, and sections to create in your Google Form for adding new lorry trips.

---

## Form Title & Settings
- **Form Title:** `SR_T Lorry Trip Entry Form`
- **Description:** `Enter details for completed or ongoing lorry trips. Data will automatically synchronize with the Lorry Fleet Master Sheet & Web Dashboard.`
- **Settings:**
  - Collect email addresses: *Optional*
  - Link responses to spreadsheet: *Select existing spreadsheet `Lorry Fleet Master Database` > `Trips` tab.*

---

## Section 1: Trip & Route Details

1. **Trip Date**
   - **Type:** Date
   - **Required:** Yes
   - **Help Text:** Date when the lorry commenced the journey.

2. **Vehicle Number**
   - **Type:** Dropdown / Short text (Uppercase)
   - **Required:** Yes
   - **Options (if Dropdown):**
     - `TS15UE1122`
     - `TG15T6666`
     - *(Add additional fleet vehicles)*

3. **From (Origin Location)**
   - **Type:** Short text
   - **Required:** Yes
   - **Example:** `Hyderabad, Telangana`

4. **To (Destination Location)**
   - **Type:** Short text
   - **Required:** Yes
   - **Example:** `Purnia, Bihar`

5. **Halting Details**
   - **Type:** Short text / Paragraph
   - **Required:** No (Default: "None")
   - **Example:** `Two days halting during transit`

6. **TRSP Name (Transport Broker)**
   - **Type:** Short text / Dropdown
   - **Required:** Yes
   - **Example:** `MRC`

---

## Section 2: Freight Revenue & Advances

7. **Freight Amount (₹)**
   - **Type:** Short text
   - **Required:** Yes
   - **Validation:** Number > Greater than 0
   - **Help Text:** Total agreed trip freight amount.

8. **Advance Date**
   - **Type:** Date
   - **Required:** No (Leave empty if no advance received yet)

9. **Advance Amount (₹)**
   - **Type:** Short text
   - **Required:** Yes
   - **Validation:** Number > Greater than or equal to 0 (Enter 0 if none)

---

## Section 3: Trip Operating Expenses

*(Enter ₹0 for any expense category that does not apply)*

10. **TRSP Commission (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

11. **Diesel Expense (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

12. **Toll Charges (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

13. **Loading Charges (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

14. **Unloading Charges (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

15. **Police Expenses (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

16. **RTA C/P (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

17. **Other Expenses (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

18. **Driver Trip Commission (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

19. **Payment Status**
    - **Type:** Multiple choice
    - **Options:** `Pending`, `Partially Paid`, `Paid`
    - **Required:** Yes (Default: `Pending`)

---

## Automated Business Columns

- **20. Total Expenses:** Sum of the 9 operating expenses (TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm)
- **21. Total Exp Given:** `Advance Amount + Total Expenses`
- **22. Trip Status:** Operational lifecycle status (`New`, `In Progress`, `Completed`, `Cancelled`)
- **23. Profit / Loss:** Net business margin calculated as `Freight Amount - Total Expenses`
- **24. Total Balance Received:** Sum of all recorded balance receipt installments
- **25. Original Customer Balance:** Net receivable calculated as `Freight Amount - Advance Amount`
- **26. Remaining Customer Balance:** `Original Balance - Total Balance Received` (Down to ₹0 with 🔴/🟢 indicator)

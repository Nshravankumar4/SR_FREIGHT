# Google Form Setup & Field Guide

This document specifies the exact fields, question types, validation rules, and sections to create in your Google Form for adding new lorry trips.

---

## Form Title & Settings
- **Form Title:** `Lorry Trip Entry Form`
- **Description:** `Enter details for completed or ongoing lorry trips. Data will automatically synchronize with the Lorry Fleet Master Sheet & Web App.`
- **Settings:**
  - Collect email addresses: *Optional (recommended if tracking employee entries)*
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
   - **Validation (if Short text):** Regular expression: `^[a-zA-Z0-9\s]+$`

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
   - **Example:** `Two days halting during transit due to unloading delay`

6. **Transport / Broker Name**
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

10. **Transport / Broker Commission (₹)**
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

16. **RTA Checkpost Charges (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

17. **Other Miscellaneous Expenses (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

18. **Driver Trip Commission (₹)**
    - **Type:** Short text (Validation: Number >= 0)
    - **Required:** Yes (Default: `0`)

---

## Note on Automated Fields
The following fields do **NOT** need to be in the Google Form; they are calculated automatically by the Google Sheet and Web App:
- `Balance Amount` (`Freight - Advance`)
- `Total Expenses` (`Sum of 9 expense items`)
- `Net Profit / Loss` (`Freight - Total Expenses`)
- `Status P/L` (`P` or `L`)


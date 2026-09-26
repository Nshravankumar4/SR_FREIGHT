# Master Google Sheet Structure (Exact 24 Business Columns)

* **Connected Google Spreadsheet:** [Open Live Google Sheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
* **Spreadsheet ID:** `1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0`
* **Trips Tab:** `Trips`
* **Cloud Backup Folder (Google Drive):** `Lorry_Backups`

---

## 📋 Column Layout (Exact 24 Business Columns)

| Col | Header | Description |
|---|---|---|
| **A** | `S.No.` | Serial Number (1, 2, 3...) |
| **B** | `Trip Date` | Date trip started (`YYYY-MM-DD` or `DD-MM-YYYY`) |
| **C** | `Vehicle No` | Vehicle registration (e.g. `TS15UE1122`) |
| **D** | `From` | Origin location (e.g. `Hyderabad, Telangana`) |
| **E** | `To` | Destination location (e.g. `Purnia, Bihar`) |
| **F** | `Freight Amount` | Agreed freight revenue |
| **G** | `Advance Date` | Date advance was received |
| **H** | `Advance Amount` | Advance amount paid |
| **I** | `Balance Amount` | Remaining freight (`Freight - Advance`) |
| **J** | `Halting Details` | Transit delay/halting notes |
| **K** | `TRSP Name` | Transport Broker / Agency name |
| **L** | `TRSP Commission` | Brokerage commission |
| **M** | `Diesel` | Fuel expense |
| **N** | `Toll Charges` | Fastag / Toll expenses |
| **O** | `Loading Charges` | Loading labor charges |
| **P** | `Unloading Charges`| Unloading labor charges |
| **Q** | `Police Exp` | State / Police expenses |
| **R** | `RTA C/P` | RTA Checkpost charges |
| **S** | `Other Expenses` | Miscellaneous en-route expenses |
| **T** | `Driver Trip Commission` | Driver bata / trip commission |
| **U** | `Status Amount` | Outstanding balance if Pending, ₹0 if Paid, remaining if Partially Paid |
| **V** | `Status` | `Pending`, `Partially Paid`, or `Paid` |
| **W** | `P/L` | Net Profit / Loss badge: `P +₹30,000` or `L -₹15,000` |
| **X** | `Route` | Combined route: `${From} ➔ ${To}` |

---

## 🧮 Calculations & Business Logic

1. **Balance Amount (Col I):**
   `Freight Amount - Advance Amount`

2. **Total Expenses (Cols L through T):**
   `TRSP Commission + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Commission`

3. **P/L (Col W):**
   `Freight Amount - Total Expenses` (Formatted as `P +₹...` or `L -₹...`)

4. **Route (Col X):**
   `${From} ➔ ${To}`

5. **Automatic Cloud Backups:**
   Whenever any record is created, edited, or deleted, a timestamped duplicate copy is automatically cloned into the `Lorry_Backups` folder in Google Drive.

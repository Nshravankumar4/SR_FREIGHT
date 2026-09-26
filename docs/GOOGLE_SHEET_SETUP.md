# Master Google Sheet Structure (Exact 25 Business Columns)

* **Connected Google Spreadsheet:** [Open Live Google Sheet](https://docs.google.com/spreadsheets/d/1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0/edit)
* **Spreadsheet ID:** `1X-whiMGT3BxgdMjayuXHw-d8fZeaX1dKjLeEEiIPQf0`
* **Trips Tab:** `Trips`
* **Cloud Backup Folder (Google Drive):** `Lorry_Backups`

---

## 📋 Column Layout (Exact 25 Business Columns + Unique Trip ID)

| Col | Header | Description | Calculation / Type |
|:---:|---|---|---|
| **A** | `1. S.No` | Serial Number | Auto-incremented sequence (1, 2, 3...) |
| **B** | `2. Trip Date` | Trip Start Date | `YYYY-MM-DD` |
| **C** | `3. Vehicle No` | Vehicle Registration | e.g. `TS15UE1122` |
| **D** | `4. From` | Origin City / Location | e.g. `Hyderabad, Telangana` |
| **E** | `5. To` | Destination City / Location | e.g. `Purnia, Bihar` |
| **F** | `6. Freight Amount` | Agreed Total Freight Revenue | Numeric (₹) |
| **G** | `7. Advance Date` | Date Advance Received | `YYYY-MM-DD` |
| **H** | `8. Advance Amount` | Advance Amount Paid | Numeric (₹) |
| **I** | `9. Halting Details` | En-route transit / delay notes | Text (e.g. `Two days halting`) |
| **J** | `10. TRSP Name` | Transport Broker / Agency | Text (e.g. `MRC`, `Direct`) |
| **K** | `11. TRSP Comm` | Brokerage Commission | Numeric (₹) |
| **L** | `12. Diesel` | Fuel Expenses | Numeric (₹) |
| **M** | `13. Toll Charges` | FASTag / Toll Expenses | Numeric (₹) |
| **N** | `14. Loading Charges` | Labor / Loading Charges | Numeric (₹) |
| **O** | `15. Unloading Charges` | Labor / Unloading Charges | Numeric (₹) |
| **P** | `16. Police Exp` | Traffic / Police Expenses | Numeric (₹) |
| **Q** | `17. RTA C/P` | RTA Checkpost Charges | Numeric (₹) |
| **R** | `18. Other Expenses` | En-route Miscellaneous | Numeric (₹) |
| **S** | `19. Driver Comm` | Driver Bata / Trip Commission | Numeric (₹) |
| **T** | `20. Sum OF Total Exp` | Sum of Operations Expenses | `= SUM(Col 11..19)` |
| **U** | `21. Total Exp Given` | Advance + Total Expenses | `= Advance Amount + Sum OF Total Exp` |
| **V** | `22. Status` | Payment Status | `New`, `Pending`, `Partially Paid`, `Paid` |
| **W** | `23. P/L` | Net Profit or Loss | `= Freight Amount - Total Exp Given` |
| **X** | `24. Date Balance Recd` | Date Settlement Received | `YYYY-MM-DD` or empty |
| **Y** | `25. Balance Amount` | Net Pending Freight | `= Freight Amount - Total Exp Given` |
| **Z** | `Trip ID` | Permanent UUID for Lock/Sync | Unique ID (e.g. `TR-1` or `UUID`) |

---

## 🧮 25-Column Business Math Engine

```
1. Sum OF Total Exp (Col 20)
   = TRSP Comm + Diesel + Toll + Loading + Unloading + Police + RTA + Other + Driver Comm

2. Total Exp Given (Col 21)
   = Advance Amount + Sum OF Total Exp

3. P/L (Col 23)
   = Freight Amount - Total Exp Given

4. Balance Amount (Col 25)
   = Freight Amount - Total Exp Given
```

---

## 🔄 Dual-Layer Cloud Synchronization & Mutation Locks

1. **Mutation Lockout (`isSaving = true`, `pendingMutationCount > 0`):**
   When Admin or Rudra adds or edits a trip, the local mutation lock engages. Background polling is paused until the cloud save completes and 4 seconds have passed.

2. **Apps Script Concurrency Lock (`LockService`):**
   `Code.gs` executes with `LockService.getScriptLock().waitLock(30000)` to ensure concurrent writes from Admin and Rudra never collide or corrupt the sheet.

3. **Automatic Google Drive Cloning:**
   On every add, edit, or delete, `createCloudBackup` clones the spreadsheet into the `Lorry_Backups` folder in Google Drive (with snapshot tab fallback `SNAP_...`).

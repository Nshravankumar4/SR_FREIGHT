# Master Google Sheet Structure (23 Columns)

This document defines the exact layout and headers for the master Google Sheet database:

| Col | Header | Description |
|---|---|---|
| **A** | `S.No.` | Serial Number (1, 2, 3...) |
| **B** | `Trip Date` | Date trip started (`YYYY-MM-DD`) |
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
| **U** | `Status Amount` | Outstanding balance if Pending, ₹0 if Done/Paid |
| **V** | `Payment Status` | `Pending`, `Done`, `Paid`, or `Partially Paid` |
| **W** | `Net Profit / Loss` | Net amount: `Freight - Total Expenses` |

---

## Google Sheet Formulas (Row 2):
1. **Balance Amount (Col I2):**
   `=ARRAYFORMULA(IF(ISBLANK(B2:B), "", F2:F - H2:H))`
2. **Total Expenses:**
   `=ARRAYFORMULA(IF(ISBLANK(B2:B), "", L2:L + M2:M + N2:N + O2:O + P2:P + Q2:Q + R2:R + S2:S + T2:T))`
3. **Net Profit / Loss (Col W2):**
   `=ARRAYFORMULA(IF(ISBLANK(B2:B), "", F2:F - (L2:L + M2:M + N2:N + O2:O + P2:P + Q2:Q + R2:R + S2:S + T2:T)))`

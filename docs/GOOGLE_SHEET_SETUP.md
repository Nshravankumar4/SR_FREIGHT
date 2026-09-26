# Master Google Sheet Structure (Exact 24 Business Columns)

This document defines the exact layout and headers for the master Google Sheet database:

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

## Calculations & Formulas

1. **Balance Amount (Col I):**
   ```excel
   =ARRAYFORMULA(IF(ISBLANK(B2:B), "", F2:F - H2:H))
   ```

2. **Total Expenses (Internal Calculation):**
   ```excel
   =ARRAYFORMULA(IF(ISBLANK(B2:B), "", L2:L + M2:M + N2:N + O2:O + P2:P + Q2:Q + R2:R + S2:S + T2:T))
   ```

3. **P/L (Col W):**
   ```excel
   =ARRAYFORMULA(IF(ISBLANK(B2:B), "", IF(F2:F - (L2:L+M2:M+N2:N+O2:O+P2:P+Q2:Q+R2:R+S2:S+T2:T) >= 0, "P +₹" & TEXT(F2:F - (L2:L+M2:M+N2:N+O2:O+P2:P+Q2:Q+R2:R+S2:S+T2:T), "#,##,##0"), "L -₹" & TEXT(ABS(F2:F - (L2:L+M2:M+N2:N+O2:O+P2:P+Q2:Q+R2:R+S2:S+T2:T)), "#,##,##0"))))
   ```

4. **Route (Col X):**
   ```excel
   =ARRAYFORMULA(IF(ISBLANK(B2:B), "", D2:D & " ➔ " & E2:E))
   ```

5. **Status Amount (Col U):**
   ```excel
   =ARRAYFORMULA(IF(ISBLANK(B2:B), "", IF(V2:V="Paid", 0, IF(V2:V="Pending", I2:I, I2:I))))
   ```

# End-to-End Setup & Deployment Guide

This guide provides the **exact instructions** to connect **Google Forms ➔ Google Sheets ➔ Google Apps Script ➔ Local Testing ➔ Cloudflare Pages**.

---

## Architecture Flow

```
                      ┌──────────────────────────┐
                      │       Google Form        │
                      │  Trip Entry (19 fields)  │
                      └─────────────┬────────────┘
                                    │ (Form submission)
                                    ▼
                      ┌──────────────────────────┐
                      │    Form Responses 1      │
                      │      (Raw Inputs)        │
                      └─────────────┬────────────┘
                                    │ onFormSubmit trigger
                                    ▼
                      ┌──────────────────────────┐
                      │   Trips Master Sheet     │
                      │   (24 Business Columns)  │
                      └─────────────┬────────────┘
                                    │ Apps Script JSON API (?action=getTrips)
                                    ▼
                      ┌──────────────────────────┐
                      │   SR_T Web Application   │
                      │  (Cloudflare Pages / PC) │
                      └──────────────────────────┘
```

---

## Step 1: Create the Master Google Sheet (24 Columns)

1. Open [Google Sheets](https://sheets.new) and name the spreadsheet:
   `Lorry Fleet Master Database`
2. Rename the default sheet tab to **`Trips`**.
3. In row 1 of the **`Trips`** sheet, paste these exact 24 column headers:
   ```
   A: S.No.
   B: Trip Date
   C: Vehicle No
   D: From
   E: To
   F: Freight Amount
   G: Advance Date
   H: Advance Amount
   I: Balance Amount
   J: Halting Details
   K: TRSP Name
   L: TRSP Commission
   M: Diesel
   N: Toll Charges
   O: Loading Charges
   P: Unloading Charges
   Q: Police Exp
   R: RTA C/P
   S: Other Expenses
   T: Driver Trip Commission
   U: Status Amount
   V: Status
   W: P/L
   X: Route
   ```
4. Style Row 1: Bold text, dark background (`#0f172a`), white text, and freeze row 1 (`View > Freeze > 1 row`).

---

## Step 2: Create the Google Form & Link It

1. Inside your Google Sheet, click **Tools ➔ Create a new form**.
   *(A new tab named `Form Responses 1` will automatically be created in your spreadsheet).*
2. In the Google Form editor, name the form:
   `SR_T Trip Entry Form`
3. Add the questions in order (see detailed guide in [`docs/GOOGLE_FORM_SETUP.md`](file:///D:/Repo/Lorry/docs/GOOGLE_FORM_SETUP.md)):
   1. **Trip Date** (Date) — Required
   2. **Vehicle Number** (Dropdown / Short text) — Required (e.g. `TS15UE1122`, `TG15T6666`)
   3. **From (Origin Location)** (Short text) — Required
   4. **To (Destination Location)** (Short text) — Required
   5. **Freight Amount (₹)** (Short text, Number > 0) — Required
   6. **Advance Date** (Date) — Optional
   7. **Advance Amount (₹)** (Short text, Number >= 0) — Required
   8. **Halting Details** (Short text) — Optional
   9. **TRSP Name** (Short text) — Required (e.g. `MRC`)
   10. **TRSP Commission (₹)** (Short text, Number >= 0) — Required
   11. **Diesel Expense (₹)** (Short text, Number >= 0) — Required
   12. **Toll Charges (₹)** (Short text, Number >= 0) — Required
   13. **Loading Charges (₹)** (Short text, Number >= 0) — Required
   14. **Unloading Charges (₹)** (Short text, Number >= 0) — Required
   15. **Police Expenses (₹)** (Short text, Number >= 0) — Required
   16. **RTA Checkpost (₹)** (Short text, Number >= 0) — Required
   17. **Other Expenses (₹)** (Short text, Number >= 0) — Required
   18. **Driver Trip Commission (₹)** (Short text, Number >= 0) — Required
   19. **Payment Status** (Multiple Choice) — `Pending`, `Partially Paid`, `Paid`

---

## Step 3: Deploy the Google Apps Script Backend

1. In your Google Sheet, go to **Extensions ➔ Apps Script**.
2. Name the project `SR_T_Lorry_Backend`.
3. Replace the entire code in `Code.gs` with the contents of [`google-apps-script/Code.gs`](file:///D:/Repo/Lorry/google-apps-script/Code.gs).
4. Click the **Save** disk icon.
5. In the left navigation, click **Triggers (Clock icon)**:
   - Click **+ Add Trigger** (bottom right).
   - Choose which function to run: `onFormSubmit`.
   - Select event source: `From spreadsheet`.
   - Select event type: `On form submit`.
   - Click **Save** and grant permissions if prompted.
6. Click **Deploy ➔ New deployment**:
   - Select type: **Web app**.
   - Description: `Lorry Fleet API v2.0`.
   - Execute as: **Me**.
   - Who has access: **Anyone** *(allows the web dashboard to fetch trips)*.
   - Click **Deploy**.
7. Copy the **Web App URL** (e.g., `https://script.google.com/macros/s/.../exec`).

---

## Step 4: Connect Web Dashboard to Google Apps Script

1. Open `http://localhost:8000` (or your live site).
2. Log in with `admin` / `admin`.
3. Click the **⚙️ Settings** icon in the top header.
4. Paste your Google Apps Script Web App URL and press **OK**.
5. Click **🔄 Sync** to fetch all trips from Google Sheets.

---

## Step 5: Zero-Cost Deployment on Cloudflare Pages

1. Commit and push your code to your GitHub repository:
   ```powershell
   git add .
   git commit -m "Complete change request: 24 business columns, auth, controls, popups, and excel export"
   git push origin main
   ```
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Select your repository (`Lorry`).
4. Build configuration:
   - Framework preset: `None`
   - Build command: *(leave empty)*
   - Build output directory: `.`
5. Click **Save and Deploy**. Your web app will be live globally on a custom `.pages.dev` URL at zero cost.

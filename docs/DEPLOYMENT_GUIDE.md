# End-to-End Setup & Deployment Guide

This guide provides the **exact click-by-click instructions** to connect **Google Forms ➔ Google Sheets ➔ Google Apps Script ➔ Local Testing ➔ Cloudflare Pages**.

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
                      │       Master Trips       │
                      │ (Auto-calculated Metrics)│
                      └─────────────┬────────────┘
                                    │ Apps Script JSON API (?action=getTrips)
                                    ▼
                      ┌──────────────────────────┐
                      │   SR_T Web Application   │
                      │  (Cloudflare Pages / PC) │
                      └──────────────────────────┘
```

---

## Step 1: Create the Master Google Sheet

1. Open [Google Sheets](https://sheets.new) and name the spreadsheet:
   `Lorry Fleet Master Database`
2. Rename the default sheet tab from `Sheet1` to **`Trips`**.
3. In row 1 of the **`Trips`** sheet, paste these exact 24 column headers:
   ```
   A: Timestamp
   B: Trip Date
   C: Vehicle Number
   D: From Location
   E: To Location
   F: Freight Amount
   G: Advance Date
   H: Advance Amount
   I: Halting Details
   J: Balance Amount
   K: Transport / Broker Name
   L: Broker Commission
   M: Diesel
   N: Toll Charges
   O: Loading Charges
   P: Unloading Charges
   Q: Police Expenses
   R: RTA C/P
   S: Other Expenses
   T: Driver Trip Commission
   U: Month_Key
   V: Total Expenses
   W: Net Profit / Loss
   X: Status (P/L)
   ```
4. Style Row 1: Bold text, dark background (`#1e293b`), white text, and freeze row 1 (`View > Freeze > 1 row`).

---

## Step 2: Create the Google Form & Link It

1. Inside your Google Sheet, click **Tools ➔ Create a new form**.
   *(A new tab named `Form Responses 1` will automatically be created in your spreadsheet).*
2. In the Google Form editor, name the form:
   `SR_T Trip Entry Form`
3. Add the exact questions in this order (see details in [`docs/GOOGLE_FORM_SETUP.md`](file:///D:/Repo/Lorry/docs/GOOGLE_FORM_SETUP.md)):
   1. **Trip Date** (Date) — Required
   2. **Vehicle Number** (Dropdown / Short text) — Required (e.g. `TS15UE1122`, `TG15T6666`)
   3. **From (Origin Location)** (Short text) — Required
   4. **To (Destination Location)** (Short text) — Required
   5. **Halting Details** (Short text) — Optional
   6. **Transport / Broker Name** (Short text) — Required (e.g. `MRC`)
   7. **Freight Amount (₹)** (Short text, Number > 0) — Required
   8. **Advance Date** (Date) — Optional
   9. **Advance Amount (₹)** (Short text, Number >= 0) — Required
   10. **Transport / Broker Commission (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   11. **Diesel Expense (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   12. **Toll Charges (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   13. **Loading Charges (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   14. **Unloading Charges (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   15. **Police Expenses (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   16. **RTA Checkpost Charges (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   17. **Other Miscellaneous Expenses (₹)** (Short text, Number >= 0) — Required (Default: `0`)
   18. **Driver Trip Commission (₹)** (Short text, Number >= 0) — Required (Default: `0`)

> Note: `Balance Amount`, `Total Expenses`, `Net Profit / Loss`, and `Status P/L` are **NOT** in the form; they are calculated automatically by the backend.

---

## Step 3: Install Google Apps Script & Setup Trigger

1. In your Google Sheet, click **Extensions ➔ Apps Script**.
2. Name the project `SR_T_Fleet_Backend`.
3. Select all code in `Code.gs`, delete it, and paste the entire contents of:
   [`google-apps-script/Code.gs`](file:///D:/Repo/Lorry/google-apps-script/Code.gs)
4. *(Optional Security)*: To protect your API with a secret key:
   - Click the gear icon ⚙️ (**Project Settings**) on the left.
   - Scroll down to **Script Properties** and click **Add script property**.
   - **Property:** `API_KEY`
   - **Value:** Choose your own passphrase (e.g., `srt_fleet_pass_2026`).
   - Click **Save script properties**.
5. **Setup the Form Submit Trigger:**
   - On the left sidebar of Apps Script, click the alarm clock icon ⏰ (**Triggers**).
   - Click **+ Add Trigger** (bottom right).
   - **Choose which function to run:** `onFormSubmit`
   - **Which runs at deployment:** `Head`
   - **Select event source:** `From spreadsheet`
   - **Select event type:** `On form submit`
   - Click **Save** and accept Google's permission prompt.

Now, whenever a driver or manager submits the Google Form, `onFormSubmit` instantly computes all financial formulas and writes the normalized record into the **`Trips`** master tab!

---

## Step 4: Deploy Apps Script Web App

1. In Apps Script, click the blue **Deploy** button (top right) ➔ **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `Production API v1.0`
   - **Execute as:** `Me (your Google account)`
   - **Who has access:** `Anyone` *(Secured via optional `API_KEY` parameter)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (looks like `https://script.google.com/macros/s/AKfyc.../exec`).

---

## Step 5: Test Locally

1. Open PowerShell in `D:\Repo\Lorry`.
2. Start the local server:
   ```powershell
   py -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.
4. Click the **⚙️ Settings & Sync** tab.
5. Paste your **Google Apps Script Web App URL**.
6. If you configured an `API_KEY`, paste it into the **API Secret Key** input.
7. Paste your Google Form link into the **Google Form URL** input.
8. Click **Save Settings**, then click **🔄 Sync** in the top right.
9. Verify that data loads directly from your Google Sheet into the dashboard!

---

## Step 6: Push to GitHub & Deploy on Cloudflare Pages (Free)

1. Open PowerShell in `D:\Repo\Lorry`:
   ```powershell
   git add .
   git commit -m "Configure full Google Sheets + Apps Script pipeline"
   ```
2. Create a new **Private Repository** on GitHub (e.g. `lorry-management`).
3. Push your code:
   ```powershell
   git remote add origin https://github.com/<YOUR_GITHUB_USER>/lorry-management.git
   git branch -M main
   git push -u origin main
   ```
4. Log into [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Compute (Workers) ➔ Pages**.
5. Click **Connect to Git** ➔ Select your repository `lorry-management`.
6. Settings:
   - **Project Name:** `lorry-fleet`
   - **Framework:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `.` *(root)*
7. Click **Save and Deploy**.
8. Cloudflare will publish your live website URL in ~30 seconds (e.g. `https://lorry-fleet.pages.dev`).
9. Open that URL on your phone or computer, go to **⚙️ Settings & Sync**, enter your API URL and key, and click **Save Settings**.

# Sample Ledger — Lab Sample Tracker

A free, read+write dashboard for tracking lab samples. The site (`index.html`) is
static and hosted free on GitHub Pages. The data lives in a Google Sheet, and a
small Apps Script (`Code.gs`) turns that Sheet into an API the dashboard can read
from and write to. No paid services required.

It's not instant push-to-all-devices real time (that would need Firebase) — the
dashboard polls the Sheet on a timer (default every 20 seconds) and on manual
refresh, which is normally plenty fast for a sample log.

## 1. Set up the Google Sheet

1. Create a new Google Sheet.
2. Rename the first tab to exactly: `Samples`
3. In row 1, add these column headers, in this exact order:

   ```
   ID | Name | HospitalNumber | Age | Sex | TestOrdered | DateOrdered | Status | DateResultReceived | Remarks | LastUpdated
   ```

## 2. Deploy the Apps Script backend

1. In the Sheet: **Extensions → Apps Script**.
2. Delete the placeholder code, and paste in the contents of `Code.gs` (included here).
3. Click **Deploy → New deployment**.
4. For "Select type," choose **Web app**.
5. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy**, authorize the permissions it asks for (this is your own script
   acting on your own Sheet), and copy the **Web app URL** it gives you
   (ends in `/exec`).
7. Any time you edit `Code.gs` later, you need to go to **Deploy → Manage
   deployments → edit (pencil) → New version → Deploy** for changes to take effect.

Note: "Anyone" access means anyone with the Web app URL can call these two
functions (list/add/update/delete samples) — it does **not** make your Sheet
itself public or viewable in Google Drive. Don't share the URL outside your lab.

## 3. Host the dashboard on GitHub Pages (free)

1. Create a new GitHub repository (public repos get free Pages hosting).
2. Upload `index.html` to the repo root.
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment," set **Source: Deploy from a branch**, branch
   `main`, folder `/ (root)`. Save.
5. GitHub gives you a URL like `https://yourname.github.io/your-repo/` — that's
   your live dashboard.

## 4. Connect the dashboard to your Sheet

1. Open your GitHub Pages URL.
2. Click **Settings** (top right of the dashboard).
3. Paste the Apps Script Web app URL from step 2.6.
4. Click **Save & connect**.

The connection URL is stored in your browser only (not committed to the repo),
so each person opening the dashboard enters it once. If you want it baked in for
everyone automatically, you can hardcode the URL into `index.html` where
`state.apiUrl` is set — but keep in mind it'll then be visible to anyone who
views the page source.

## Using it

- **New test**: top-right button. Leave the Test ID blank to auto-generate one
  (`T-XXXXXXXX`).
- **Edit or delete**: click any row to open it, edit fields, or use "Delete
  record."
- **Filter / search**: status tabs and the search box filter what's shown
  (doesn't change the data).
- **Status colors**: grey = Sample Not Received, teal = Sample Received, amber
  = Result Awaited, moss = Completed.

## A note on patient data

This sheet will contain names, hospital numbers, and test results — treat
access to the Sheet and the Apps Script URL the same way you'd treat any other
patient record system: don't share the URL outside authorized staff, and check
your institution's policy on storing patient data in Google Sheets before
using this for real patients.

## Customizing fields

To add a column (e.g. `Temperature` or `Batch`):
1. Add the column header to row 1 of the Sheet.
2. Add a matching `<div class="field">` block to the form in `index.html` and a
   `<th>`/`<td>` pair to the table — the Apps Script backend already passes
   through any field present in both the Sheet headers and the posted payload,
   so no `Code.gs` changes are needed for simple text fields.

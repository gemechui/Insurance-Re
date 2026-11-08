# Ethiopian Insurance Corporation — Renewal Manager

A standalone, installable, **offline-first** web app to track policy renewals
across all branches, districts and products. Built for an Ethiopian insurance
portfolio (14 districts, 125 branches, ~158 000 policies, 40 products, 9
sectors, 14 non-renewal reasons).

It runs entirely in the browser — no backend, no login, **no outbound calls**
after the first load. Fonts and the Excel library are self-hosted. A service
worker caches everything so the app keeps working offline on phones, tablets
and desktops. All renewal statuses, manually-added policies, edits, deletions
and officer settings are stored in the browser's `localStorage`.

## What's inside

```
insurance-renewal-manager/
├─ index.html              ← the whole app (single page)
├─ manifest.json           ← PWA manifest (name, icons, theme, shortcuts)
├─ sw.js                   ← service worker (caching & offline support)
├─ fonts.css               ← @font-face rules for self-hosted fonts
├─ fonts/                  ← ~46 woff2 files (~1.7 MB) for Bricolage, IBM Plex, Noto Sans Ethiopic
├─ vendor/
│  └─ xlsx.full.min.js     ← self-hosted SheetJS for Excel import/export
├─ icons/                  ← PWA icons: 192, 512, maskable 512, apple-touch, favicon
├─ data/
│  ├─ meta.json            ← districts, branches, products, sectors, reasons, aggregates
│  ├─ adama.json           ← per-district policy lists (14 files, ~17 MB total)
│  ├─ bahirdar.json
│  ├─ …
│  └─ south-east.json
└─ README.md               ← this file
```

## Features

| View | What you can do |
|------|-----------------|
| **Dashboard** | KPIs (policies, premium, renewed, due this month), expiries-by-month bar chart (stacked by Renewed / Not renewed / **New** / Open). Renewal performance table with a **By district / By branch** toggle so you can see performance either by district or by branch. The top banner shows contextual notifications (urgent expiry, past-due, renewal progress, offline). |
| **Policy register** | Search, filter (status incl. a new **"New"** status for newly-added policies, expiry window, branch, product, assigned, sort), paginated table for ~158 000 policies. **Click a row** to open a drawer where you can: update the renewal status (Renewed / Not renewed / New / No status), assignee, renewal policy ID, non-renewal reason and notes; **edit** any policy field (name, branch, product, premium, etc.); **reset tracking** (clear status/assignee/notes); or **delete** the policy. **Bulk operations**: select one, several, all-on-page, or all-matching rows via checkboxes, then bulk-set status, bulk-assign, bulk-export, or bulk-delete. |
| **Expiry alerts** | Tiered alert windows (Expired / 7 days / 8–30 / 31–60 / 91–120). One-click export of any tier to Excel. Email-digest composer that opens your mail app with a pre-filled reminder. |
| **Add policy** | Manually add a new policy with all 14 fields (policy number, ID, customer name, branch, district, product, sector, insurance-end date, premium, sum insured, renewal status — defaults to **"New"**, renewal policy ID, reason, other remarks). Saved in this browser, joins the district you pick. |
| **Reports** | Group renewal outcomes by **district / branch / month / product / status**. The new **Status** tab gives a one-page renewal-status report (Open / New / Renewed / Not renewed with counts, premiums and renewal rate). Export to CSV, or click **Export to PDF** for a printable PDF with the EIC logo header. |
| **Officers** | Add the people who handle renewals so policies can be assigned. Names are stored locally — used only as labels. Roles (Administrator / Manager / Officer) describe what each person can do. |
| **Data & Excel** | Import a renewal-list workbook (.xlsx / .xls / .csv), export the current register, backup/restore all local data (including edits, deletions and manually-added policies) to a JSON file, plus a built-in data-validation panel and a **Restore deleted policies** panel that lets you recover any policy you deleted — individually or all at once. |

## Bilingual UI

Click the **EN · አማ** button at the bottom of the navigation to switch between
English and Amharic (አማርኛ). The choice is remembered in `localStorage`. Amharic uses
the **Noto Sans Ethiopic** font.

## Theme

Click the **☾** button to switch between Auto / Light / Dark themes. The choice is
remembered in `localStorage`.

## How to publish

The app is plain HTML + JSON. Host the whole `insurance-renewal-manager/` folder on any
static web host:

### Option 1 — Netlify (easiest)

1. Sign in at https://app.netlify.com (free).
2. Click **Add new site → Deploy manually**.
3. Drag the entire `insurance-renewal-manager/` folder onto the page.
4. Done — you get a `https://random-name.netlify.app` URL.

### Option 2 — GitHub Pages

1. Create a new public GitHub repository.
2. Upload the contents of `insurance-renewal-manager/` to the repo root.
3. In the repo settings → **Pages** → set **Source** to `main` branch, `/root`.
4. After ~1 minute you'll get a `https://<user>.github.io/<repo>/` URL.

### Option 3 — Any web host (cPanel, shared hosting, Nginx, etc.)

Upload the `insurance-renewal-manager/` folder to your `public_html` (or equivalent).
Open `https://your-domain.com/path/to/insurance-renewal-manager/index.html`.

### Option 4 — Local file (no internet)

You can also just double-click `index.html` to open it from your file manager — the
app will work, but it's slower because the per-district JSON files are loaded via
`fetch()` which some browsers restrict on the `file://` protocol. **For day-to-day
use, host it on a static server** (Options 1–3 above).

### Important: the data folder must be served

The app reads `data/meta.json` and `data/<district>.json` over HTTP. Make sure your
host serves the `data/` folder with the correct `Content-Type: application/json`
header. Most static hosts do this by default.

### Important: HTTPS for the service worker

For the **offline / installable** PWA features to work, the app must be served
over **HTTPS** (or from `http://localhost` for development). All the static
hosts in Options 1–3 above serve HTTPS by default. If you self-host on plain
HTTP, the app still loads and works — but the service worker won't register,
so offline mode and the install button won't be available.

## Exporting a view to PDF

Every view in the app (Dashboard, Policy register, Expiry alerts, Add policy,
Reports, Officers, Data & Excel) has an **Export to PDF** button in the
top-right of the header, next to the District selector.

Click it on any view to open your browser's print dialog with the current
view rendered as a print document. Choose **Save as PDF** as the destination
to download a PDF. Every PDF includes:

- A print-only header at the top: the **Ethiopian Insurance Corporation logo**,
  the org name ("Ethiopian Insurance Corporation" or "የኢትዮጵያ መድን ኮርፖሬሽን"),
  the name of the report (e.g. "Dashboard", "Reports"), the selected
  district scope, and the date/time it was generated.
- A footer on every page: **"Ethiopian Insurance Corporation · Page N of M"**
  with real page numbers.

The Reports view uses a tighter table layout for print so all 8 columns
(Policies, Net premium, Renewed, Not renewed, Open, Renewed premium,
Renewal rate, etc.) fit on A4 portrait without truncation. All other views
print as standard A4 portrait.

The header text and report name localize to Amharic when the app is in
Amharic mode — switch languages before clicking Export to PDF.

## Editing, deleting, and bulk operations

### Single policy

Open any policy from the **Policy register** to see its details in a drawer.

- **Renewal tracking form** — set Renewed / Not renewed, assign to an officer, enter the renewal policy ID, pick a non-renewal reason, add notes. **Save** to commit.
- **Edit policy** — opens a form to change any field: policy number, customer name, branch, district, product, sector, insurance-end date, premium, sum insured. **Policy ID is locked** — to use a different ID, delete the policy and add a new one.
- **Reset tracking** — clears the renewal status, assignee, renewal policy ID, reason and notes for this policy. The policy itself is not deleted. Two-step confirm.
- **Delete policy** — hides the policy from all views (it stays in the bundled master data file, but is filtered out everywhere). Two-step confirm.

Edits and deletions are stored in `localStorage` (`irm.edits`, `irm.deleted`) and override the bundled data at render time. Use **Download backup** on the Data & Excel tab to export them.

### Bulk operations

In the **Policy register**, every row has a checkbox. Tick one or more rows; a bulk-action bar appears above the table.

- **Select all on page** — checkbox in the table header.
- **Select all N matching** — link in the bulk bar; selects every row in the current filter (not just the current page).
- **Set status** — bulk-update Renewed / Not renewed / No status. For "Not renewed" the existing reason is preserved.
- **Assign to** — bulk-assign to an officer (or unassign).
- **Export selected** — download only the selected rows to Excel.
- **Delete selected** — bulk-delete the selected policies (two-step confirm).
- **Clear selection** — deselect everything.

The bulk bar shows the count of selected rows. Changing a filter (status, expiry, branch, etc.) clears the selection.

## Sharing data between computers

Because renewal statuses, manually-added policies and officer settings live in your
browser's `localStorage`, they don't sync between machines automatically. To share:

1. Open **Data & Excel** on the source computer.
2. Click **Download backup** — saves `renewal-backup-YYYY-MM-DD.json`.
3. Move that JSON file to the target computer.
4. Open **Data & Excel** on the target computer.
5. Under **Restore from a backup file**, pick the JSON file and click **Restore**.

## Updating the policy master data

The bundled policy lists come from your renewal-list workbook. To update them:

- Use the **Add policy** view to add new policies one by one, or
- Use the **Import from Excel** flow on the Data & Excel tab to bulk-import a fresh
  workbook (rows with a status update existing policies; rows for unknown policy IDs
  are added as new).
- Use **Export to Excel** to download the current register in the same column layout
  as the source workbook.

## Editing, deleting and restoring policies

The app supports both single-policy and bulk operations:

**Single policy** — open any policy in the Policy register, then in the drawer use the
**Policy actions** row at the bottom:

- **Edit policy** — opens a full form with all 10 editable fields (policy number,
  customer name, district, branch, product, sector, insurance-end date, premium,
  sum insured). Policy ID is locked (change it by deleting and re-adding).
- **Reset tracking** — clears the renewal status, assignee, renewal policy ID,
  non-renewal reason and notes. Useful when you want to start tracking a policy
  from scratch.
- **Delete** — removes the policy from the register. The deletion is reversible
  (see below).

**Bulk operations** — in the Policy register, tick the checkbox in the leftmost
column of each row you want to act on. Use the **select-all-on-page** checkbox in
the header, or the **"Select all N matching"** link in the bulk bar to act on every
row that matches the current filter. When one or more rows are selected, a bulk
action bar appears at the top with:

- **Set status** — apply Renewed / Not renewed / No status to all selected.
- **Assign to** — assign all selected to a single officer (or unassign).
- **Export selected** — download only the selected rows to Excel.
- **Delete selected** — remove all selected from the register (with two-step
  confirmation).
- **Clear selection** — deselect everything.

**Restore deleted policies** — open the Data & Excel tab. The **Restore deleted
policies** panel shows every policy you have deleted, with its policy number,
customer name, district, branch, expiry, premium and deletion date. Click
**Restore** next to any row, or **Restore all** at the top, to bring them back
into the register. Deletions are also included in the JSON backup, so they
survive backup-restore round-trips between computers.

## Backing up

Use **Download backup** on the Data & Excel tab. The backup JSON contains:

- `staff` — your local officer list
- `track` — all renewal-status records
- `added` — all manually-added policies
- `edits` — every field-level edit you made to bundled policies (so corrections
  survive backup-restore round-trips)
- `deleted` — the IDs of every policy you deleted
- `deletedRows` — the captured metadata (policy number, customer name, branch,
  district, expiry, premium, deletion date) for each deleted policy, used by the
  Restore deleted policies panel

It does **not** contain the policy master data (the bundled JSON files) because that
ships with the app and is replaced when you re-deploy a new build.

## Privacy

The app makes **no outbound calls** after the first load. Everything —
fonts (Bricolage Grotesque, IBM Plex Sans/Mono, Noto Sans Ethiopic), the
SheetJS Excel library, the JSON data files, the icons — is bundled and
served from the same origin. The Service Worker caches it all so the app
works fully offline.

No analytics, no telemetry, no Claude.ai / Firebase calls — all data stays
in your browser.

## Installing as an app (PWA)

The web app is a **Progressive Web App** — installable on phones, tablets and
desktops, and works offline. After opening it once on a device, the service
worker caches the shell, fonts and JSON data so the app keeps working without
internet.

### Android (Chrome / Edge / Samsung Internet)

1. Open the app URL in your browser.
2. Tap the **menu** (⋮ in the top-right corner).
3. Tap **Install app** (or **Add to Home screen**).
4. Confirm. The app appears on your home screen and opens full-screen.

You can also tap the **⤓ Install app** button in the bottom of the navigation
rail inside the app — it triggers the same prompt.

### iPhone / iPad (Safari)

iOS doesn't show an install button automatically. To install:

1. Open the app URL in **Safari** (other iOS browsers don't support PWA install).
2. Tap the **Share** button (square with up-arrow).
3. Tap **Add to Home Screen**.
4. Tap **Add**. The app appears on your home screen with its own icon and
   opens full-screen, hiding Safari's address bar.

> The app will show a one-time toast hint about this when you first open it on
> iOS.

### Windows / macOS (Chrome, Edge, Brave)

1. Open the app URL.
2. Look for the **install icon** (⊕) in the address bar, or:
   - Chrome: menu (⋮) → **Install Ethiopian Insurance Corporation…**
   - Edge: menu (⋯) → **Apps** → **Install this site as an app**
3. Confirm. The app opens in its own window, with its own icon in the taskbar /
   dock / start menu.

You can also click the **⤓ Install app** button inside the app.

### Working offline

After the first load, the app caches everything it needs. If you lose your
connection — or you're using the app on a phone with no data — you can still:

- View the dashboard and all reports
- Search and filter the policy register for any district you've opened before
- Add, edit and delete policies
- Renew tracking (status, assignee, notes, etc.)
- Switch between English and Amharic
- Export to Excel
- Back up and restore your data

A small green dot in the bottom-left of the navigation shows your network
status. It turns red when you're offline. New policies you add while offline
are saved in your browser's `localStorage` and synced to the cache when you
come back online.

> The very first time you open a district you've never opened before, the app
> needs a connection to download that district's JSON file (~1–4 MB). After
> that, the district works offline. The Data & Excel tab has a "Load all
> districts" option to pre-cache everything for full offline use.

### Updating the app

When you deploy a new version, the service worker detects it on next reload
(or within ~60 minutes of having the tab open). An **"A new version is
available · Reload"** banner appears at the top — click Reload to switch to
the new version.

## Browser support

Works in any current Chrome, Edge, Firefox, Safari or Samsung Internet (16+
releases). Requires `localStorage`, `fetch` and service workers for offline
mode. The full NEKEMTE district loads in under a second; the full 17 MB
portfolio across all 14 districts loads in ~3–5 seconds on a fast connection.

## License

Internal business tool — adapt to your needs.

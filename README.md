## Kipling Food Orders

Food ordering app for Kipling, Class F 2027 committee. Students browse
restaurants and menus, place an order, and upload a payment screenshot.
Ordering is only open on Saturdays (delivery Sunday) and Mondays (delivery
Tuesday).

### Stack

- Next.js (App Router, TypeScript, Tailwind)
- Google Sheets as the database (restaurants, menu items, orders)
- Google Drive for payment screenshots

No traditional database is used — everything is stored in a Google Sheet you
can open and read directly, with screenshots saved to a Google Drive folder.

### Setup

**1. Create a Google Cloud service account**

- Go to the [Google Cloud Console](https://console.cloud.google.com/), create
  (or pick) a project.
- Enable the **Google Sheets API** and **Google Drive API** for it.
- Go to **APIs & Services → Credentials → Create Credentials → Service
  Account**. Give it any name.
- Open the service account, go to **Keys → Add Key → Create new key → JSON**,
  and download it. It contains `client_email` and `private_key`.

**2. Create the Google Sheet**

- Create a new Google Sheet (sheets.new).
- Share it with the service account's `client_email` (found in the JSON key)
  as **Editor**.
- Copy the spreadsheet ID from its URL:
  `https://docs.google.com/spreadsheets/d/THIS_PART/edit`

**3. Create a Google Drive folder for screenshots**

- Create a folder in Google Drive.
- Share it with the same service account email as **Editor**.
- Copy the folder ID from its URL:
  `https://drive.google.com/drive/folders/THIS_PART`

**4. Configure the app**

- Copy `.env.local.example` to `.env.local` and fill in:
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` from
    the downloaded JSON key (keep the `\n` line breaks in the private key).
  - `GOOGLE_SHEET_ID` and `GOOGLE_DRIVE_FOLDER_ID` from steps 2–3.
  - `ADMIN_PASSWORD`: the single shared password for the committee admin
    dashboard at `/admin`.
- Run `node scripts/setup-sheet.mjs` once to create the `Restaurants`,
  `MenuItems`, and `Orders` tabs (with header rows) in your sheet.
- Edit `src/lib/payment-config.ts` with the real Instapay/Telda handles.
- `npm install && npm run dev`.

### Adding restaurants and menu items

Use the admin dashboard at `/admin/restaurants` (recommended), or edit the
`Restaurants` / `MenuItems` tabs in the Google Sheet directly — both work,
since they're the same data.

### App structure

- `/` — landing page
- `/order` — restaurant list (server-side gated to Saturday/Monday only)
- `/order/[restaurantId]` — menu + cart
- `/checkout` — student details, payment instructions, screenshot upload
- `/status` — order status lookup by phone number
- `/admin` — shared-password login
- `/admin/dashboard` — orders grouped by delivery date, screenshots, status updates
- `/admin/restaurants` — manage restaurants and menu items

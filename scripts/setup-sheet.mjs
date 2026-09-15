// One-time setup: creates the Restaurants / MenuItems / Orders tabs (with
// header rows) in your Google Sheet. Run once after creating the sheet and
// filling in .env.local:
//
//   node scripts/setup-sheet.mjs

import { readFileSync, existsSync } from "fs";
import { google } from "googleapis";

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const SHEETS = {
  Restaurants: ["id", "name", "description", "is_active", "created_at"],
  MenuItems: [
    "id",
    "restaurant_id",
    "name",
    "description",
    "price",
    "is_available",
    "created_at",
  ],
  Orders: [
    "id",
    "created_at",
    "student_name",
    "student_class",
    "student_phone",
    "restaurant_id",
    "restaurant_name",
    "delivery_date",
    "status",
    "screenshot_url",
    "total_amount",
    "items_json",
  ],
};

async function main() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    console.error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, or GOOGLE_SHEET_ID.\n" +
        "Fill these in .env.local first (see README.md)."
    );
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const existing = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = new Set(
    existing.data.sheets?.map((s) => s.properties?.title) ?? []
  );

  const sheetsToAdd = Object.keys(SHEETS).filter((title) => !existingTitles.has(title));

  if (sheetsToAdd.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: sheetsToAdd.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
    console.log(`Created tabs: ${sheetsToAdd.join(", ")}`);
  }

  for (const [title, headers] of Object.entries(SHEETS)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }

  console.log("Done! Restaurants, MenuItems, and Orders tabs are ready.");

  // The default "Sheet1" tab is unused by the app — leave it or delete it
  // manually in Google Sheets, whichever you prefer.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

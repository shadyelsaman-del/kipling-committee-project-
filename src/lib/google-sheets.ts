import "server-only";
import { google } from "googleapis";

function getCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, or GOOGLE_SHEET_ID environment variables."
    );
  }

  // .env files can't hold literal newlines, so the key is stored with \n escapes.
  return { email, privateKey: privateKey.replace(/\\n/g, "\n"), spreadsheetId };
}

function getAuth() {
  const { email, privateKey } = getCredentials();
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
}

export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

export function getSpreadsheetId() {
  return getCredentials().spreadsheetId;
}

/** One data row from a sheet, along with its 1-indexed row number (for updates/deletes). */
export interface SheetRow {
  rowNumber: number;
  values: string[];
}

/** Reads all data rows from a sheet (assumes row 1 is a header row). */
export async function getRows(sheetName: string): Promise<SheetRow[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A2:Z`,
  });

  return (res.data.values ?? []).map((values, i) => ({
    rowNumber: i + 2,
    values: values.map((v) => String(v ?? "")),
  }));
}

export async function appendRow(sheetName: string, values: (string | number)[]) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

export async function updateRow(
  sheetName: string,
  rowNumber: number,
  values: (string | number)[]
) {
  const sheets = getSheetsClient();
  const lastCol = String.fromCharCode("A".charCodeAt(0) + values.length - 1);
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A${rowNumber}:${lastCol}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

async function getSheetIdByTitle(title: string): Promise<number> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });
  const sheet = res.data.sheets?.find((s) => s.properties?.title === title);
  if (sheet?.properties?.sheetId == null) {
    throw new Error(`Sheet tab "${title}" not found in the spreadsheet.`);
  }
  return sheet.properties.sheetId;
}

export async function deleteRow(sheetName: string, rowNumber: number) {
  const sheets = getSheetsClient();
  const sheetId = await getSheetIdByTitle(sheetName);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}

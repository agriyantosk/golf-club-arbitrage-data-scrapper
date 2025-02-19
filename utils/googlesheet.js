import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "./google-keyfile.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function writeToSheet(values) {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = "Sheet1!A1";
  const valueInputOption = "USER_ENTERED";

  const resource = { values }; // The data to be written.

  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    });
    return res;
  } catch (error) {
    console.error("error", error);
  }
}

export async function readSheet() {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = "Local Research!C7:G8";

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values; // Extracts the rows from the response.
    return rows; // Returns the rows.
  } catch (error) {
    console.error("error", error); // Logs errors.
  }
}

import { google } from "googleapis";
import { usernameLocations } from "../constant/input.js";

const auth = new google.auth.GoogleAuth({
  keyFile: "./google-keyfile.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function insertInstagramScrapedData(username, scrapedData) {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const startCell = await getStartingCell(username);
  if (!startCell) return console.error("🚨 Cannot insert: Username not found!");

  let { column, row } = startCell;
  row += 2;
  let counter = 1;

  try {
    for (let item of scrapedData) {
      if (counter > 50) {
        console.log("⚠️ Table limit reached (50 rows). Stopping insert.");
        break;
      }

      const values = [
        counter,
        item.brand,
        item.type,
        item.model,
        item.price,
        item.condition,
        item.instaLink || "-",
        item.postedDate,
        item.editedDate || "",
        `=IMAGE("${item.itemImageUrl}")`,
      ];

      const range = `Local Research!${column}${row}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values: [values] },
      });

      console.log(`✅ Inserted row ${row}`);
      row++;
      counter++;
    }
  } catch (error) {
    console.error("Error inserting data from Instagram:", error);
    throw Error(error);
  }
}

export async function getStartingCell(username) {
  const location = usernameLocations[username.toLowerCase()];
  console.log("location:", location);
  if (location) {
    console.log(`✅ Found username at ${location.column}${location.row}`);
    return location;
  }
  console.log("❌ Username not found in predefined locations!");
  return null;
}

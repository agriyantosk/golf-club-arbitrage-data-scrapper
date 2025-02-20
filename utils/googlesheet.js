import { google } from "googleapis";
import { usernameLocations } from "../constant/input.js";

const auth = new google.auth.GoogleAuth({
  keyFile: "./google-keyfile.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// export async function writeToSheet(values) {
//   const sheets = google.sheets({ version: "v4", auth });
//   const spreadsheetId = process.env.GOOGLE_SHEET_ID;
//   const range = "Sheet1!A1";
//   const valueInputOption = "USER_ENTERED";

//   const resource = { values }; // The data to be written.

//   try {
//     const res = await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range,
//       valueInputOption,
//       resource,
//     });
//     return res;
//   } catch (error) {
//     console.error("error", error);
//   }
// }

export async function insertScrapedData(username, scrapedData) {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // Step 1: Find the starting point
  const startCell = await getStartingCell(username);
  if (!startCell) return console.error("🚨 Cannot insert: Username not found!");

  let { column, row } = startCell;
  row += 2; // Move down 2 rows for insertion
  let counter = 1; // Start numbering items

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
    console.error("Error inserting data:", error);
  }
}

// export async function getStartingCell(username) {
//   const sheets = google.sheets({ version: "v4", auth });
//   const spreadsheetId = process.env.GOOGLE_SHEET_ID;

//   // Define search pattern
//   const columnGroups = ["B", "M", "X", "AI"]; // Move right
//   let row = 2; // Start from row 2

//   try {
//     while (row < 1000) {
//       // Prevent infinite loops
//       for (let col of columnGroups) {
//         const range = `Local Research!${col}${row}`;
//         const response = await sheets.spreadsheets.values.get({
//           spreadsheetId,
//           range,
//         });
//         const cellValue = response.data.values?.[0]?.[0] || "";

//         if (cellValue.toLowerCase() === username.toLowerCase()) {
//           console.log(`✅ Found username at ${col}${row}`);
//           return { column: col, row };
//         }
//       }
//       row++; // Move down if username not found
//     }

//     console.log("❌ Username not found!");
//     return null;
//   } catch (error) {
//     console.error("Error finding username:", error);
//     return null;
//   }
// }

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

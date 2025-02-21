import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "./google-keyfile.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const insertGolfPartnerScrapedData = async (scrapedData) => {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  try {
    let row = 4;
    for (const item of scrapedData) {
      let range = `Japan Research!C${row}`;
      const values = [
        item.brand || "",
        item.model,
        item.type,
        item.price,
        item.condition,
        item.link,
        `=IMAGE("${item.imgUrl}")`,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values: [values] },
      });
      row++;
      console.log(`✅ Inserted row ${row}`);
    }
  } catch (error) {
    console.error("Error inserting data from Golf Partner:", error);
    throw Error(error);
  }
};

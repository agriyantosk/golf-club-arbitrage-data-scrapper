import { brands, types } from "../constant/productMapping.js";
import { google } from "googleapis";

const extractBrandAndType = (productName) => {
  let lowerName = productName.toLowerCase();

  let brand = brands.find((b) => lowerName.includes(b.toLowerCase()));
  if (!brand) return { brand: "Unknown", model: productName, type: "Unknown" };

  let model = productName.split(new RegExp(brand, "i"))[1]?.trim() || "Unknown";
  let type = types.find((t) => lowerName.includes(t.toLowerCase())) || "Other";

  return { brand, model, type };
};

async function insertTokopediaGoogleSheets(data) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./google-keyfile.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const values = data.map(
      ({ name, price, productLink, shopName, domicile, imageSrc }) => {
        const { brand, model, type } = extractBrandAndType(name);
        return [
          brand,
          model,
          type,
          price,
          (condition = "USED"),
          productLink,
          shopName,
          domicile,
          imageSrc,
        ];
      }
    );

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Ecommerce Research!C4",
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    console.log("Inserted into Google Sheets!");
  } catch (error) {
    console.error("Error inserting into Google Sheets:", error);
  }
}

export default insertTokopediaGoogleSheets;

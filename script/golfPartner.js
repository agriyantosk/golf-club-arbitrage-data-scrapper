import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { filters } from "../constant/keywords.js";
import {
  extractFw,
  extractHybrid,
  extractIronset,
} from "../utils/golfPartner.js";

const scrapeGolfClubDetails = async (url, type) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    });

    const decodedData = iconv.decode(Buffer.from(response.data), "Shift_JIS");
    const $ = cheerio.load(decodedData);

    let extractedData;

    switch (type) {
      case "ironset":
        extractedData = extractIronset($);
        break;
      case "hybrid":
        extractedData = extractHybrid($);
        break;
      case "fw":
        extractedData = extractFw($);
        break;
      default:
        extractedData = "UNKNOWN";
        break;
    }

    return extractedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

async function golfPartner(filter, keyword) {
  try {
    if (!filters[filter]) throw new Error("Invalid Filter!");
    const listUrl = `https://www.golfpartner.jp/shop/usedgoods/${
      filters[filter]
    }__spnocg/?search=x&keyword=${keyword.replaceAll(
      " ",
      "%20"
    )}&limit=100&usedgoods_limit=100`;

    const response = await axios.get(listUrl, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    });

    const decodedData = iconv.decode(Buffer.from(response.data), "Shift_JIS");
    const $ = cheerio.load(decodedData);

    const results = [];

    const items = $(".StyleT_Item_.tile_item_").toArray();

    for (const element of items) {
      const cleanText = (selector) =>
        $(element).find(selector).text().trim().replace(/\s+/g, " ");

      const getAttr = (selector, attr = "src") =>
        $(element).find(selector).attr(attr) || "";

      const formatPrice = (price) =>
        parseInt(price.replace(/[^\d]/g, ""), 10) || 0;

      let product_name = cleanText(".name1_ a");
      let normalizedProductName = product_name.normalize("NFKC").toUpperCase();
      const normalizedKeyword = keyword.normalize("NFKC").toUpperCase();

      if (normalizedProductName.includes("・", ""))
        normalizedProductName = normalizedProductName.replaceAll("・", "");

      if (
        !normalizedProductName
          .toLowerCase()
          .includes(normalizedKeyword.toLowerCase())
      ) {
        continue;
      }

      const price = formatPrice(cleanText(".price_"));
      const image_url = `https://www.golfpartner.jp${getAttr(
        ".goods_name_ img",
        "src"
      )}`;

      if (image_url.includes("/sys/usedsorryL.jpg")) continue;

      const product_url = `https://www.golfpartner.jp${getAttr(
        ".name1_ a",
        "href"
      )}`;

      const clubDetail = await scrapeGolfClubDetails(product_url, filter);

      results.push({
        product_name: normalizedProductName,
        price,
        type: clubDetail,
        condition: "USED",
        image_url,
        product_url,
      });
    }

    console.log(results);
    console.log("Starting to insert scraped datas...");
    // code to insert to google sheets
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export default golfPartner;

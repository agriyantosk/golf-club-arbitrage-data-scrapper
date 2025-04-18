import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { filters } from "../constant/keywords.js";
import {
  extractFw,
  extractHybrid,
  extractIronset,
} from "../utils/golfPartner.js";
import { insertGolfPartnerScrapedData } from "../utils/golfParnterGooglesheets.js";
import { translateText } from "../utils/utils.js";

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
      case "driver":
        extractedData = "Driver";
        break;
      case "fw":
        extractedData = extractFw($);
        break;
      case "hybrid":
        extractedData = extractHybrid($);
        break;
      case "ironset":
        extractedData = extractIronset($);
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

async function golfPartner(
  filter,
  keyword,
  page,
  startingRow,
  startingColumn = "C"
) {
  try {
    console.log(startingRow, ">>");
    if (!filters[filter]) throw new Error("Invalid Filter!");
    if (!startingRow) throw new Error("Please input startingRow!");
    const limit = ["20", "50", "100"];
    // let startingRow = 1437;
    // let startingColumn = "C";

    const listUrl = `https://www.golfpartner.jp/shop/usedgoods/${
      filters[filter]
    }__spnocg${page ? "_p" + page : ""}/?search=x&keyword=${keyword.replaceAll(
      " ",
      "%20"
    )}&limit=${limit[2]}&usedgoods_limit=${limit[2]}`;

    console.log("Searched URL: ", listUrl);

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

      const brand = $(element)
        .find(".name2_ a")
        .text()
        .trim()
        .replace(/\s+/g, " ");
      let product_name = cleanText(".name1_ a");
      let normalizedProductName = product_name.normalize("NFKC").toUpperCase();
      const normalizedKeyword = keyword.normalize("NFKC").toUpperCase();

      if (normalizedProductName.includes("・", ""))
        normalizedProductName = normalizedProductName.replaceAll("・", "");

      const cleanName = normalizedProductName.replace(/\s+/g, "");

      if (
        !normalizedProductName
          .toLowerCase()
          .includes(normalizedKeyword.toLowerCase()) ||
        cleanName.includes("レディース") ||
        cleanName.includes("レフティ") ||
        cleanName.includes("PLUS") ||
        cleanName.includes("USA") ||
        cleanName.includes("CROSSOVER") ||
        cleanName.includes("GLOIRE") ||
        cleanName.includes("HL") ||
        cleanName.includes("LST") ||
        cleanName.includes("LS") ||
        cleanName.includes("SFT") ||
        cleanName.includes("LENGTH") ||
        // cleanName.includes("FAST") ||
        // !cleanName.includes("(2021)") ||
        cleanName.includes("HD")
      ) {
        continue;
      }

      const price = formatPrice(cleanText(".price_"));
      const image_url = `https://www.golfpartner.jp${getAttr(
        ".goods_name_ img",
        "src"
      )}`;

      // if (
      //   keyword.split(" ").includes("2023") ||
      //   keyword.split(" ").includes("2021")
      // ) {
      //   if (cleanText(".model_y_ span").includes("年式")) {
      //     normalizedProductName += ` ${cleanText(".model_y_ span")
      //       .split("年式")[1]
      //       .trim()}`;
      //   } else {
      //     normalizedProductName += " (Year Unknown)";
      //   }
      // }

      if (image_url.includes("/sys/usedsorryL.jpg")) continue;

      const product_url = `https://www.golfpartner.jp${getAttr(
        ".name1_ a",
        "href"
      )}`;

      const clubDetail = await scrapeGolfClubDetails(product_url, filter);
      if (clubDetail === "UNKNOWN" || clubDetail === false) {
        continue;
      }

      const temp = {
        brand: await translateText(brand),
        model: normalizedProductName,
        type: clubDetail,
        price,
        condition: "USED",
        link: product_url,
        imgUrl: image_url,
      };

      console.log(temp);

      results.push(temp);
    }

    console.log(`Successsfully scraped ${results.length} data`);
    console.log("Starting to insert scraped datas...");
    await insertGolfPartnerScrapedData(results, startingRow, startingColumn);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export default golfPartner;

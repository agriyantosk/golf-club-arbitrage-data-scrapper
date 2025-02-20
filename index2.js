import axios from "axios";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

const filters = {
  driver: "h010001",
  fw: "h010002",
  ironset: "h010004",
  hybrid: "h010003",
};

const extractFw = ($) => {
  const options = ["3W", "5W"];

  let extractedText = "";

  $(".desc_tbl_ tr").each((_, element) => {
    const tdText = $(element)
      .find("td")
      .text()
      .trim()
      .replace(/\s+/g, "")
      .normalize("NFKC");

    if (options.some((option) => tdText.includes(option))) {
      extractedText = tdText;
      return false; // Exit loop early if a match is found
    }
  });

  let result;

  switch (extractedText) {
    case "3W":
      result = "FW 3";
      break;
    case "5W":
      result = "FW 5";
      break;
    default:
      result = "UNKNWON";
      break;
  }
  return result || "UNKNOWN";
};

const extractIronset = ($) => {
  let ironSetText = "";

  $(".desc_tbl_ tr").each((_, element) => {
    const tdText = $(element).find("td").text().trim().replace(/\s+/g, " ");

    if (tdText.includes("ヘッドカバーなし")) {
      ironSetText = tdText.split("ヘッドカバーなし")[0].trim();
    }
  });

  if (!ironSetText) return "No data found";

  let set = ironSetText.split("Ｉ，").map((club) => club.trim());
  const replacements = { ＰＷ: "P", ＡＷ: "A", ＳＷ: "S", ＬＷ: "L" };
  set = set.map((club) => replacements[club] || club);

  const first = set[0];
  const last = set[set.length - 1];

  const formattedOutput = `${first}-${last}`;
  const validFormats = new Set(["4-S", "5-S", "6-S", "4-P", "5-P", "6-P"]);
  if (!validFormats.has(formattedOutput.normalize("NFKC"))) {
    return false;
  }
  return `Ironset ${formattedOutput.normalize("NFKC")}` || "UNKNWON";
};

const extractHybrid = ($) => {
  const options = ["2U", "3U", "4U", "5U"];

  let extractedText = "";

  $(".desc_tbl_ tr").each((_, element) => {
    const tdText = $(element)
      .find("td")
      .text()
      .trim()
      .replace(/\s+/g, "")
      .normalize("NFKC");

    if (options.some((option) => tdText.includes(option))) {
      extractedText = tdText;
      return false; // Exit loop early if a match is found
    }
  });

  let result;

  switch (extractedText) {
    case "2U":
      result = "Hybrid 2";
      break;
    case "3U":
      result = "Hybrid 3";
      break;
    case "4U":
      result = "Hybrid 4";
      break;
    case "5U":
      result = "Hybrid 5";
      break;
    default:
      result = "UNKNWON";
      break;
  }
  return result || "UNKNOWN";
};

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

async function scrapeGolfClubs() {
  try {
    const filter = process.argv[2];
    const keyword = process.argv[3];
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
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

scrapeGolfClubs();

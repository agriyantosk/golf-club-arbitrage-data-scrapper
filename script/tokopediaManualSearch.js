import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import productKeywords from "../constant/productKeywords.js";
import insertTokopediaGoogleSheets from "../utils/tokopediaGoogleSheets.js";

puppeteer.use(StealthPlugin());

const tokopediaScraper = async (pageNum = undefined) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-gpu",
      "--disable-infobars",
      "--hide-scrollbars",
      "--mute-audio",
      "--disable-features=site-per-process",
    ],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    const customUA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
    await page.setUserAgent(customUA);
    await page.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });

    let allProducts = [];
    let productNotFound = [];

    for (const keyword of productKeywords.slice(5, 10)) {
      const searchUrl = `https://www.tokopedia.com/search?q=${encodeURIComponent(
        keyword
      )}&preorder=false&condition=2`;

      console.log(`Searching for: ${keyword}`);
      console.log("Searched URL:", searchUrl);

      await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

      try {
        await page.waitForSelector('[data-testid="divSRPContentProducts"]', {
          timeout: 20000,
        });
      } catch (error) {
        console.warn(`No results found for "${keyword}", skipping...`);
        productNotFound.push(keyword);
        continue; // Move to the next keyword
      }

      console.log(`Extracting data for "${keyword}"...`);

      const products = await page.$$eval(
        '[data-testid="divSRPContentProducts"] .css-5wh65g',
        (items, keyword) =>
          items.map((item) => {
            const imageSrc =
              item.querySelector("img.css-1c345mg")?.src || "No Image";
            const name =
              item
                .querySelector("span[class*='_0T8-iGxMpV6NEsYEhwkqEg']")
                ?.textContent.trim() || "No Name";
            const price =
              item
                .querySelector("div[class*='_67d6E1xDKIzw+i2D2L0tjw']")
                ?.textContent.trim() || "No Price";
            const productLink =
              item.querySelector("a[class*='oQ94Awb6LlTiGByQZo8Lyw==']")
                ?.href || "No Product Link";
            const shopAndDomicile = item.querySelectorAll(
              "div[class*='Jh7geoVa-F3B5Hk8ORh2qw=='] span"
            );
            const shopName =
              shopAndDomicile[0]?.textContent.trim() || "No Shop";
            const domicile =
              shopAndDomicile[1]?.textContent.trim() || "No Domicile";

            return {
              keyword,
              imageSrc,
              productLink,
              name,
              price,
              shopName,
              domicile,
            };
          }),
        keyword
      );

      console.log(`Extracted ${products.length} products for "${keyword}"`);
      allProducts.push(...products);
    }

    console.log("All scraped products:", allProducts);
    console.log("Products not found:", productNotFound);

    insertTokopediaGoogleSheets(allProducts);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close(); // Ensure browser is closed
  }
};

export default tokopediaScraper;

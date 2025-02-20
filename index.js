import { config } from "dotenv";
import { ApifyClient } from "apify-client";
import fs from "fs";
import {
  clubModels,
  driverKeywords,
  hybridKeywords,
  ironsKeywords,
  newKeywords,
  priceKeywords,
  soldKeywords,
  usedKeywords,
  woodKeywords,
} from "./constant/keywords.js";
import {
  extractCondition,
  extractPrice,
  normalizeType,
} from "./utils/index.js";
import { date, usernameLocations, usernames } from "./constant/input.js";
import { insertScrapedData } from "./utils/googlesheet.js";
config();

const client = new ApifyClient({
  token: process.env.APIFY_PERSONAL_TOKEN,
});

(async () => {
  try {
    const results = [];
    const username = process.argv[2];
    console.log(username);
    if (!username || !usernames.includes(username.toLowerCase())) {
      throw new Error("Username must be valid!");
    }
    console.log(usernameLocations[username]);
    console.log("Script is running...");
    const run = await client.actor(process.env.APIFY_ACTOR_ID).call({
      username: [username],
      onlyPostsNewerThan: date,
    });

    console.log("Results from dataset");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    items.forEach((item) => {
      const formattedDate = new Date(item.timestamp);

      const detectedType = normalizeType(
        item.caption,
        driverKeywords,
        hybridKeywords,
        ironsKeywords,
        woodKeywords
      );
      const extractedPrice = extractPrice(item.caption, priceKeywords);
      const condition = extractCondition(
        item.caption,
        usedKeywords,
        newKeywords,
        soldKeywords
      );

      for (const brand in clubModels) {
        for (const model of clubModels[brand]) {
          if (item.caption.includes(model)) {
            const data = {
              brand: brand ?? "Brand Not Found",
              model: model ?? "Model Not Found",
              type: detectedType,
              instaLink: item.url,
              postedDate: formattedDate,
              itemImageUrl: item.displayUrl,
              condition: condition ?? "UNKNOWN",
              price: extractedPrice ?? "Price Not Found",
            };
            results.push(data);
          }
        }
      }
    });

    console.log("Starting to insert scraped datas...");
    await insertScrapedData(username, results);

    // TO TEST AND SEE THE OUTPUT
    fs.writeFileSync("output.json", JSON.stringify(results, null, 2), "utf-8");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

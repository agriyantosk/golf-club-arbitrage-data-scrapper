import { config } from "dotenv";
import { ApifyClient } from "apify-client";
import fs from "fs";
import {
  clubModels,
  driverKeywords,
  hybridKeywords,
  ironsKeywords,
  priceKeywords,
  woodKeywords,
} from "./constant/keywords.js";
import { extractPrice, normalizeType } from "./utils/index.js";
import { readSheet } from "./utils/googlesheet.js";
config();

const client = new ApifyClient({
  token: process.env.APIFY_PERSONAL_TOKEN,
});

(async () => {
  console.log("Script is running...");
  const readFile = await readSheet();
  console.log("readFile: ", readFile);
  //   const run = await client.actor(process.env.APIFY_ACTOR_ID).call({
  //     username: ["jakartagolfshop"],
  //     onlyPostsNewerThan: "2025-02-18",
  //   });

  //   console.log("Results from dataset");
  //   const { items } = await client.dataset(run.defaultDatasetId).listItems();

  //   items.forEach((item) => {
  //     const formattedDate = new Date(item.timestamp).toLocaleDateString("id-ID", {
  //       weekday: "long",
  //       day: "numeric",
  //       month: "long",
  //       year: "numeric",
  //     });

  //     const detectedType = normalizeType(
  //       item.caption,
  //       driverKeywords,
  //       hybridKeywords,
  //       ironsKeywords,
  //       woodKeywords
  //     );
  //     const extractedPrice = extractPrice(item.caption, priceKeywords);

  //     const results = [];

  //     for (const brand in clubModels) {
  //       for (const model of clubModels[brand]) {
  //         if (item.caption.includes(model)) {
  //           const data = {
  //             brand: brand ?? "Brand Not Found",
  //             model: model ?? "Model Not Found",
  //             type: detectedType,
  //             instaLink: item.url,
  //             postedDate: formattedDate,
  //             itemImageUrl: item.displayUrl,
  //             price: extractedPrice ? extractedPrice : "Price Not Found",
  //           };

  //           console.log(data);
  //           results.push(data);
  //         }
  //       }
  //     }

  //     // TO TEST AND SEE THE OUTPUT
  //     fs.writeFileSync("output.json", JSON.stringify(results, null, 2), "utf-8");
  //   });
})();

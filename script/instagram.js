import { config } from "dotenv";
import { ActorClient, ApifyClient } from "apify-client";
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
} from "../constant/keywords.js";
import {
  extractCondition,
  extractPrice,
  normalizeType,
} from "../utils/instagram.js";
import { date, usernameLocations, usernames } from "../constant/input.js";
import { insertScrapedData } from "../utils/googlesheet.js";
config();

const client = new ApifyClient({
  token: process.env.APIFY_PERSONAL_TOKEN,
});

const instagram = async (username) => {
  try {
    const results = [];
    console.log("Inputed Username: ", username);
    console.log("Checking inputs...");
    if (
      !username ||
      !usernames.includes(username.toLowerCase()) ||
      !usernameLocations[username]
    ) {
      throw new Error("Username must be valid!");
    }
    console.log("Inputs are valid!✅");
    console.log("Script is running...");
    const run = await client.actor(process.env.APIFY_ACTOR_ID).call({
      onlyPostsNewerThan: date,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        apifyProxyCountry: "TH",
      },
      resultsLimit: 3,
      skipPinnedPosts: true,
      username: [username],
    });

    console.log("Results from dataset");
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log("items: ", items);

    if (items[0].requestErrorMessages) {
      const errorReason = items[0].requestErrorMessages[0].split("\n")[0];
      const errorKey = items[0].error || "Unknown Error";
      const errorDescription =
        items[0].errorDescription || "No description available";

      throw new Error(
        `Reason: ${errorReason} | Key: ${errorKey} | Description: ${errorDescription}`
      );
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);

      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      let formattedDate = date.toLocaleDateString("en-GB", options);

      const day = date.getDate();
      const suffix =
        day % 10 === 1 && day !== 11
          ? "st"
          : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

      formattedDate = formattedDate.replace(/\d+/, `${day}${suffix}`);

      return formattedDate;
    };

    items.forEach((item) => {
      const formattedDate = formatDate(item.timestamp);

      const detectedType = normalizeType(
        item.caption,
        driverKeywords,
        hybridKeywords,
        ironsKeywords,
        woodKeywords
      );

      if (detectedType === null) return;
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

    console.log("Results: ", results);

    console.log("Starting to insert scraped datas...");
    await insertScrapedData(username, results);

    // TO TEST AND SEE THE OUTPUT
    // fs.writeFileSync("output.json", JSON.stringify(results, null, 2), "utf-8");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default instagram;

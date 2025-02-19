import { config } from "dotenv";
import { ApifyClient } from "apify-client";
import fs from "fs";
config();

const client = new ApifyClient({
  token: process.env.APIFY_PERSONAL_TOKEN,
});

const priceKeywords = ["harga", "price", "idr", "rp"];
const driverKeywords = ["driver", "drivers"];
const woodKeywords = [
  "wood",
  "fairway wood",
  "fairway woods",
  "fairwaywoods",
  "fairwaywood",
];
const hybridKeywords = ["rescue", "hybrid"];
const ironsKeywords = [
  "irons",
  "iron",
  "ironset",
  "iron set",
  "ironsets",
  "iron sets",
];

const clubModels = {
  Taylormade: [
    "Qi10",
    "Qi10 Max",
    "Stealth 2",
    "Stealth",
    "SIM 2",
    "SIM 2 Max",
    "SIM",
    "SIM Max",
    "P790 (2023)",
    "P790 (2021)",
    "SIM Max OS",
  ],
  Titleist: [
    "GT2",
    "GT3",
    "TSR1",
    "TSR2",
    "TSR3",
    "T100",
    "T150",
    "T200",
    "T350",
    "T100S",
    "T300",
    "TS1",
    "TS2",
    "TS3",
    "TSi1",
    "TSi2",
    "TSi3",
  ],
  PING: [
    "G425",
    "G430 Max",
    "G430 Max 10K",
    "i530",
    "G730",
    "G430",
    "i230",
    "i525",
    "i59",
  ],
  Callaway: [
    "Paradym Ai Smoke Max",
    "Paradym Ai Smoke Max D",
    "Paradym Ai Smoke Max Fast",
    "Paradym",
    "Paradym X",
    "Rogue ST MAX",
    "Rogue ST MAX D",
    "Epic Speed",
    "Epic MAX",
    "Mavrik",
    "Mavrik 22",
    "Mavrik Max",
    "Apex 21",
    "Apex Pro 21",
    "X-Forged CB",
  ],
  Mizuno: [
    "Pro 241",
    "Pro 243",
    "Pro 245",
    "JPX923 Hot Metal",
    "JPX923 Hot Metal Pro",
    "JPX923 Forged",
    "JPX923 Tour",
    "Pro 221",
    "Pro 223",
    "Pro 225",
    "JPX921 Hot Metal",
    "JPX921 Hot Metal Pro",
    "JPX921 Forged",
    "JPX921 Tour",
  ],
  Cobra: [
    "Darkspeed X",
    "Darkspeed Max",
    "AeroJet",
    "AeroJet Max",
    "LTDx",
    "LTDx Max",
    "Radspeed",
    "Radspeed XB",
    "Radspeed XD",
    "King Forged Tec",
    "King Forged Tec One Length",
    "King Forged Tec Copper",
  ],
};

const normalizeType = (caption) => {
  const lowerCaption = caption.toLowerCase();
  if (driverKeywords.some((word) => lowerCaption.includes(word)))
    return "Driver";
  if (woodKeywords.some((word) => lowerCaption.includes(word))) return "FW";
  if (hybridKeywords.some((word) => lowerCaption.includes(word)))
    return "Hybrid";
  if (ironsKeywords.some((word) => lowerCaption.includes(word))) return "Irons";
  return "Unknown";
};

const extractPrice = (caption) => {
  const words = caption.split(/\s+/);
  let foundKeyword = false;

  for (const word of words) {
    if (priceKeywords.some((keyword) => word.toLowerCase().includes(keyword))) {
      foundKeyword = true; // Mark that a price-related keyword appeared
    } else if (foundKeyword) {
      // Extract the first numeric value found after a keyword
      const price = word.replace(/[^0-9]/g, "");
      if (price) return parseInt(price, 10);
    }
  }
  return null;
};

(async () => {
  console.log("Script is running...");
  const run = await client.actor(process.env.APIFY_ACTOR_ID).call({
    username: ["jakartagolfshop"],
    onlyPostsNewerThan: "2025-02-18",
  });

  console.log("Results from dataset");
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  items.forEach((item) => {
    const formattedDate = new Date(item.timestamp).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const detectedType = normalizeType(item.caption);
    const extractedPrice = extractPrice(item.caption);

    const results = [];

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
            price: extractedPrice
              ? extractedPrice
              : "Price Not Found",
          };

          console.log(data);
          results.push(data);
        }
      }
    }

    // TO TEST AND SEE THE OUTPUT
    fs.writeFileSync(
      "output.json",
      JSON.stringify(results, null, 2),
      "utf-8"
    );
  });
})();

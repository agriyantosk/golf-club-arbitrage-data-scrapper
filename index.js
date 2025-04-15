// node index instagram <shop>
// node index golfpartner ironset p7mc
// node index tokopedia

import golfPartner from "./script/golfPartner.js";
import instagram from "./script/instagram.js";
import tokopediaScraper from "./script/tokopediaManualSearch.js";

const script = process.argv[2];

const run = async () => {
  try {
    if (script === "instagram") {
      await instagram(process.argv[3]);
    } else if (script === "golfpartner") {
      await golfPartner(
        process.argv[3],
        process.argv[4],
        process.argv[5],
        process.argv[6],
        process.argv[7]
      );
    } else if (script === "tokopedia") {
      tokopediaScraper(
        // process.argv[3], // keyword
        process.argv[4], // page
        process.argv[5] // cell
      );
    } else {
      throw new Error("Invalid Script Input!");
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

run();

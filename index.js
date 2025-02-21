// node index instagram <shop>
// node index golfpartner ironset p7mc

import golfPartner from "./script/golfPartner.js";
import instagram from "./script/instagram.js";

const script = process.argv[2];

const run = async () => {
  try {
    if (script === "instagram") {
      await instagram(process.argv[3]);
    } else if (script === "golfpartner") {
      await golfPartner(process.argv[3], process.argv[4]);
    } else {
      throw new Error("Invalid Script Input!");
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

run();

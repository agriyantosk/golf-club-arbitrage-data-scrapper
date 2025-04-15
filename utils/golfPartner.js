export const extractFw = ($) => {
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
      return false;
    }
  });

  let result;

  switch (extractedText) {
    case "3W" || "15º":
      result = "FW 3";
      break;
    case "5W" || "18º":
      result = "FW 5";
      break;
    default:
      result = "UNKNOWN";
      break;
  }
  return result || "UNKNOWN";
};

export const extractIronset = ($) => {
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
  const validFormats = new Set(["4-P", "5-P"]);
  if (!validFormats.has(formattedOutput.normalize("NFKC"))) {
    return false;
  }
  return `Ironset (${formattedOutput.normalize("NFKC")})` || "UNKNOWN";
};

export const extractHybrid = ($) => {
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
      return false;
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
      result = "UNKNOWN";
      break;
  }
  return result || "UNKNOWN";
};

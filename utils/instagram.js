const extractIronSet = (caption) => {
  const ironPattern = /\b(\d+)(?:-(\d+))?\b|[PWS]/g;
  let matches = [...caption.matchAll(ironPattern)].map((match) =>
    match[2] ? `${match[1]}-${match[2]}` : match[1] || match[0]
  );

  if (matches.length > 1) {
    return `Ironset (${matches[0]}-${matches[matches.length - 1]})`;
  }
  return "UNKNOWN";
};

const extractHybrid = (caption) => {
  const lowerCaption = caption.toLowerCase();

  if (lowerCaption.includes("iron")) return null;

  const hybridPattern =
    /\b(?:hybrid|rescue|utility)?\s*(\d)\b|\b(\d)(?:hybrid|rescue|utility)\b/g;

  let matches = [...lowerCaption.matchAll(hybridPattern)].map((match) =>
    parseInt(match[1] || match[2])
  );
  let validHybrid = matches.find((num) => [2, 3, 4, 5].includes(num));

  if (validHybrid) return `Hybrid ${validHybrid}`;
  return "UNKNOWN";
};

const extractFW = (caption) => {
  const lowerCaption = caption.toLowerCase();

  if (!woodKeywords.some((word) => lowerCaption.includes(word))) return null;

  const fwPattern = /\b(\d)?\s?(?:wood|fairway\s?wood)\s?(\d)?\b/g;

  let matches = [...lowerCaption.matchAll(fwPattern)]
    .flatMap((match) => [match[1], match[2]])
    .filter(Boolean)
    .map((num) => parseInt(num));
  let validFW = matches.find((num) => num === 3 || num === 5);

  if (validFW) return `FW ${validFW}`;
  return "UNKNOWN";
};

export const normalizeType = (
  caption,
  driverKeywords,
  woodKeywords,
  hybridKeywords,
  ironsKeywords
) => {
  const lowerCaption = caption.toLowerCase();

  if (driverKeywords.some((word) => lowerCaption.includes(word)))
    return "Driver";
  if (woodKeywords.some((word) => lowerCaption.includes(word)))
    return extractFW(lowerCaption);
  if (hybridKeywords.some((word) => lowerCaption.includes(word)))
    return extractHybrid(lowerCaption);
  if (ironsKeywords.some((word) => lowerCaption.includes(word)))
    return extractIronSet(lowerCaption);

  return "Unknown";
};
export const extractPrice = (caption, priceKeywords) => {
  const words = caption.split(/\s+/);
  let foundKeyword = false;

  for (const word of words) {
    if (soldKeywords.some((sold) => word.toLowerCase().includes(sold))) {
      return 0;
    }
  }

  for (const word of words) {
    if (priceKeywords.some((keyword) => word.toLowerCase().includes(keyword))) {
      foundKeyword = true;
    } else if (foundKeyword) {
      const price = word.replace(/[^0-9]/g, "");
      if (price) return parseInt(price, 10);
    }
  }
  return null;
};

export const extractCondition = (
  caption,
  usedKeywords,
  newKeywords,
  soldKeywords
) => {
  const lowerCaption = caption.toLowerCase();
  const conditionPattern = /\b\d+(\.\d+)?\/\d+\b/;

  if (soldKeywords.some((word) => lowerCaption.includes(word))) {
    return "SOLD";
  } else if (newKeywords.some((word) => lowerCaption.includes(word))) {
    return "NEW";
  } else if (
    usedKeywords.some((word) => lowerCaption.includes(word)) ||
    conditionPattern.test(lowerCaption)
  ) {
    return "USED";
  } else {
    return "UNKNOWN";
  }
};

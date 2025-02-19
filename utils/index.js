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
  if (woodKeywords.some((word) => lowerCaption.includes(word))) return "FW";
  if (hybridKeywords.some((word) => lowerCaption.includes(word)))
    return "Hybrid";
  if (ironsKeywords.some((word) => lowerCaption.includes(word))) return "Irons";
  return "Unknown";
};

export const extractPrice = (caption, priceKeywords) => {
  const words = caption.split(/\s+/);
  let foundKeyword = false;

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

import axios from "axios";

export async function translateText(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await axios.get(url);
    const translation = response.data[0][0][0];
    const formattedTranslation =
      translation.charAt(0).toUpperCase() + translation.slice(1).toLowerCase();
      
    return formattedTranslation;
  } catch (error) {
    console.error("Error translating text:", error);
  }
}

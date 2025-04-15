# Golf Club Arbitrage Data Scrapper

## 📖 Project Motivaiton & Background

This project started as an attempt to turn a holiday trip to Japan into a potential side hustle. While planning, I noticed a significant price gap in secondhand golf clubs between Japan and Indonesia. With a solid understanding of golf equipment and how the market behaves, I saw an opportunity worth exploring.

To validate the idea, I built a system to scrape and analyze golf club listings from both countries. The goal was to identify products with the highest profit potential based on real-time pricing and demand data.

## 🔎 Research

While diving deeper into the research, I came across **Golf Partner**, the largest secondhand golf club retailer in Japan. Given its scale and inventory, I decided to use it as my primary data source. I developed a script to scrape relevant information, focusing on a curated list of golf clubs that I manually selected based on my own hypotheses regarding market demand.

On the Indonesian side, I observed that most secondhand golf club transactions happen through **Tokopedia** (one of the country’s largest e-commerce platforms) and **Instagram**. To get a comprehensive view of the market, I built additional scripts to collect data from both platforms and set up comparison metrics to evaluate pricing and demand across these channels.

## ⚒️ Design & Technical Development

The foundation of this project lies in combining market intuition with data-driven validation. To make fair comparisons across platforms, I first designed a research framework that included:

- **Pricing Metrics**: Profit potential was calculated based on absolute margin in Indonesian Rupiah rather than percentage, ensuring the final decision accounted for practical returns after transaction costs and baggage fees.
- **Demand Estimation**: Although data on buyer interest was limited, I used proxies such as **“sold”** labels or listing removals to assess product demand across marketplaces.
- **Travel Constraints**: Baggage weight limits and airline fees were factored in to calculate a realistic minimum profit margin per unit.

Once the framework was set, I built custom scrapers for each data source:

- Golf Partner (Japan) – A JavaScript-based script was developed to scrape product names, prices, conditions, and specifications, utilizing **Cheerio** for HTML data extraction.
- Tokopedia (Indonesia) – Leveraged **Puppeteer** to extract listing data and pricing from relevant secondhand golf club listings.
- Instagram – Utilized **Apify** to monitor seller accounts and scrape engagement data and pricing from post captions on each matching items.

All collected data was pushed into **Google Sheets**, enabling live processing, filtering, and visualization of insights. With this setup, I was able to compare multiple product listings side-by-side and rank them using both profit and demand criteria.

To identify the **top 20 most investable golf clubs**, I followed a multi-step filtering process:

1. First, I extracted **the top 50 items with the highest profit margins** (in absolute IDR).
2. Separately, I compiled the **top 50 items with the strongest demand signals**, judged by whether the product had sold or was no longer listed.
3. Finally, I **cross-referenced both lists and selected the top 20 clubs that appeared in both**, under the assumption that they represented the best balance between market demand and profitability.

This approach helped ensure that I wasn’t just targeting high-margin products, but also those with actual buyer interest—resulting in a more realistic and risk-conscious investment strategy.

## 🏃 How To Run the Script

Below are the commands used to scrape data from each platform. Make sure to install all necessary dependencies and set up your environment variables (if any) before running.

### Clone & Install

To get started, clone this repository to your local machine:

```bash
git clone <repository_url>
cd <project_directory>
```

Install the necessary dependencies:

```bash
npm install
```

### Env Setup

Before running the scripts, you need to set up the environment variables. Copy the .env.sample file and rename it to .env:

```bash
cp .env.sample .env
```

Then, open the .env file and add the following required values:

- APIFY_PERSONAL_TOKEN

  Your Apify personal token (Get it from your Apify account).

- APIFY_ACTOR_ID

  Your Apify Actor ID (You can find this in the URL when running an actor on Apify).

- GOOGLE_SHEET_ID

  The ID of your Google Sheet where the scraped data will be saved. The sheet ID is part of the URL when you open your Google Sheet (e.g., https://docs.google.com/spreadsheets/d/<GOOGLE_SHEET_ID>/edit).

### 📦 Golf Partner (Japan)

Use this command to scrape data from Golf Partner.

```bash
node index golfpartner <golf_clubs_category> <keywords> <page> <google_sheets_startin_row>
```

Parameters:

- `<golf_clubs_category>`

The category of golf clubs to scrape. Must be one of the predefined options below:

```bash
export const filters = {
  driver: "h010001",
  fw: "h010002",       // Fairway Woods
  ironset: "h010004",
  hybrid: "h010003",
};
```

- `<keywords>`

The target product keyword(s) you want to search for. Example: "radspeed 5w".

- `<page>`

The starting page number from Golf Partner’s website (optional).
Use "" to start from page 1.

- `<google_sheets_starting_row>`

The row number where new data should be injected in the Japan Research sheet.
Data will be written starting from column C, which is hardcoded in the script.

### 🛒 Tokopedia (Indonesia)

Instead of inputting each item manually like in the Golf Partner script, this Tokopedia script automates the process. It loops through all the targeted golf clubs listed in:

```
/constant/productKeywords.js
```

Command:

```bash
node index tokopedia
```

This batch approach improves efficiency, ensuring the scraper pulls listings for all relevant products in one run.

### 📷 Instagram

This scraper utilizes **Apify** to gather data from Instagram. Ensure that your **Apify account** and **actor setup** are properly configured before running the script. You can trigger the script either through the **Apify API** or directly from the **Apify platform dashboard**.

Command:

```bash

node index instagram <username>

```

Parameters:

- `<username>`

  The **Instagram username** of the local secondhand golf club seller you want to scrape. This can be a business or personal account in Indonesia selling golf clubs.

## 🔗 Data Access

You can view the full dataset, formulas, and final analysis here:

📂 Google Sheets: [Golf Club Data Analysis](https://docs.google.com/spreadsheets/d/1o_UqbR6kNFvR9ti0eexH7PuOAcT41L0Ri5Z3f8KSF2c/edit?usp=sharing)

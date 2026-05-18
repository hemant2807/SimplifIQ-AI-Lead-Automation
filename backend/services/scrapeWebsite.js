const axios = require("axios");
const cheerio = require("cheerio");

const scrapeWebsite = async (url) => {
  try {
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    const title = $("title").text();

    const metaDescription = $('meta[name="description"]').attr("content");

    const headings = [];

    $("h1, h2").each((i, el) => {
      headings.push($(el).text().trim());
    });

    const paragraphs = [];

    $("p").each((i, el) => {
      const text = $(el).text().trim();

      if (text.length > 20) {
        paragraphs.push(text);
      }
    });

    return {
      title,
      metaDescription,
      headings: headings.slice(0, 10),
      paragraphs: paragraphs.slice(0, 10),
    };
  } catch (error) {
    console.log("Scraping error:", error.message);

    return null;
  }
};

module.exports = scrapeWebsite;

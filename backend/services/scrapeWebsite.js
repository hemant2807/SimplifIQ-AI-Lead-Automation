const axios = require("axios");
const cheerio = require("cheerio");

const normaliseUrl = (url) => {
  if (!url) return null;
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
};

const dedupe = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    const key = item.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const isBoilerplate = (text) => {
  const lower = text.toLowerCase();
  const boilerplatePatterns = [
    /^(home|about|contact|privacy|terms|cookie|sign in|log in|menu|search)$/,
    /all rights reserved/,
    /©\s?\d{4}/,
    /subscribe to our newsletter/i,
    /click here/i,
    /read more/i,
  ];
  return boilerplatePatterns.some((p) => p.test(lower));
};

const detectTechStack = ($) => {
  const tech = new Set();
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src.includes("wp-content") || src.includes("wp-includes"))
      tech.add("WordPress");
    if (src.includes("shopify")) tech.add("Shopify");
    if (src.includes("webflow")) tech.add("Webflow");
    if (src.includes("squarespace")) tech.add("Squarespace");
    if (src.includes("wix")) tech.add("Wix");
    if (src.includes("hubspot")) tech.add("HubSpot");
    if (src.includes("intercom")) tech.add("Intercom");
    if (src.includes("gtm") || src.includes("googletagmanager"))
      tech.add("Google Tag Manager");
    if (src.includes("analytics")) tech.add("Google Analytics");
    if (src.includes("hotjar")) tech.add("Hotjar");
    if (src.includes("stripe")) tech.add("Stripe");
    if (src.includes("crisp")) tech.add("Crisp Chat");
    if (src.includes("drift")) tech.add("Drift");
  });

  if ($('meta[name="generator"]').length) {
    const gen = $('meta[name="generator"]').attr("content") || "";
    if (gen) tech.add(gen.split(" ")[0]);
  }

  return [...tech];
};

const extractSocialLinks = ($) => {
  const patterns = {
    Twitter: /twitter\.com\//,
    LinkedIn: /linkedin\.com\//,
    Facebook: /facebook\.com\//,
    Instagram: /instagram\.com\//,
    YouTube: /youtube\.com\//,
    TikTok: /tiktok\.com\//,
    GitHub: /github\.com\//,
  };

  const found = {};
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const [name, pattern] of Object.entries(patterns)) {
      if (pattern.test(href) && !found[name]) {
        found[name] = href;
      }
    }
  });

  return found;
};

const extractContactInfo = ($, bodyText) => {
  const emailMatch = bodyText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = bodyText.match(/(\+?\d[\d\s\-().]{7,}\d)/);

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    hasContactPage: $('a[href*="contact"]').length > 0,
  };
};

const scrapeWebsite = async (rawUrl) => {
  const url = normaliseUrl(rawUrl);
  if (!url) {
    console.warn("scrapeWebsite: invalid URL provided");
    return buildFallback(rawUrl, "Invalid URL");
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  let html;
  try {
    const response = await axios.get(url, {
      headers,
      timeout: 12000,
      maxRedirects: 5,
    });
    html = response.data;
  } catch (err) {
    console.warn(`scrapeWebsite: HTTP error for ${url} — ${err.message}`);
    return buildFallback(url, err.message);
  }

  try {
    const $ = cheerio.load(html);

    const title = $("title").text().trim() || "";
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    const ogData = {
      title: $('meta[property="og:title"]').attr("content")?.trim() || "",
      description:
        $('meta[property="og:description"]').attr("content")?.trim() || "",
      image: $('meta[property="og:image"]').attr("content")?.trim() || "",
      type: $('meta[property="og:type"]').attr("content")?.trim() || "",
      siteName:
        $('meta[property="og:site_name"]').attr("content")?.trim() || "",
      twitterCard: $('meta[name="twitter:card"]').attr("content")?.trim() || "",
      twitterTitle:
        $('meta[name="twitter:title"]').attr("content")?.trim() || "",
    };

    const headings = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 3 && text.length < 200) headings.push(text);
    });

    const paragraphs = [];
    $("p, li, span, div").each((_, el) => {
      const text = $(el)
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (
        text.length >= 40 &&
        text.length <= 800 &&
        !isBoilerplate(text) &&
        !/[<>{}]/.test(text)
      ) {
        paragraphs.push(text);
      }
    });

    const bodyText = $("body").text().replace(/\s+/g, " ");

    return {
      url,
      title,
      metaDescription,
      ogData,
      headings: dedupe(headings).slice(0, 12),
      paragraphs: dedupe(paragraphs).slice(0, 15),
      techStack: detectTechStack($),
      socialLinks: extractSocialLinks($),
      contactInfo: extractContactInfo($, bodyText),
      scrapedAt: new Date().toISOString(),
      scrapeSuccess: true,
    };
  } catch (parseErr) {
    console.warn(`scrapeWebsite: parse error — ${parseErr.message}`);
    return buildFallback(url, parseErr.message);
  }
};

const buildFallback = (url, reason) => ({
  url: url || "unknown",
  title: "",
  metaDescription: "",
  ogData: {},
  headings: [],
  paragraphs: [],
  techStack: [],
  socialLinks: {},
  contactInfo: {},
  scrapedAt: new Date().toISOString(),
  scrapeSuccess: false,
  scrapeError: reason,
});

module.exports = scrapeWebsite;

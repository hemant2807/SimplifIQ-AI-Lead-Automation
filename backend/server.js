const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const scrapeWebsite = require("./services/scrapeWebsite");
const generateInsights = require("./services/generateInsights");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/api/lead", async (req, res) => {
  try {
    const { website } = req.body;

    console.log("Lead received:");
    console.log(req.body);

    const scrapedData = await scrapeWebsite(website);

    console.log("Scraped data:");
    console.log(scrapedData);

    const insights = await generateInsights(scrapedData);
    console.log("AI Insights:");
    console.log(insights);

    res.json({
      success: true,
      scrapedData,
      insights,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

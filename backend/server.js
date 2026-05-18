const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const scrapeWebsite = require("./services/scrapeWebsite");
const generateInsights = require("./services/generateInsights");
const generatePdf = require("./services/generatePdf");
const sendEmail = require("./services/sendEmail");
const logToSheets = require("./services/logToSheets");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const validateLeadPayload = ({ name, email, company, website }) => {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("name is required and must be at least 2 characters");
  }

  if (!email || typeof email !== "string") {
    errors.push("email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("email is not a valid address");
  }

  if (!company || typeof company !== "string" || company.trim().length < 1) {
    errors.push("company name is required");
  }

  if (!website || typeof website !== "string" || website.trim().length < 3) {
    errors.push("website is required");
  }

  return errors;
};

const ok = (res, data = {}) => res.status(200).json({ success: true, ...data });

const fail = (res, statusCode, message, details = null) => {
  const payload = { success: false, message };
  if (details) payload.details = details;
  return res.status(statusCode).json(payload);
};

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "AI Audit API", version: "1.0.0" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/api/lead", async (req, res) => {
  const validationErrors = validateLeadPayload(req.body);
  if (validationErrors.length > 0) {
    return fail(res, 400, "Invalid request data", validationErrors);
  }

  const leadData = {
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    company: req.body.company.trim(),
    website: req.body.website.trim(),
  };

  console.log(`[Lead] Processing: ${leadData.company} <${leadData.email}>`);

  let scrapedData = null;
  try {
    scrapedData = await scrapeWebsite(leadData.website);
    if (!scrapedData?.scrapeSuccess) {
      console.warn(
        `[Scrape] Partial failure for ${leadData.website}: ${scrapedData?.scrapeError}`,
      );
    } else {
      console.log(`[Scrape] Success: ${scrapedData.title || leadData.website}`);
    }
  } catch (scrapeErr) {
    console.error(`[Scrape] Unexpected error: ${scrapeErr.message}`);
  }

  let insights = null;
  try {
    insights = await generateInsights(scrapedData || { url: leadData.website });
    if (!insights || insights.trim().length < 50) {
      throw new Error("Insights response was empty or too short");
    }
    console.log(`[Insights] Generated (${insights.length} chars)`);
  } catch (insightsErr) {
    console.error(`[Insights] Error: ${insightsErr.message}`);
    insights =
      "## Analysis Unavailable\n\nOur AI engine encountered an issue generating your personalized report. Our team has been notified and will follow up with your audit manually.";
  }

  let pdfPath = null;
  try {
    pdfPath = await generatePdf(leadData, insights);
    if (!pdfPath) throw new Error("generatePdf returned null");
    console.log(`[PDF] Generated: ${pdfPath}`);
  } catch (pdfErr) {
    console.error(`[PDF] Error: ${pdfErr.message}`);
  }

  let emailStatus = null;
  try {
    emailStatus = await sendEmail(leadData, pdfPath);
    console.log(`[Email] Status: ${JSON.stringify(emailStatus)}`);
  } catch (emailErr) {
    console.error(`[Email] Error: ${emailErr.message}`);
    emailStatus = { sent: false, error: emailErr.message };
  }

  try {
    await logToSheets(req.body, emailStatus ? "Sent" : "Failed");
    console.log(`[Sheets] Lead logged successfully`);
  } catch (sheetsErr) {
    console.error(`[Sheets] Error: ${sheetsErr.message}`);
  }

  return ok(res, {
    message: "Audit report generated successfully",
    lead: {
      name: leadData.name,
      email: leadData.email,
      company: leadData.company,
    },
    scrapeSuccess: scrapedData?.scrapeSuccess ?? false,
    pdfGenerated: !!pdfPath,
    emailSent: emailStatus?.sent ?? false,
    ...(process.env.NODE_ENV !== "production" && { insights, scrapedData }),
  });
});

app.use((_req, res) => {
  fail(res, 404, "Route not found");
});

app.use((err, _req, res, _next) => {
  console.error(`[Unhandled Error] ${err.stack || err.message}`);
  fail(res, 500, "An unexpected server error occurred");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});

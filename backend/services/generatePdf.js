const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generatePdf = async (leadData, insights) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
              line-height: 1.6;
            }

            h1 {
              color: #4f46e5;
              margin-bottom: 10px;
            }

            h2 {
              margin-top: 30px;
              color: #222;
            }

            .section {
              margin-bottom: 24px;
            }

            .footer {
              margin-top: 50px;
              font-size: 12px;
              color: #666;
            }

            .badge {
              display: inline-block;
              background: #eef2ff;
              color: #4338ca;
              padding: 6px 12px;
              border-radius: 999px;
              font-size: 12px;
              margin-bottom: 20px;
            }
          </style>
        </head>

        <body>
          <div class="badge">
            AI-Powered Business Audit
          </div>

          <h1>${leadData.company}</h1>

          <p>
            Personalized growth and automation insights
            generated using AI analysis.
          </p>

          <div class="section">
            <h2>Company Information</h2>

            <p>
              <strong>Name:</strong> ${leadData.name}
            </p>

            <p>
              <strong>Email:</strong> ${leadData.email}
            </p>

            <p>
              <strong>Website:</strong> ${leadData.website}
            </p>
          </div>

          <div class="section">
            <h2>AI Business Analysis</h2>

            <div>
              ${insights.replace(/\n/g, "<br/>")}
            </div>
          </div>

          <div class="footer">
            Generated automatically using OpenAI +
            web analysis.
          </div>
        </body>
      </html>
    `;

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    const fileName = `${leadData.company.replace(/\s+/g, "_")}_report.pdf`;

    const filePath = path.join(__dirname, "../reports", fileName);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return filePath;
  } catch (error) {
    console.log("PDF Error:", error.message);

    return null;
  }
};

module.exports = generatePdf;

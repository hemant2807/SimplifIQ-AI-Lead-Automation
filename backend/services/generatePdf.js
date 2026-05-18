const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generatePdf = async (leadData, insights) => {
  try {
    const reportsDir = path.join(__dirname, "../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const formatInsights = (text) => {
      return text
        .replace(/^#{1}\s(.+)$/gm, '<h2 class="section-heading">$1</h2>')
        .replace(/^#{2}\s(.+)$/gm, '<h3 class="sub-heading">$1</h3>')
        .replace(/^#{3}\s(.+)$/gm, '<h4 class="minor-heading">$1</h4>')
        .replace(/^\*\*(.+?)\*\*/gm, "<strong>$1</strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^\*\s(.+)$/gm, '<li class="insight-li">$1</li>')
        .replace(/^-\s(.+)$/gm, '<li class="insight-li">$1</li>')
        .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="insight-list">$1</ul>')
        .replace(/<\/ul>\s*<ul class="insight-list">/g, "")
        .replace(/\n{2,}/g, '</p><p class="insight-para">')
        .replace(/^(?!<[hup])(.+)$/gm, '<p class="insight-para">$1</p>')
        .replace(/<p class="insight-para"><\/p>/g, "");
    };

    const formattedInsights = formatInsights(
      insights || "No insights available.",
    );
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${leadData.company} — Business Audit Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --indigo:    #4f46e5;
      --indigo-dk: #3730a3;
      --indigo-lt: #eef2ff;
      --violet:    #7c3aed;
      --slate-900: #0f172a;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-500: #64748b;
      --slate-300: #cbd5e1;
      --slate-100: #f1f5f9;
      --white:     #ffffff;
      --green:     #10b981;
      --amber:     #f59e0b;
    }

    html, body {
      font-family: 'Inter', Arial, sans-serif;
      background: var(--white);
      color: var(--slate-800);
      font-size: 11px;
      line-height: 1.65;
    }

    /* ── PAGE WRAPPER ── */
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      padding: 0;
    }

    /* ── HERO ── */
    .hero {
      background: linear-gradient(135deg, var(--slate-900) 0%, #1e1b4b 50%, var(--indigo-dk) 100%);
      padding: 48px 52px 40px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 260px; height: 260px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -40px; left: 30px;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.85);
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .hero-badge::before {
      content: '✦';
      color: #a78bfa;
    }

    .hero-company {
      font-size: 32px;
      font-weight: 800;
      color: var(--white);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      line-height: 1.15;
    }

    .hero-tagline {
      font-size: 13px;
      color: rgba(255,255,255,0.65);
      font-weight: 400;
      margin-bottom: 28px;
    }

    .hero-meta {
      display: flex;
      gap: 28px;
      flex-wrap: wrap;
    }
    .hero-meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hero-meta-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
    }
    .hero-meta-value {
      font-size: 11px;
      color: rgba(255,255,255,0.85);
      font-weight: 500;
    }

    /* ── DIVIDER BAR ── */
    .gradient-bar {
      height: 4px;
      background: linear-gradient(90deg, var(--indigo) 0%, var(--violet) 50%, #ec4899 100%);
    }

    /* ── BODY CONTENT ── */
    .content {
      padding: 36px 52px 48px;
    }

    /* ── OVERVIEW ROW ── */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .overview-card {
      background: var(--slate-100);
      border: 1px solid var(--slate-300);
      border-radius: 10px;
      padding: 16px 18px;
    }
    .overview-card-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--slate-500);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .overview-card-value {
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-800);
      word-break: break-all;
    }

    /* ── SECTION CARDS ── */
    .section-card {
      background: var(--white);
      border: 1px solid var(--slate-300);
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .section-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--slate-100);
      background: linear-gradient(90deg, #fafafa 0%, var(--white) 100%);
    }
    .section-card-icon {
      width: 28px; height: 28px;
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      flex-shrink: 0;
    }
    .icon-blue   { background: #dbeafe; }
    .icon-violet { background: #ede9fe; }
    .icon-green  { background: #d1fae5; }
    .icon-amber  { background: #fef3c7; }
    .icon-rose   { background: #ffe4e6; }

    .section-card-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--slate-800);
      letter-spacing: -0.01em;
    }
    .section-card-subtitle {
      font-size: 10px;
      color: var(--slate-500);
      margin-left: auto;
    }

    .section-card-body {
      padding: 18px 20px;
    }

    /* ── INSIGHT TYPOGRAPHY ── */
    .section-heading {
      font-size: 14px;
      font-weight: 700;
      color: var(--indigo-dk);
      margin: 18px 0 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--indigo-lt);
    }
    .sub-heading {
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-700);
      margin: 14px 0 6px;
    }
    .minor-heading {
      font-size: 11px;
      font-weight: 600;
      color: var(--slate-600);
      margin: 10px 0 4px;
    }
    .insight-para {
      font-size: 11px;
      color: var(--slate-700);
      margin-bottom: 8px;
      line-height: 1.7;
    }
    .insight-list {
      list-style: none;
      margin: 6px 0 10px;
      padding: 0;
    }
    .insight-li {
      font-size: 11px;
      color: var(--slate-700);
      padding: 3px 0 3px 16px;
      position: relative;
      line-height: 1.6;
    }
    .insight-li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: var(--indigo);
      font-size: 9px;
      top: 4px;
    }

    /* ── SCORE PILLS ── */
    .score-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 10px 0 0;
    }
    .score-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--indigo-lt);
      border: 1px solid #c7d2fe;
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 10px;
      font-weight: 600;
      color: var(--indigo-dk);
    }
    .score-pill .dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--indigo);
    }

    /* ── FOOTER ── */
    .footer {
      background: var(--slate-900);
      padding: 20px 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-brand {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .footer-meta {
      font-size: 9px;
      color: rgba(255,255,255,0.35);
    }
    .footer-badge {
      background: linear-gradient(90deg, var(--indigo), var(--violet));
      color: white;
      font-size: 9px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      letter-spacing: 0.04em;
    }

    /* Print safety */
    @media print {
      .page { width: 100%; }
      .section-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HERO -->
  <div class="hero">
    <div class="hero-badge">AI-Powered Business Audit</div>
    <div class="hero-company">${leadData.company}</div>
    <div class="hero-tagline">Personalized growth &amp; automation intelligence report</div>
    <div class="hero-meta">
      <div class="hero-meta-item">
        <span class="hero-meta-label">Contact</span>
        <span class="hero-meta-value">${leadData.name}</span>
      </div>
      <div class="hero-meta-item">
        <span class="hero-meta-label">Email</span>
        <span class="hero-meta-value">${leadData.email}</span>
      </div>
      <div class="hero-meta-item">
        <span class="hero-meta-label">Website</span>
        <span class="hero-meta-value">${leadData.website}</span>
      </div>
      <div class="hero-meta-item">
        <span class="hero-meta-label">Report Date</span>
        <span class="hero-meta-value">${reportDate}</span>
      </div>
    </div>
  </div>

  <!-- GRADIENT BAR -->
  <div class="gradient-bar"></div>

  <!-- BODY -->
  <div class="content">

    <!-- OVERVIEW CARDS -->
    <div class="overview-grid">
      <div class="overview-card">
        <div class="overview-card-label">Company</div>
        <div class="overview-card-value">${leadData.company}</div>
      </div>
      <div class="overview-card">
        <div class="overview-card-label">Website</div>
        <div class="overview-card-value">${leadData.website}</div>
      </div>
      <div class="overview-card">
        <div class="overview-card-label">Report Type</div>
        <div class="overview-card-value">Full AI Business Audit</div>
      </div>
    </div>

    <!-- AI ANALYSIS CARD -->
    <div class="section-card">
      <div class="section-card-header">
        <div class="section-card-icon icon-violet">🤖</div>
        <div class="section-card-title">AI Business Analysis</div>
        <div class="section-card-subtitle">Powered by Gemini AI</div>
      </div>
      <div class="section-card-body">
        ${formattedInsights}
      </div>
    </div>

    <!-- SCORE PILLS ROW -->
    <div class="score-row">
      <div class="score-pill"><span class="dot"></span>AI Analysis Complete</div>
      <div class="score-pill"><span class="dot"></span>Website Scanned</div>
      <div class="score-pill"><span class="dot"></span>Growth Mapped</div>
      <div class="score-pill"><span class="dot"></span>Automation Assessed</div>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-brand">AI Audit Pro</div>
    <div class="footer-meta">Confidential · Generated ${reportDate} · For ${leadData.company}</div>
    <div class="footer-badge">✦ Premium Report</div>
  </div>

</div>
</body>
</html>`;

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const safeCompanyName = (leadData.company || "company")
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 60);

    const fileName = `${safeCompanyName}_audit_report.pdf`;
    const filePath = path.join(reportsDir, fileName);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    await browser.close();
    console.log(`✅ PDF generated: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("PDF Error:", error.message);
    return null;
  }
};

module.exports = generatePdf;

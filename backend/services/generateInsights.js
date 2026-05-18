const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInsights = async (scrapedData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const websiteTitle = scrapedData?.title || "Unknown";
    const metaDescription = scrapedData?.metaDescription || "Not available";
    const headings = (scrapedData?.headings || []).join(" | ") || "None found";
    const paragraphSample = (scrapedData?.paragraphs || [])
      .slice(0, 5)
      .join(" ")
      .substring(0, 800);
    const ogData = scrapedData?.ogData
      ? JSON.stringify(scrapedData.ogData, null, 2)
      : "Not available";
    const techStack = scrapedData?.techStack || [];
    const socialLinks = scrapedData?.socialLinks || [];
    const contactInfo = scrapedData?.contactInfo || {};
    const companyName =
      scrapedData?.title?.split("|")[0]?.trim() || "this company";

    const prompt = `
You are a senior B2B growth consultant and digital strategy expert with 15+ years advising SaaS startups and service businesses. You write like McKinsey meets Y Combinator — precise, actionable, no filler.

Your task: Produce a premium, highly personalized business audit report for the company below. This report will be sent directly to the founder/CEO, so every insight must feel custom-built for their specific business — never generic.

---

WEBSITE INTELLIGENCE:
- Page Title: ${websiteTitle}
- Meta Description: ${metaDescription}
- Key Headings Found: ${headings}
- Sample Content: ${paragraphSample}
- Open Graph Data: ${ogData}
- Detected Tech/Tools: ${techStack.length > 0 ? techStack.join(", ") : "Not detected"}
- Social Presence: ${socialLinks.length > 0 ? socialLinks.join(", ") : "Not detected"}
- Contact Info: ${JSON.stringify(contactInfo)}

---

REPORT STRUCTURE (use these exact section headers with ## markdown):

## Company Overview
Write 2–3 sentences identifying what this company does, their apparent target market, and their value proposition based on the website content. Be specific — reference their actual language or product names.

## Website & Digital Presence Assessment
Evaluate their current digital footprint: homepage clarity, messaging strength, SEO signals, mobile/UX indicators, and trust signals (testimonials, case studies, certifications). Be direct about what's working and what's weak.

## Key Business Strengths
Identify 3–4 genuine competitive advantages evident from their positioning, content, or market approach. Frame these as assets to leverage — not empty praise.

## Growth Opportunities
Identify 3–5 specific, untapped growth levers for this business. Ground each one in what you observed on their site. Examples: content gaps, pricing model weaknesses, audience segments they're ignoring, conversion funnel holes, partnership opportunities. Be specific — avoid "improve your SEO" without context.

## AI & Automation Opportunities
Identify 4–6 concrete automation wins tailored to their business type. For each, name:
- The specific workflow or bottleneck
- The recommended AI/automation tool or approach
- The expected time or revenue impact
Think: lead qualification, customer onboarding, content generation, support automation, reporting, outreach personalization.

## Strategic Recommendations
3–4 prioritized recommendations the founder should act on in the next 90 days. Each should have:
- A clear action (not vague)
- Why it matters for this specific business
- Estimated effort level: Low / Medium / High

## Audit Summary
One sharp paragraph (5–7 sentences) that synthesizes the opportunity. Open with an honest assessment of where they are, identify the single biggest lever, and close with a forward-looking statement about their potential. Write this like you're speaking directly to the founder.

---

STYLE RULES:
- Do NOT use filler phrases like "In today's fast-paced digital landscape" or "leveraging synergies"
- Do NOT give identical advice that could apply to any business
- Write in confident, direct, modern business prose
- Use specific numbers/percentages where you can reasonably estimate them
- Keep each section tight — quality over length
- Use bullet points only within sections, never for section titles
- Reference actual content from their website wherever possible
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length < 100) {
      throw new Error("Gemini returned insufficient content");
    }

    return text;
  } catch (error) {
    console.error("Gemini Error:", error.message);

    return `## Company Overview
Unable to generate personalized AI insights for this report. This may be due to a temporary API issue.

## Next Steps
Please contact our team to receive your personalized audit manually. We apologize for the inconvenience.`;
  }
};

module.exports = generateInsights;

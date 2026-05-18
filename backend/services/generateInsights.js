const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInsights = async (scrapedData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert AI business consultant.

Analyze the following company information and generate a highly personalized business audit report.

Company Data:
${JSON.stringify(scrapedData, null, 2)}

Generate the following sections:

1. Company Overview
2. Key Strengths
3. Website/User Experience Observations
4. Growth Opportunities
5. AI & Automation Suggestions
6. Personalized Outreach Summary

Keep the tone professional, modern, insightful, and concise.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.log("Gemini Error:", error.message);
    return "Unable to generate AI insights.";
  }
};

module.exports = generateInsights;

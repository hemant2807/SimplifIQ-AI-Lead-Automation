const { google } = require("googleapis");

const logToSheets = async (leadData, status) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "google-service-account.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const spreadsheetId = "1ogmAz9OmuqnvJXQU-fXolgnuTDqK2R4p2aQORtzc6xc";

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            leadData.name,
            leadData.email,
            leadData.company,
            leadData.website,
            new Date().toLocaleString(),
            status,
          ],
        ],
      },
    });

    console.log("Lead logged to Google Sheets");
  } catch (error) {
    console.log("Google Sheets Error:", error.message);
  }
};

module.exports = logToSheets;

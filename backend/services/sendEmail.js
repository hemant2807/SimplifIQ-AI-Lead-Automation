const nodemailer = require("nodemailer");

const sendEmail = async (leadData, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: leadData.email,
      subject: `Personalized Business Audit for ${leadData.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${leadData.name},</h2>

          <p>
            Thank you for submitting your company details.
          </p>

          <p>
            We've generated a personalized AI-powered
            business audit report for ${leadData.company}.
          </p>

          <p>
            The report is attached to this email.
          </p>

          <br/>

          <p>
            Best regards,
          </p>

          <p>
            SimplifIQ AI Automation System
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${leadData.company}_report.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");

    return true;
  } catch (error) {
    console.log("Email Error:", error.message);

    return false;
  }
};

module.exports = sendEmail;

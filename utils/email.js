const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD, // MUST be an App Password
    },
  });

  const mailOptions = {
    from: "Gymspire <gymspire@gmail.com>",
    to: options.to, // ✅ FIXED
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", options.to);
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
};

module.exports = sendEmail;

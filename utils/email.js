const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log('before transport');
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD, // MUST be an App Password
    },
  });

  console.log('before mailoptions');
  const mailOptions = {
    from: "Gymspire <gymspire@gmail.com>",
    to: options.to, // ✅ FIXED
    subject: options.subject,
    text: options.message,
  };

  try {
    console.log('before email send');
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", options.to);
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
};

module.exports = sendEmail;

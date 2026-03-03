const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendEmail = async (options) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    console.log(apiKey);

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.textContent = options.message;
    sendSmtpEmail.sender = {
      name: "GymSpire",
      email: "gymspireproduction@gmail.com",
    };
    sendSmtpEmail.to = [{ email: options.to }];

    console.log(sendSmtpEmail.sender);

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent via Brevo");
  } catch (err) {
    console.error("❌ Brevo error:", err.response?.body || err.message);
    // DO NOT throw
  }
};

module.exports = sendEmail;

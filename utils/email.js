const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // NOTE: for development stage it is highly recommended to use fake email send (services?) to check if the email
    // functionality of this app is working: jUST use the generated username and password and host and port from there


    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            // The values of these env variables are just templates cuz we will use gmail for this project
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: 'Gymspire <gysmpire@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: // we will do this later (continue nodejs course)
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
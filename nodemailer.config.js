require('dotenv').config();

const nodemailer = require("nodemailer");
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.NODEMAILER_EMAIL, // generated ethereal user
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

module.exports.mailOptions = (to, subject, mailBody) => {
    return ({
        from: process.env.NODEMAILER_EMAIL,
        to,
        subject,
        html: mailBody
    });
};

require('dotenv').config();
const { transporter, mailOptions } = require('../../nodemailer.config');
const ejs = require('ejs');


const sendUserMail = async (order_id, platform_fee, fraction_price, title, subject, email, payment_order, payment_status, gas_transfer, nft_transfer, fraction_count, total_fraction, ira_token, gas_fee) => {

    const mailBody = await ejs.renderFile(ROOT_DIR + '/templates/' + '/invoice.ejs', { order_id, platform_fee, fraction_price, title, payment_order, payment_status, gas_transfer, nft_transfer, fraction_count, total_fraction, ira_token, gas_fee });

    const response = await transporter.sendMail(mailOptions(email, subject, mailBody));
    if (response instanceof Error) return response;
    return response;

}

module.exports = { sendUserMail };
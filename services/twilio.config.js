require('dotenv').config();
const axios = require("axios");

const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (message, to) => {
  return await client.messages.create({
    body: message,
    to: `+91${to}`,
    from: process.env.TWILIO_NUMBER
  }).catch(error => error);
};


/*Send Message Using Fast2SMS Message */

const sendMessage = async (otp, number) => {
  try {
    const response = await axios.get(`${process.env.FAST2SMS_API_URL}?authorization=${process.env.FAST2SMS_API_KEY}&&variables_values=${otp}&&route=otp&&numbers=${number}`, {
      headers: {
        "cache-control": "no-cache",
      }
    })

    if (response instanceof Error) {
      console.error(response.data);
    }
    else {
      // console.log(response.body)
    }
  } catch (error) {
    console.error(error?.message)
  }
}



module.exports = { sendSMS, sendMessage };
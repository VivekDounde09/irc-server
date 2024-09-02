require('dotenv').config();
const { default: axios } = require('axios');
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const createOrder = (property_id, user_id, amount) => {
    if (property_id && user_id && amount) {
        try {
            //INCREASE AMOUNT 
            const incAmount = 100;

            //meta
            const data = {
                "amount": amount * incAmount,
                "currency": "INR",
                "notes": {
                    "user_id": user_id,
                    "property_id": property_id
                }
            }

            //CREATE ORDER API
            var api_url = 'https://api.razorpay.com/v1/orders';
            var uname = process.env.RAZORPAY_API_KEY;
            var pass = process.env.RAZORPAY_SECRET_KEY;
            const response = axios.post(api_url, data, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username: uname,
                    password: pass
                }
            })

            return response;

        } catch (error) {
            return (false);
        }
    } else {
        return (false);
    }
}


const checkPaymentStatus = (razorpay_payment_id, razorpay_order_id, razorpay_signature) => {

    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
        const result = validatePaymentVerification({ "order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_SECRET_KEY);
        return result;
    } else {
        return result;
    }
}


module.exports = { createOrder, checkPaymentStatus };
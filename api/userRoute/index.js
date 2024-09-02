const express = require('express');

const AuthenticateSession = require('../middlewares/AuthenticateSession');
const ParseData = require('../middlewares/ParseData');
const upload = require('../../services/multer.config');

const router = express.Router();

const userController = require('./userController');
const adminController = require('../adminRoute/adminController');
const user = new userController;
const admin = new adminController;

/*Logout Route */
router.get('/logout', AuthenticateSession, user.logout);

/* Authentication */
router.get('/authenticate/:id/:address', user.authConsent)
router.post('/authenticate', admin.authUser);

/* Mobile Verifications */
router.post('/send-otp', AuthenticateSession, user.sendOtp);
router.post('/verify-otp', AuthenticateSession, user.verifyOtp);

router.post('/resend-mail-verification', AuthenticateSession, user.resendMailVerification)

/*Get and Update User Details */
router.get('/get-user-details', AuthenticateSession, user.getUserDetails);
router.post('/update-user-details', AuthenticateSession, user.updateUserDetails);


/*KYC Verification APIs */
router.post('/verify-pan-card', AuthenticateSession, user.verifyPanCard);
router.post('/generate-aadhar-otp', AuthenticateSession, user.generateAadharOtp);
router.post('/verify-aadhar', AuthenticateSession, user.verifyAadhar);


/*Bank Verifications */
router.post('/upload-cheque', upload.single('file'), AuthenticateSession, admin.uploadSingleAsset);
router.post('/add-bank-details', AuthenticateSession, user.addBankDetails);
router.get('/get-user-bank-details', AuthenticateSession, user.getuserBankDetails);
router.post('/update-bank-details', AuthenticateSession, user.updateBankDetails);


/*Payment */
router.post('/create-order', AuthenticateSession, user.createOrder);
router.post('/payment-status', AuthenticateSession, user.paymentStatus);


/*Buy Fraction Calculation */
router.post('/fraction-calculation', AuthenticateSession, user.fractionCalculation);


/*Buy Fraction */
router.post('/buy-fraction', AuthenticateSession, user.buyFraction);
router.post('/invoice-clearance', AuthenticateSession, user.invoiceClearance);


/*Request for Whitelisting */
router.get('/request-whitelisting', AuthenticateSession, user.requestWhiteListing);
router.get('/get-whitelist-user', AuthenticateSession, user.getWhitelistUser);


/*Get NFTs */
router.get('/get-user-nft', AuthenticateSession, user.getUserNFT);


/*Fraction Payment Request */
router.post('/add-fraction-payment-request', AuthenticateSession, user.addFractionPaymentRequest);
router.get('/verify-purchase-link/:hash', user.verifyPurchaseLink);
router.get('/purchase-fractions/:hash', AuthenticateSession, user.purchaseFractions);
router.get('/check-purchase-fraction', AuthenticateSession, user.checkPurchaseFraction);

module.exports = router;